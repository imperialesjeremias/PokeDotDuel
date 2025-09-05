import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const CreateTeamSchema = z.object({
  name: z.string().min(1).max(50),
  slots: z.array(z.string().uuid()).length(6),
  natures: z.array(z.string()).length(6),
  moves: z.record(z.array(z.string())),
});

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

    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        slots,
        natures,
        moves,
        created_at,
        updated_at
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        slots: team.slots,
        natures: team.natures,
        moves: team.moves,
        createdAt: team.created_at,
        updatedAt: team.updated_at,
      })),
    });
  } catch (error) {
    console.error('Teams fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const validatedData = CreateTeamSchema.parse(body);

    // Verify that all cards belong to the user
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id')
      .in('id', validatedData.slots)
      .eq('owner_id', userId);

    if (cardsError) {
      console.error('Error verifying cards:', cardsError);
      return NextResponse.json(
        { error: 'Failed to verify cards' },
        { status: 500 }
      );
    }

    if (cards.length !== 6) {
      return NextResponse.json(
        { error: 'All cards must belong to you' },
        { status: 400 }
      );
    }

    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        owner_id: userId,
        name: validatedData.name,
        slots: validatedData.slots,
        natures: validatedData.natures,
        moves: validatedData.moves,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating team:', error);
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        slots: team.slots,
        natures: team.natures,
        moves: team.moves,
        createdAt: team.created_at,
        updatedAt: team.updated_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid team data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Team creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
