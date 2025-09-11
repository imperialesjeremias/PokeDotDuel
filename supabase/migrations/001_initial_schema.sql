-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE rarity_type AS ENUM ('COMMON', 'RARE', 'LEGENDARY');
CREATE TYPE lobby_status AS ENUM ('OPEN', 'FULL', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED');
CREATE TYPE listing_status AS ENUM ('ACTIVE', 'SOLD', 'CANCELLED');
CREATE TYPE auction_status AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');
CREATE TYPE transaction_kind AS ENUM (
  'DEPOSIT_SOL', 'WITHDRAW_SOL', 'BUY_POKECOINS', 'SELL_CARD', 
  'BUY_CARD', 'BID', 'WAGER_DEPOSIT', 'WAGER_PAYOUT', 
  'PACK_PURCHASE', 'PACK_REWARD'
);

-- Users/Profiles table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  generated_wallet_address TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  xp BIGINT DEFAULT 0 CHECK (xp >= 0),
  badges JSONB DEFAULT '[]'::jsonb,
  pokecoins BIGINT DEFAULT 0 CHECK (pokecoins >= 0),
  sol_balance BIGINT DEFAULT 0 CHECK (sol_balance >= 0),
  stats JSONB DEFAULT '{
    "wins": 3,
    "losses": 1,
    "packs_opened": 10,
    "cards_owned": 0,
    "total_wagered": 0,
    "total_won": 0
  }'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards table
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  dex_number INTEGER NOT NULL CHECK (dex_number >= 1 AND dex_number <= 151),
  name TEXT NOT NULL,
  is_shiny BOOLEAN DEFAULT FALSE,
  rarity rarity_type NOT NULL,
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  stats JSONB NOT NULL DEFAULT '{
    "hp": 0,
    "atk": 0,
    "def": 0,
    "spa": 0,
    "spd": 0,
    "spe": 0
  }'::jsonb,
  types TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slots UUID[] NOT NULL CHECK (array_length(slots, 1) = 6),
  natures TEXT[] DEFAULT '{}'::text[],
  moves JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wager brackets for matchmaking
CREATE TABLE public.wager_brackets (
  id SERIAL PRIMARY KEY,
  min_lamports BIGINT NOT NULL CHECK (min_lamports > 0),
  max_lamports BIGINT NOT NULL CHECK (max_lamports > min_lamports),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lobbies table
CREATE TABLE public.lobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bracket_id INTEGER NOT NULL REFERENCES public.wager_brackets(id),
  creator_id UUID NOT NULL REFERENCES public.users(id),
  opponent_id UUID REFERENCES public.users(id),
  invite_code TEXT UNIQUE,
  status lobby_status DEFAULT 'OPEN',
  escrow_pda TEXT,
  wager_lamports BIGINT NOT NULL CHECK (wager_lamports > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battles table
CREATE TABLE public.battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  player_a UUID NOT NULL REFERENCES public.users(id),
  player_b UUID NOT NULL REFERENCES public.users(id),
  result JSONB,
  transcript JSONB,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace listings
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id),
  price_lamports BIGINT NOT NULL CHECK (price_lamports > 0),
  status listing_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auctions table
CREATE TABLE public.auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id),
  reserve_price_lamports BIGINT NOT NULL CHECK (reserve_price_lamports > 0),
  end_at TIMESTAMPTZ NOT NULL,
  status auction_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids table
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES public.users(id),
  amount_lamports BIGINT NOT NULL CHECK (amount_lamports > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booster packs
CREATE TABLE public.packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.users(id),
  payment_sig TEXT,
  vrf_request_id TEXT,
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pack rewards (cards from opened packs)
CREATE TABLE public.pack_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions audit table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  card_id UUID REFERENCES public.cards(id),
  kind transaction_kind NOT NULL,
  sol_lamports BIGINT DEFAULT 0,
  pokecoins_delta BIGINT DEFAULT 0,
  ref_id UUID,
  onchain_sig TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pokedex cache for PokeAPI data
CREATE TABLE public.pokedex_cache (
  dex_number INTEGER PRIMARY KEY CHECK (dex_number >= 1 AND dex_number <= 151),
  name TEXT NOT NULL,
  types TEXT[] NOT NULL,
  base_stats JSONB NOT NULL,
  moves JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop tables for booster pack probabilities
CREATE TABLE public.drop_tables (
  id SERIAL PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  rarity rarity_type NOT NULL,
  probability_percent DECIMAL(5,2) NOT NULL CHECK (probability_percent > 0 AND probability_percent <= 100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX idx_cards_owner_id ON public.cards(owner_id);
CREATE INDEX idx_cards_dex_number ON public.cards(dex_number);
CREATE INDEX idx_cards_rarity ON public.cards(rarity);
CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX idx_lobbies_bracket_id ON public.lobbies(bracket_id);
CREATE INDEX idx_lobbies_status ON public.lobbies(status);
CREATE INDEX idx_lobbies_creator_id ON public.lobbies(creator_id);
CREATE INDEX idx_battles_lobby_id ON public.battles(lobby_id);
CREATE INDEX idx_battles_player_a ON public.battles(player_a);
CREATE INDEX idx_battles_player_b ON public.battles(player_b);
CREATE INDEX idx_listings_card_id ON public.listings(card_id);
CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_auctions_card_id ON public.auctions(card_id);
CREATE INDEX idx_auctions_seller_id ON public.auctions(seller_id);
CREATE INDEX idx_auctions_status ON public.auctions(status);
CREATE INDEX idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX idx_packs_buyer_id ON public.packs(buyer_id);
CREATE INDEX idx_pack_rewards_pack_id ON public.pack_rewards(pack_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_kind ON public.transactions(kind);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lobbies_updated_at BEFORE UPDATE ON public.lobbies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON public.auctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
