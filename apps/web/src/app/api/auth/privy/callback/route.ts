import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, userId } = await request.json();

    if (!walletAddress || !userId) {
      return NextResponse.json(
        { error: 'Missing wallet address or user ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    let user;
    if (existingUser) {
      // User exists, update Privy user ID if needed
      user = existingUser;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          username: `Player_${Date.now()}`,
          level: 1,
          xp: 0,
          pokecoins: 1000, // Starting PokéCoins
          stats: {
            wins: 0,
            losses: 0,
            packs_opened: 0,
            cards_owned: 0,
            total_wagered: 0,
            total_won: 0,
          },
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      user = newUser;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
        level: user.level,
        xp: user.xp,
        pokecoins: user.pokecoins,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
