import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moveId = params.id;
    
    const { data: move, error } = await supabase
      .from('moves_cache')
      .select('*')
      .eq('id', moveId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Move not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching move:', error);
      return NextResponse.json(
        { error: 'Failed to fetch move' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      move: {
        id: move.id,
        name: move.name,
        type: move.type,
        category: move.category,
        power: move.power,
        accuracy: move.accuracy,
        pp: move.pp,
        priority: move.priority,
        flags: move.flags,
        target: move.target,
        effects: move.effects,
        cachedAt: move.cached_at,
      },
    });
  } catch (error) {
    console.error('Move fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}