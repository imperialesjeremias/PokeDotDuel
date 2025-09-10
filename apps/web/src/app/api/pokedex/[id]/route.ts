import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pokemonId = params.id;
    
    // Check if ID is a number (dex number) or string (name)
    const isNumeric = /^\d+$/.test(pokemonId);
    
    let query = supabase
      .from('pokedex_cache')
      .select('*');
    
    if (isNumeric) {
      query = query.eq('dex_number', parseInt(pokemonId));
    } else {
      query = query.ilike('name', pokemonId);
    }
    
    const { data: pokemon, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Pokemon not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching Pokemon:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Pokemon' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      pokemon: {
        dexNumber: pokemon.dex_number,
        name: pokemon.name,
        types: pokemon.types,
        baseStats: pokemon.base_stats,
        moves: pokemon.moves,
        cachedAt: pokemon.cached_at,
      },
    });
  } catch (error) {
    console.error('Pokemon fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}