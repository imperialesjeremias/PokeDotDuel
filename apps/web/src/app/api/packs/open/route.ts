import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { PackReward } from '../../../../types/shared';

interface DatabasePackReward {
  card_id: string;
  card_name: string;
  dex_number: number;
  rarity: string;
  is_shiny: boolean;
}

const OpenPackSchema = z.object({
  packId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const userId = token; // This should be extracted from JWT

    const body = await request.json();
    const validatedData = OpenPackSchema.parse(body);

    // Verify pack ownership
    const { data: pack, error: packError } = await supabase
      .from('packs')
      .select('id, buyer_id, opened')
      .eq('id', validatedData.packId)
      .single();

    if (packError) {
      if (packError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Pack not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching pack:', packError);
      return NextResponse.json(
        { error: 'Failed to fetch pack' },
        { status: 500 }
      );
    }

    if (pack.buyer_id !== userId) {
      return NextResponse.json(
        { error: 'You can only open your own packs' },
        { status: 403 }
      );
    }

    if (pack.opened) {
      return NextResponse.json(
        { error: 'Pack already opened' },
        { status: 400 }
      );
    }

    // Open pack using the database function
    const { data: rewards, error: openError } = await supabase
      .rpc('open_booster_pack', { pack_id: validatedData.packId }) as { data: DatabasePackReward[] | null, error: any };

    if (openError) {
      console.error('Error opening pack:', openError);
      return NextResponse.json(
        { error: 'Failed to open pack' },
        { status: 500 }
      );
    }

    if (!rewards) {
      return NextResponse.json(
        { error: 'No rewards found' },
        { status: 500 }
      );
    }

    // Record transaction for each card
    for (const reward of rewards) {
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          kind: 'PACK_REWARD',
          ref_id: reward.card_id,
          metadata: {
            pack_id: validatedData.packId,
            dex_number: reward.dex_number,
            rarity: reward.rarity,
            is_shiny: reward.is_shiny,
          },
        });
    }

    return NextResponse.json({
      success: true,
      rewards: rewards.map((reward: DatabasePackReward): PackReward => ({
        cardId: reward.card_id,
        cardName: reward.card_name,
        dexNumber: reward.dex_number,
        rarity: reward.rarity as 'COMMON' | 'RARE' | 'LEGENDARY',
        isShiny: reward.is_shiny,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid pack data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Pack opening error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
