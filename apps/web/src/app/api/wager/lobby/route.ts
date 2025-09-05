import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const CreateLobbySchema = z.object({
  bracketId: z.number().positive(),
  wagerLamports: z.number().positive(),
  inviteCode: z.string().optional(),
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
    const creatorId = token; // This should be extracted from JWT

    const body = await request.json();
    const validatedData = CreateLobbySchema.parse(body);

    // Verify bracket exists and wager is within range
    const { data: bracket, error: bracketError } = await supabase
      .from('wager_brackets')
      .select('min_lamports, max_lamports')
      .eq('id', validatedData.bracketId)
      .single();

    if (bracketError) {
      console.error('Error fetching bracket:', bracketError);
      return NextResponse.json(
        { error: 'Invalid bracket' },
        { status: 400 }
      );
    }

    if (validatedData.wagerLamports < bracket.min_lamports || 
        validatedData.wagerLamports > bracket.max_lamports) {
      return NextResponse.json(
        { error: 'Wager amount is outside bracket range' },
        { status: 400 }
      );
    }

    // Create lobby
    const { data: lobby, error } = await supabase
      .from('lobbies')
      .insert({
        bracket_id: validatedData.bracketId,
        creator_id: creatorId,
        wager_lamports: validatedData.wagerLamports,
        invite_code: validatedData.inviteCode,
        status: 'OPEN',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lobby:', error);
      return NextResponse.json(
        { error: 'Failed to create lobby' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      lobby: {
        id: lobby.id,
        bracketId: lobby.bracket_id,
        creatorId: lobby.creator_id,
        wagerLamports: lobby.wager_lamports,
        inviteCode: lobby.invite_code,
        status: lobby.status,
        createdAt: lobby.created_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid lobby data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Lobby creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bracketId = searchParams.get('bracketId');
    const status = searchParams.get('status') || 'OPEN';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('lobbies')
      .select(`
        id,
        bracket_id,
        creator_id,
        opponent_id,
        wager_lamports,
        status,
        created_at,
        wager_brackets!inner(
          name,
          min_lamports,
          max_lamports
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (bracketId) {
      query = query.eq('bracket_id', bracketId);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: lobbies, error } = await query;

    if (error) {
      console.error('Error fetching lobbies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lobbies' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      lobbies: lobbies.map(lobby => ({
        id: lobby.id,
        bracketId: lobby.bracket_id,
        creatorId: lobby.creator_id,
        opponentId: lobby.opponent_id,
        wagerLamports: lobby.wager_lamports,
        status: lobby.status,
        bracket: {
          name: lobby.wager_brackets.name,
          minLamports: lobby.wager_brackets.min_lamports,
          maxLamports: lobby.wager_brackets.max_lamports,
        },
        createdAt: lobby.created_at,
      })),
      pagination: {
        page,
        limit,
        hasMore: lobbies.length === limit,
      },
    });
  } catch (error) {
    console.error('Lobbies fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
