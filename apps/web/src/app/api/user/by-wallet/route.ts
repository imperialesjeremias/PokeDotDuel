import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Query user by wallet address
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        wallet_address,
        generated_wallet_address,
        level,
        xp,
        badges,
        pokecoins,
        sol_balance,
        stats,
        updated_at
      `)
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return NextResponse.json(
          { 
            success: false,
            error: 'User not found',
            userExists: false
          },
          { status: 404 }
        );
      }
      console.error('Error fetching user by wallet:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userExists: true,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        generatedWalletAddress: user.generated_wallet_address,

        level: user.level,
        xp: user.xp,
        badges: user.badges,
        pokecoins: user.pokecoins,
        solBalance: user.sol_balance,
        stats: user.stats,

        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error('User fetch by wallet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this wallet address' },
        { status: 409 }
      );
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        wallet_address: walletAddress,
        generated_wallet_address: `generated-${walletAddress.slice(-8)}`,

        level: 1,
        xp: 0,
        badges: [],
        pokecoins: 1000, // Starting PokéCoins
        sol_balance: 0,
        stats: {
          wins: 0,
          losses: 0,
          packs_opened: 0,
          cards_owned: 0,
          total_wagered: 0,
          total_won: 0,
        },
      })
      .select(`
        id,
        wallet_address,
        generated_wallet_address,

        level,
        xp,
        badges,
        pokecoins,
        sol_balance,
        stats,

        updated_at
      `)
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        walletAddress: newUser.wallet_address,
        generatedWalletAddress: newUser.generated_wallet_address,

        level: newUser.level,
        xp: newUser.xp,
        badges: newUser.badges,
        pokecoins: newUser.pokecoins,
        solBalance: newUser.sol_balance,
        stats: newUser.stats,

        updatedAt: newUser.updated_at,
      },
    });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}