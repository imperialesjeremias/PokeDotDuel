import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('battles')
      .select(`
        id,
        lobby_id,
        player_a,
        player_b,
        result,
        started_at,
        ended_at,
        created_at
      `)
      .or(`player_a.eq.${userId},player_b.eq.${userId}`)
      .order('created_at', { ascending: false });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: battles, error } = await query;

    if (error) {
      console.error('Error fetching battles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch battles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      battles: battles.map(battle => ({
        id: battle.id,
        lobbyId: battle.lobby_id,
        playerA: battle.player_a,
        playerB: battle.player_b,
        result: battle.result,
        startedAt: battle.started_at,
        endedAt: battle.ended_at,
        createdAt: battle.created_at,
      })),
      pagination: {
        page,
        limit,
        hasMore: battles.length === limit,
      },
    });
  } catch (error) {
    console.error('Battles fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
