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
    
    // In a real implementation, you would verify the JWT token here
    // For now, we'll extract the user ID from the token (simplified)
    const userId = token; // This should be extracted from JWT

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        wallet_address,
        level,
        xp,
        badges,
        pokecoins,
        stats
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        level: user.level,
        xp: user.xp,
        badges: user.badges,
        pokecoins: user.pokecoins,
        stats: user.stats,

      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
