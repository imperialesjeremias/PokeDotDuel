import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const UpdateTeamSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  slots: z.array(z.string().uuid()).length(6).optional(),
  natures: z.array(z.string()).length(6).optional(),
  moves: z.record(z.array(z.string())).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: team, error } = await supabase
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
      .eq('id', params.id)
      .eq('owner_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching team:', error);
      return NextResponse.json(
        { error: 'Failed to fetch team' },
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
    console.error('Team fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = UpdateTeamSchema.parse(body);

    // Verify team ownership
    const { data: existingTeam, error: fetchError } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching team:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch team' },
        { status: 500 }
      );
    }

    if (existingTeam.owner_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // If slots are being updated, verify card ownership
    if (validatedData.slots) {
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
    }

    const { data: team, error } = await supabase
      .from('teams')
      .update(validatedData)
      .eq('id', params.id)
      .eq('owner_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating team:', error);
      return NextResponse.json(
        { error: 'Failed to update team' },
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

    console.error('Team update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', params.id)
      .eq('owner_id', userId);

    if (error) {
      console.error('Error deleting team:', error);
      return NextResponse.json(
        { error: 'Failed to delete team' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    console.error('Team deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
