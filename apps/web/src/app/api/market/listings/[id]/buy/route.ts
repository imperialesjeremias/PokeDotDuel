import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
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
    const buyerId = token; // This should be extracted from JWT

    // Get listing with card details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select(`
        id,
        card_id,
        seller_id,
        price_lamports,
        status,
        cards!inner(
          id,
          owner_id,
          dex_number,
          name,
          is_shiny,
          rarity,
          level,
          stats,
          types
        )
      `)
      .eq('id', params.id)
      .single();

    if (listingError) {
      if (listingError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching listing:', listingError);
      return NextResponse.json(
        { error: 'Failed to fetch listing' },
        { status: 500 }
      );
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Listing is not active' },
        { status: 400 }
      );
    }

    if (listing.seller_id === buyerId) {
      return NextResponse.json(
        { error: 'Cannot buy your own listing' },
        { status: 400 }
      );
    }

    // Start transaction
    const { error: transactionError } = await supabase.rpc('buy_card_listing', {
      listing_id: params.id,
      buyer_id: buyerId,
      price_lamports: listing.price_lamports,
    });

    if (transactionError) {
      console.error('Error buying card:', transactionError);
      return NextResponse.json(
        { error: 'Failed to buy card' },
        { status: 500 }
      );
    }

    // Record transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: buyerId,
        kind: 'BUY_CARD',
        sol_lamports: listing.price_lamports,
        ref_id: params.id,
        metadata: {
          card_id: listing.card_id,
          seller_id: listing.seller_id,
        },
      });

    // Record seller transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: listing.seller_id,
        kind: 'SELL_CARD',
        sol_lamports: listing.price_lamports,
        ref_id: params.id,
        metadata: {
          card_id: listing.card_id,
          buyer_id: buyerId,
        },
      });

    return NextResponse.json({
      success: true,
      message: 'Card purchased successfully',
      card: {
        id: listing.cards[0].id,
        dexNumber: listing.cards[0].dex_number,
        name: listing.cards[0].name,
        isShiny: listing.cards[0].is_shiny,
        rarity: listing.cards[0].rarity,
        level: listing.cards[0].level,
        stats: listing.cards[0].stats,
        types: listing.cards[0].types,
      },
    });
  } catch (error) {
    console.error('Card purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
