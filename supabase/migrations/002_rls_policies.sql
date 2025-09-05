-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Cards policies
CREATE POLICY "Users can view their own cards" ON public.cards
  FOR SELECT USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can insert their own cards" ON public.cards
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can update their own cards" ON public.cards
  FOR UPDATE USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can delete their own cards" ON public.cards
  FOR DELETE USING (auth.uid()::text = owner_id::text);

-- Teams policies
CREATE POLICY "Users can view their own teams" ON public.teams
  FOR SELECT USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can insert their own teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can update their own teams" ON public.teams
  FOR UPDATE USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can delete their own teams" ON public.teams
  FOR DELETE USING (auth.uid()::text = owner_id::text);

-- Lobbies policies
CREATE POLICY "Users can view lobbies they participate in" ON public.lobbies
  FOR SELECT USING (
    auth.uid()::text = creator_id::text OR 
    auth.uid()::text = opponent_id::text
  );

CREATE POLICY "Users can create lobbies" ON public.lobbies
  FOR INSERT WITH CHECK (auth.uid()::text = creator_id::text);

CREATE POLICY "Users can update lobbies they participate in" ON public.lobbies
  FOR UPDATE USING (
    auth.uid()::text = creator_id::text OR 
    auth.uid()::text = opponent_id::text
  );

-- Battles policies
CREATE POLICY "Users can view battles they participate in" ON public.battles
  FOR SELECT USING (
    auth.uid()::text = player_a::text OR 
    auth.uid()::text = player_b::text
  );

CREATE POLICY "Users can insert battles they participate in" ON public.battles
  FOR INSERT WITH CHECK (
    auth.uid()::text = player_a::text OR 
    auth.uid()::text = player_b::text
  );

CREATE POLICY "Users can update battles they participate in" ON public.battles
  FOR UPDATE USING (
    auth.uid()::text = player_a::text OR 
    auth.uid()::text = player_b::text
  );

-- Listings policies
CREATE POLICY "Anyone can view active listings" ON public.listings
  FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Users can view their own listings" ON public.listings
  FOR SELECT USING (auth.uid()::text = seller_id::text);

CREATE POLICY "Users can create listings for their cards" ON public.listings
  FOR INSERT WITH CHECK (auth.uid()::text = seller_id::text);

CREATE POLICY "Users can update their own listings" ON public.listings
  FOR UPDATE USING (auth.uid()::text = seller_id::text);

CREATE POLICY "Users can delete their own listings" ON public.listings
  FOR DELETE USING (auth.uid()::text = seller_id::text);

-- Auctions policies
CREATE POLICY "Anyone can view active auctions" ON public.auctions
  FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Users can view their own auctions" ON public.auctions
  FOR SELECT USING (auth.uid()::text = seller_id::text);

CREATE POLICY "Users can create auctions for their cards" ON public.auctions
  FOR INSERT WITH CHECK (auth.uid()::text = seller_id::text);

CREATE POLICY "Users can update their own auctions" ON public.auctions
  FOR UPDATE USING (auth.uid()::text = seller_id::text);

CREATE POLICY "Users can delete their own auctions" ON public.auctions
  FOR DELETE USING (auth.uid()::text = seller_id::text);

-- Bids policies
CREATE POLICY "Users can view bids on auctions they participate in" ON public.bids
  FOR SELECT USING (
    auth.uid()::text = bidder_id::text OR
    EXISTS (
      SELECT 1 FROM public.auctions 
      WHERE auctions.id = bids.auction_id 
      AND auctions.seller_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create bids" ON public.bids
  FOR INSERT WITH CHECK (auth.uid()::text = bidder_id::text);

-- Packs policies
CREATE POLICY "Users can view their own packs" ON public.packs
  FOR SELECT USING (auth.uid()::text = buyer_id::text);

CREATE POLICY "Users can create packs" ON public.packs
  FOR INSERT WITH CHECK (auth.uid()::text = buyer_id::text);

CREATE POLICY "Users can update their own packs" ON public.packs
  FOR UPDATE USING (auth.uid()::text = buyer_id::text);

-- Pack rewards policies
CREATE POLICY "Users can view pack rewards from their packs" ON public.pack_rewards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.packs 
      WHERE packs.id = pack_rewards.pack_id 
      AND packs.buyer_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create pack rewards for their packs" ON public.pack_rewards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.packs 
      WHERE packs.id = pack_rewards.pack_id 
      AND packs.buyer_id::text = auth.uid()::text
    )
  );

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Public read-only tables (no RLS needed)
-- wager_brackets, pokedex_cache, drop_tables are public read-only

-- Create a function to get user ID from wallet address
CREATE OR REPLACE FUNCTION get_user_id_from_wallet(wallet_address TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM public.users 
    WHERE users.wallet_address = get_user_id_from_wallet.wallet_address
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user owns a card
CREATE OR REPLACE FUNCTION user_owns_card(card_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.cards 
    WHERE cards.id = card_id AND cards.owner_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
