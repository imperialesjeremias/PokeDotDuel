use anchor_lang::prelude::*;

declare_id!("PokeCoins111111111111111111111111111111111");

#[program]
pub mod pokecoins_bridge {
    use super::*;

    /// Buy PokéCoins with SOL
    pub fn buy_pokecoins(
        ctx: Context<BuyPokecoins>,
        sol_amount: u64,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        
        // Calculate PokéCoins to give (1 SOL = 1000 PokéCoins)
        let pokecoins_amount = sol_amount * 1000;
        
        // Transfer SOL to bridge vault
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: bridge.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, sol_amount)?;
        
        bridge.total_sol_deposited += sol_amount;
        
        emit!(PokecoinsPurchased {
            buyer: ctx.accounts.buyer.key(),
            sol_amount,
            pokecoins_amount,
        });
        
        Ok(())
    }

    /// Sell PokéCoins for SOL
    pub fn sell_pokecoins(
        ctx: Context<SellPokecoins>,
        pokecoins_amount: u64,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        
        // Calculate SOL to give (1000 PokéCoins = 1 SOL)
        let sol_amount = pokecoins_amount / 1000;
        
        require!(sol_amount > 0, ErrorCode::InsufficientPokecoins);
        require!(
            bridge.to_account_info().lamports() >= sol_amount,
            ErrorCode::InsufficientSolReserves
        );
        
        // Transfer SOL to seller
        **bridge.to_account_info().try_borrow_mut_lamports()? -= sol_amount;
        **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += sol_amount;
        
        bridge.total_sol_withdrawn += sol_amount;
        
        emit!(PokecoinsSold {
            seller: ctx.accounts.seller.key(),
            pokecoins_amount,
            sol_amount,
        });
        
        Ok(())
    }

    /// Deposit SOL to bridge reserves (admin only)
    pub fn deposit_reserves(
        ctx: Context<DepositReserves>,
        amount: u64,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        
        // Transfer SOL to bridge
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.admin.to_account_info(),
                to: bridge.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;
        
        bridge.total_sol_deposited += amount;
        
        emit!(ReservesDeposited {
            admin: ctx.accounts.admin.key(),
            amount,
        });
        
        Ok(())
    }

    /// Withdraw SOL from bridge reserves (admin only)
    pub fn withdraw_reserves(
        ctx: Context<WithdrawReserves>,
        amount: u64,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        
        require!(
            bridge.to_account_info().lamports() >= amount,
            ErrorCode::InsufficientSolReserves
        );
        
        // Transfer SOL to admin
        **bridge.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.admin.to_account_info().try_borrow_mut_lamports()? += amount;
        
        bridge.total_sol_withdrawn += amount;
        
        emit!(ReservesWithdrawn {
            admin: ctx.accounts.admin.key(),
            amount,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct BuyPokecoins<'info> {
    #[account(
        mut,
        seeds = [b"BRIDGE"],
        bump
    )]
    pub bridge: Account<'info, Bridge>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SellPokecoins<'info> {
    #[account(
        mut,
        seeds = [b"BRIDGE"],
        bump
    )]
    pub bridge: Account<'info, Bridge>,
    
    #[account(mut)]
    pub seller: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositReserves<'info> {
    #[account(
        mut,
        seeds = [b"BRIDGE"],
        bump
    )]
    pub bridge: Account<'info, Bridge>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawReserves<'info> {
    #[account(
        mut,
        seeds = [b"BRIDGE"],
        bump
    )]
    pub bridge: Account<'info, Bridge>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Bridge {
    pub total_sol_deposited: u64,
    pub total_sol_withdrawn: u64,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient PokéCoins")]
    InsufficientPokecoins,
    #[msg("Insufficient SOL reserves")]
    InsufficientSolReserves,
}

// Events
#[event]
pub struct PokecoinsPurchased {
    pub buyer: Pubkey,
    pub sol_amount: u64,
    pub pokecoins_amount: u64,
}

#[event]
pub struct PokecoinsSold {
    pub seller: Pubkey,
    pub pokecoins_amount: u64,
    pub sol_amount: u64,
}

#[event]
pub struct ReservesDeposited {
    pub admin: Pubkey,
    pub amount: u64,
}

#[event]
pub struct ReservesWithdrawn {
    pub admin: Pubkey,
    pub amount: u64,
}
