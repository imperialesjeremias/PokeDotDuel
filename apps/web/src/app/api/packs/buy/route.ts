import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    const buyerId = token; // This should be extracted from JWT

    // In a real implementation, this would:
    // 1. Verify SOL payment on-chain
    // 2. Create pack record
    // 3. Request VRF
    // 4. Return pack ID for opening

    const packId = `pack_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const packPrice = 100_000_000; // 0.1 SOL

    // Create pack record
    const { data: pack, error } = await supabase
      .from('packs')
      .insert({
        id: packId,
        buyer_id: buyerId,
        payment_sig: 'mock_signature', // This would be the actual transaction signature
        opened: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pack:', error);
      return NextResponse.json(
        { error: 'Failed to create pack' },
        { status: 500 }
      );
    }

    // Record transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: buyerId,
        kind: 'PACK_PURCHASE',
        sol_lamports: packPrice,
        ref_id: packId,
        onchain_sig: 'mock_signature',
        metadata: {
          pack_id: packId,
        },
      });

    return NextResponse.json({
      success: true,
      pack: {
        id: pack.id,
        buyerId: pack.buyer_id,
        opened: pack.opened,
        createdAt: pack.created_at,
      },
    });
  } catch (error) {
    console.error('Pack purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
