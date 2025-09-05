import jwt from 'jsonwebtoken';
import { supabase } from '../../lib/supabase';

export interface User {
  id: string;
  walletAddress: string;
  username?: string;
}

export class AuthManager {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  async verifyToken(token: string): Promise<User> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      // Get user from Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('id, wallet_address, username')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  generateToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, { expiresIn: '24h' });
  }

  async authenticateUser(walletAddress: string): Promise<User> {
    try {
      // Get or create user
      let { data: user, error } = await supabase
        .from('users')
        .select('id, wallet_address, username')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress,
            username: `Player_${Date.now()}`,
          })
          .select('id, wallet_address, username')
          .single();

        if (createError || !newUser) {
          throw new Error('Failed to create user');
        }

        user = newUser;
      } else if (error) {
        throw new Error('Failed to get user');
      }

      return {
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
      };
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }
}
