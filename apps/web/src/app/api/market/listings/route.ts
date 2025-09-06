import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const CreateListingSchema = z.object({
  cardId: z.string().uuid(),
  priceLamports: z.number().positive(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const rarity = searchParams.get('rarity');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isShiny = searchParams.get('isShiny');

    let query = supabase
      .from('listings')
      .select(`
        id,
        price_lamports,
        status,
        created_at,
        cards!inner(
          id,
          dex_number,
          name,
          is_shiny,
          rarity,
          level,
          stats,
          types
        )
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    // Apply filters
    if (rarity) {
      query = query.eq('cards.rarity', rarity);
    }
    if (isShiny === 'true') {
      query = query.eq('cards.is_shiny', true);
    }
    if (minPrice) {
      query = query.gte('price_lamports', parseInt(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price_lamports', parseInt(maxPrice));
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: listings, error } = await query;

    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      listings: listings.map(listing => ({
        id: listing.id,
        priceLamports: listing.price_lamports,
        status: listing.status,
        createdAt: listing.created_at,
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
      })),
      pagination: {
        page,
        limit,
        hasMore: listings.length === limit,
      },
    });
  } catch (error) {
    console.error('Listings fetch error:', error);
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
    const validatedData = CreateListingSchema.parse(body);

    // Verify card ownership
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('id, owner_id')
      .eq('id', validatedData.cardId)
      .single();

    if (cardError) {
      if (cardError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Card not found' },
          { status: 404 }
        );
      }
      console.error('Error verifying card:', cardError);
      return NextResponse.json(
        { error: 'Failed to verify card' },
        { status: 500 }
      );
    }

    if (card.owner_id !== userId) {
      return NextResponse.json(
        { error: 'You can only list your own cards' },
        { status: 403 }
      );
    }

    // Check if card is already listed
    const { data: existingListing } = await supabase
      .from('listings')
      .select('id')
      .eq('card_id', validatedData.cardId)
      .eq('status', 'ACTIVE')
      .single();

    if (existingListing) {
      return NextResponse.json(
        { error: 'Card is already listed' },
        { status: 409 }
      );
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        card_id: validatedData.cardId,
        seller_id: userId,
        price_lamports: validatedData.priceLamports,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        cardId: listing.card_id,
        priceLamports: listing.price_lamports,
        status: listing.status,
        createdAt: listing.created_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid listing data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Listing creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
