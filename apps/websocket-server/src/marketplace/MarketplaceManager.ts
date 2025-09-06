import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';

export interface Listing {
  id: string;
  cardId: string;
  sellerId: string;
  priceLamports: number;
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Auction {
  id: string;
  cardId: string;
  sellerId: string;
  reservePriceLamports: number;
  currentBid?: number;
  highestBidderId?: string;
  endAt: Date;
  status: 'ACTIVE' | 'ENDED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amountLamports: number;
  createdAt: Date;
}

export class MarketplaceManager {
  private readonly MARKETPLACE_FEE_BPS = 250; // 2.5%

  async createListing(
    cardId: string,
    sellerId: string,
    priceLamports: number
  ): Promise<string> {
    // Verify ownership
    const { data: card } = await supabase
      .from('cards')
      .select('owner_id')
      .eq('id', cardId)
      .single();

    if (card?.owner_id !== sellerId) {
      throw new Error('You do not own this card');
    }

    const listingId = uuidv4();

    // Create listing
    await supabase
      .from('listings')
      .insert({
        id: listingId,
        card_id: cardId,
        seller_id: sellerId,
        price_lamports: priceLamports,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    return listingId;
  }

  async buyListing(listingId: string, buyerId: string): Promise<{
    transactionId: string;
    fee: number;
  }> {
    // Get listing details
    const { data: listing } = await supabase
      .from('listings')
      .select('*, cards(*)')
      .eq('id', listingId)
      .single();

    if (!listing) throw new Error('Listing not found');
    if (listing.status !== 'ACTIVE') throw new Error('Listing is not active');
    if (listing.seller_id === buyerId) throw new Error('Cannot buy your own listing');

    const price = listing.price_lamports;
    const fee = Math.floor((price * this.MARKETPLACE_FEE_BPS) / 10000);
    const sellerReceives = price - fee;

    // Create transaction record
    const transactionId = uuidv4();
    await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        user_id: buyerId,
        kind: 'BUY_CARD',
        sol_lamports: price,
        pokecoins_delta: 0,
        ref_id: listingId,
        metadata: { seller_id: listing.seller_id },
        created_at: new Date().toISOString(),
      });

    // Update card ownership
    await supabase
      .from('cards')
      .update({
        owner_id: buyerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing.card_id);

    // Update listing status
    await supabase
      .from('listings')
      .update({
        status: 'SOLD',
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId);

    // Record seller earnings
    await supabase
      .from('transactions')
      .insert({
        id: uuidv4(),
        user_id: listing.seller_id,
        kind: 'SELL_CARD',
        sol_lamports: sellerReceives,
        pokecoins_delta: 0,
        ref_id: listingId,
        metadata: { buyer_id: buyerId },
        created_at: new Date().toISOString(),
      });

    return { transactionId, fee };
  }

  async createAuction(
    cardId: string,
    sellerId: string,
    reservePriceLamports: number,
    durationHours: number = 24
  ): Promise<string> {
    // Verify ownership
    const { data: card } = await supabase
      .from('cards')
      .select('owner_id')
      .eq('id', cardId)
      .single();

    if (card?.owner_id !== sellerId) {
      throw new Error('You do not own this card');
    }

    const auctionId = uuidv4();
    const endAt = new Date();
    endAt.setHours(endAt.getHours() + durationHours);

    // Create auction
    await supabase
      .from('auctions')
      .insert({
        id: auctionId,
        card_id: cardId,
        seller_id: sellerId,
        reserve_price_lamports: reservePriceLamports,
        end_at: endAt.toISOString(),
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    return auctionId;
  }

  async placeBid(
    auctionId: string,
    bidderId: string,
    amountLamports: number
  ): Promise<string> {
    // Get auction details
    const { data: auction } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (!auction) throw new Error('Auction not found');
    if (auction.status !== 'ACTIVE') throw new Error('Auction is not active');
    if (auction.seller_id === bidderId) throw new Error('Cannot bid on your own auction');

    const now = new Date();
    const endAt = new Date(auction.end_at);

    if (now > endAt) throw new Error('Auction has ended');

    // Check minimum bid
    const minBid = auction.current_bid
      ? auction.current_bid + 1000000 // Minimum increment of 0.01 SOL
      : auction.reserve_price_lamports;

    if (amountLamports < minBid) {
      throw new Error(`Minimum bid is ${minBid} lamports`);
    }

    const bidId = uuidv4();

    // Create bid
    await supabase
      .from('bids')
      .insert({
        id: bidId,
        auction_id: auctionId,
        bidder_id: bidderId,
        amount_lamports: amountLamports,
        created_at: new Date().toISOString(),
      });

    // Update auction
    await supabase
      .from('auctions')
      .update({
        current_bid: amountLamports,
        highest_bidder_id: bidderId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auctionId);

    return bidId;
  }

  async endAuction(auctionId: string): Promise<{
    winnerId?: string;
    finalPrice?: number;
    transactionId?: string;
  }> {
    // Get auction details
    const { data: auction } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (!auction) throw new Error('Auction not found');
    if (auction.status !== 'ACTIVE') throw new Error('Auction is not active');

    const now = new Date();
    const endAt = new Date(auction.end_at);

    // Only allow ending if auction has actually ended
    if (now <= endAt) throw new Error('Auction has not ended yet');

    // Update auction status
    await supabase
      .from('auctions')
      .update({
        status: 'ENDED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', auctionId);

    // If there's a winner (bid >= reserve price)
    if (auction.current_bid && auction.current_bid >= auction.reserve_price_lamports) {
      const winnerId = auction.highest_bidder_id!;
      const finalPrice = auction.current_bid!;
      const fee = Math.floor((finalPrice * this.MARKETPLACE_FEE_BPS) / 10000);
      const sellerReceives = finalPrice - fee;

      // Create transaction for buyer
      const transactionId = uuidv4();
      await supabase
        .from('transactions')
        .insert({
          id: transactionId,
          user_id: winnerId,
          kind: 'BID',
          sol_lamports: finalPrice,
          pokecoins_delta: 0,
          ref_id: auctionId,
          metadata: { seller_id: auction.seller_id },
          created_at: new Date().toISOString(),
        });

      // Transfer card ownership
      await supabase
        .from('cards')
        .update({
          owner_id: winnerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', auction.card_id);

      // Record seller earnings
      await supabase
        .from('transactions')
        .insert({
          id: uuidv4(),
          user_id: auction.seller_id,
          kind: 'SELL_CARD',
          sol_lamports: sellerReceives,
          pokecoins_delta: 0,
          ref_id: auctionId,
          metadata: { buyer_id: winnerId },
          created_at: new Date().toISOString(),
        });

      return { winnerId, finalPrice, transactionId };
    }

    return {}; // No winner
  }

  async getActiveListings(limit: number = 50, offset: number = 0): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        cards (
          id,
          dex_number,
          name,
          rarity,
          level,
          stats
        )
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  async getActiveAuctions(limit: number = 50, offset: number = 0): Promise<Auction[]> {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        *,
        cards (
          id,
          dex_number,
          name,
          rarity,
          level,
          stats
        )
      `)
      .eq('status', 'ACTIVE')
      .order('end_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  async getAuctionBids(auctionId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('auction_id', auctionId)
      .order('amount_lamports', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async cancelListing(listingId: string, sellerId: string): Promise<void> {
    const { data: listing } = await supabase
      .from('listings')
      .select('seller_id, status')
      .eq('id', listingId)
      .single();

    if (!listing) throw new Error('Listing not found');
    if (listing.seller_id !== sellerId) throw new Error('Not authorized');
    if (listing.status !== 'ACTIVE') throw new Error('Listing is not active');

    await supabase
      .from('listings')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId);
  }

  async cancelAuction(auctionId: string, sellerId: string): Promise<void> {
    const { data: auction } = await supabase
      .from('auctions')
      .select('seller_id, status')
      .eq('id', auctionId)
      .single();

    if (!auction) throw new Error('Auction not found');
    if (auction.seller_id !== sellerId) throw new Error('Not authorized');
    if (auction.status !== 'ACTIVE') throw new Error('Auction is not active');

    await supabase
      .from('auctions')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', auctionId);
  }
}
