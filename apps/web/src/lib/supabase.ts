import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          username: string | null;
          created_at: string;
          level: number;
          xp: number;
          badges: any[];
          pokecoins: number;
          stats: {
            wins: number;
            losses: number;
            packs_opened: number;
            cards_owned: number;
            total_wagered: number;
            total_won: number;
          };
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          username?: string | null;
          created_at?: string;
          level?: number;
          xp?: number;
          badges?: any[];
          pokecoins?: number;
          stats?: {
            wins: number;
            losses: number;
            packs_opened: number;
            cards_owned: number;
            total_wagered: number;
            total_won: number;
          };
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          username?: string | null;
          created_at?: string;
          level?: number;
          xp?: number;
          badges?: any[];
          pokecoins?: number;
          stats?: {
            wins: number;
            losses: number;
            packs_opened: number;
            cards_owned: number;
            total_wagered: number;
            total_won: number;
          };
          updated_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          owner_id: string;
          dex_number: number;
          name: string;
          is_shiny: boolean;
          rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
          level: number;
          stats: {
            hp: number;
            atk: number;
            def: number;
            spa: number;
            spd: number;
            spe: number;
          };
          types: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          dex_number: number;
          name: string;
          is_shiny?: boolean;
          rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
          level?: number;
          stats: {
            hp: number;
            atk: number;
            def: number;
            spa: number;
            spd: number;
            spe: number;
          };
          types: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          dex_number?: number;
          name?: string;
          is_shiny?: boolean;
          rarity?: 'COMMON' | 'RARE' | 'LEGENDARY';
          level?: number;
          stats?: {
            hp: number;
            atk: number;
            def: number;
            spa: number;
            spd: number;
            spe: number;
          };
          types?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slots: string[];
          natures: string[];
          moves: Record<string, string[]>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slots: string[];
          natures?: string[];
          moves?: Record<string, string[]>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slots?: string[];
          natures?: string[];
          moves?: Record<string, string[]>;
          created_at?: string;
          updated_at?: string;
        };
      };
      lobbies: {
        Row: {
          id: string;
          bracket_id: number;
          creator_id: string;
          opponent_id: string | null;
          invite_code: string | null;
          status: 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
          escrow_pda: string | null;
          wager_lamports: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bracket_id: number;
          creator_id: string;
          opponent_id?: string | null;
          invite_code?: string | null;
          status?: 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
          escrow_pda?: string | null;
          wager_lamports: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bracket_id?: number;
          creator_id?: string;
          opponent_id?: string | null;
          invite_code?: string | null;
          status?: 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
          escrow_pda?: string | null;
          wager_lamports?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      battles: {
        Row: {
          id: string;
          lobby_id: string;
          player_a: string;
          player_b: string;
          result: any | null;
          transcript: any | null;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lobby_id: string;
          player_a: string;
          player_b: string;
          result?: any | null;
          transcript?: any | null;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lobby_id?: string;
          player_a?: string;
          player_b?: string;
          result?: any | null;
          transcript?: any | null;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          card_id: string;
          seller_id: string;
          price_lamports: number;
          status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          seller_id: string;
          price_lamports: number;
          status?: 'ACTIVE' | 'SOLD' | 'CANCELLED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          seller_id?: string;
          price_lamports?: number;
          status?: 'ACTIVE' | 'SOLD' | 'CANCELLED';
          created_at?: string;
          updated_at?: string;
        };
      };
      auctions: {
        Row: {
          id: string;
          card_id: string;
          seller_id: string;
          reserve_price_lamports: number;
          end_at: string;
          status: 'ACTIVE' | 'ENDED' | 'CANCELLED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          seller_id: string;
          reserve_price_lamports: number;
          end_at: string;
          status?: 'ACTIVE' | 'ENDED' | 'CANCELLED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          seller_id?: string;
          reserve_price_lamports?: number;
          end_at?: string;
          status?: 'ACTIVE' | 'ENDED' | 'CANCELLED';
          created_at?: string;
          updated_at?: string;
        };
      };
      bids: {
        Row: {
          id: string;
          auction_id: string;
          bidder_id: string;
          amount_lamports: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          auction_id: string;
          bidder_id: string;
          amount_lamports: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          auction_id?: string;
          bidder_id?: string;
          amount_lamports?: number;
          created_at?: string;
        };
      };
      packs: {
        Row: {
          id: string;
          buyer_id: string;
          payment_sig: string | null;
          vrf_request_id: string | null;
          opened: boolean;
          opened_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          payment_sig?: string | null;
          vrf_request_id?: string | null;
          opened?: boolean;
          opened_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          payment_sig?: string | null;
          vrf_request_id?: string | null;
          opened?: boolean;
          opened_at?: string | null;
          created_at?: string;
        };
      };
      pack_rewards: {
        Row: {
          id: string;
          pack_id: string;
          card_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pack_id: string;
          card_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pack_id?: string;
          card_id?: string;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string | null;
          kind: 'DEPOSIT_SOL' | 'WITHDRAW_SOL' | 'BUY_POKECOINS' | 'SELL_CARD' | 'BUY_CARD' | 'BID' | 'WAGER_DEPOSIT' | 'WAGER_PAYOUT' | 'PACK_PURCHASE' | 'PACK_REWARD';
          sol_lamports: number;
          pokecoins_delta: number;
          ref_id: string | null;
          onchain_sig: string | null;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          kind: 'DEPOSIT_SOL' | 'WITHDRAW_SOL' | 'BUY_POKECOINS' | 'SELL_CARD' | 'BUY_CARD' | 'BID' | 'WAGER_DEPOSIT' | 'WAGER_PAYOUT' | 'PACK_PURCHASE' | 'PACK_REWARD';
          sol_lamports?: number;
          pokecoins_delta?: number;
          ref_id?: string | null;
          onchain_sig?: string | null;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          kind?: 'DEPOSIT_SOL' | 'WITHDRAW_SOL' | 'BUY_POKECOINS' | 'SELL_CARD' | 'BUY_CARD' | 'BID' | 'WAGER_DEPOSIT' | 'WAGER_PAYOUT' | 'PACK_PURCHASE' | 'PACK_REWARD';
          sol_lamports?: number;
          pokecoins_delta?: number;
          ref_id?: string | null;
          onchain_sig?: string | null;
          metadata?: any;
          created_at?: string;
        };
      };
      wager_brackets: {
        Row: {
          id: number;
          min_lamports: number;
          max_lamports: number;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          min_lamports: number;
          max_lamports: number;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          min_lamports?: number;
          max_lamports?: number;
          name?: string;
          created_at?: string;
        };
      };
      pokedex_cache: {
        Row: {
          dex_number: number;
          name: string;
          types: string[];
          base_stats: {
            hp: number;
            atk: number;
            def: number;
            spa: number;
            spd: number;
            spe: number;
          };
          moves: any;
          cached_at: string;
        };
        Insert: {
          dex_number: number;
          name: string;
          types: string[];
          base_stats: {
            hp: number;
            atk: number;
            def: number;
            spa: number;
            spd: number;
            spe: number;
          };
          moves: any;
          cached_at?: string;
        };
        Update: {
          dex_number?: number;
          name?: string;
          types?: string[];
          base_stats?: {
            hp: number;
            atk: number;
            def: number;
            spa: number;
            spd: number;
            spe: number;
          };
          moves?: any;
          cached_at?: string;
        };
      };
      drop_tables: {
        Row: {
          id: number;
          version: number;
          rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
          probability_percent: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          version?: number;
          rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
          probability_percent: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          version?: number;
          rarity?: 'COMMON' | 'RARE' | 'LEGENDARY';
          probability_percent?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
