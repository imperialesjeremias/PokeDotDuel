use anchor_lang::prelude::*;

declare_id!("PvPEscrow111111111111111111111111111111111");

#[program]
pub mod pvp_escrow {
    use super::*;

    /// Creates a new lobby with escrow
    pub fn create_lobby(
        ctx: Context<CreateLobby>,
        lobby_id: String,
        wager_lamports: u64,
    ) -> Result<()> {
        let lobby = &mut ctx.accounts.lobby;
        let vault = &mut ctx.accounts.vault;
        
        // Initialize lobby
        lobby.creator = ctx.accounts.creator.key();
        lobby.lobby_id = lobby_id.clone();
        lobby.wager_lamports = wager_lamports;
        lobby.status = LobbyStatus::Open;
        lobby.bump = *ctx.bumps.get("lobby").unwrap();
        
        // Initialize vault
        vault.lobby_id = lobby_id;
        vault.total_deposited = 0;
        vault.bump = *ctx.bumps.get("vault").unwrap();
        
        // Transfer initial wager from creator
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, wager_lamports)?;
        
        vault.total_deposited = wager_lamports;
        
        emit!(LobbyCreated {
            lobby_id: lobby.lobby_id.clone(),
            creator: lobby.creator,
            wager_lamports,
        });
        
        Ok(())
    }

    /// Join an existing lobby
    pub fn join_lobby(ctx: Context<JoinLobby>) -> Result<()> {
        let lobby = &mut ctx.accounts.lobby;
        let vault = &mut ctx.accounts.vault;
        
        require!(lobby.status == LobbyStatus::Open, ErrorCode::LobbyNotOpen);
        require!(lobby.creator != ctx.accounts.opponent.key(), ErrorCode::CannotJoinOwnLobby);
        
        // Transfer wager from opponent
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.opponent.to_account_info(),
                to: vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, lobby.wager_lamports)?;
        
        vault.total_deposited += lobby.wager_lamports;
        lobby.opponent = Some(ctx.accounts.opponent.key());
        lobby.status = LobbyStatus::Full;
        
        emit!(LobbyJoined {
            lobby_id: lobby.lobby_id.clone(),
            opponent: ctx.accounts.opponent.key(),
        });
        
        Ok(())
    }

    /// Lock the lobby to start battle
    pub fn lock_lobby(ctx: Context<LockLobby>) -> Result<()> {
        let lobby = &mut ctx.accounts.lobby;
        
        require!(lobby.status == LobbyStatus::Full, ErrorCode::LobbyNotFull);
        require!(lobby.opponent.is_some(), ErrorCode::NoOpponent);
        
        lobby.status = LobbyStatus::InProgress;
        
        emit!(LobbyLocked {
            lobby_id: lobby.lobby_id.clone(),
        });
        
        Ok(())
    }

    /// Resolve the match and distribute winnings
    pub fn resolve_match(
        ctx: Context<ResolveMatch>,
        winner: Pubkey,
        transcript_hash: [u8; 32],
    ) -> Result<()> {
        let lobby = &mut ctx.accounts.lobby;
        let vault = &mut ctx.accounts.vault;
        
        require!(lobby.status == LobbyStatus::InProgress, ErrorCode::LobbyNotInProgress);
        require!(
            winner == lobby.creator || winner == lobby.opponent.unwrap(),
            ErrorCode::InvalidWinner
        );
        
        // Calculate winnings (total - protocol fee)
        let protocol_fee = (vault.total_deposited * 250) / 10000; // 2.5% fee
        let winnings = vault.total_deposited - protocol_fee;
        
        // Transfer winnings to winner
        let winner_account = if winner == lobby.creator {
            &ctx.accounts.creator
        } else {
            &ctx.accounts.opponent
        };
        
        **vault.to_account_info().try_borrow_mut_lamports()? -= winnings;
        **winner_account.to_account_info().try_borrow_mut_lamports()? += winnings;
        
        // Transfer protocol fee to fee vault
        **vault.to_account_info().try_borrow_mut_lamports()? -= protocol_fee;
        **ctx.accounts.fee_vault.to_account_info().try_borrow_mut_lamports()? += protocol_fee;
        
        // Update lobby status
        lobby.status = LobbyStatus::Resolved;
        lobby.winner = Some(winner);
        lobby.transcript_hash = Some(transcript_hash);
        
        emit!(MatchResolved {
            lobby_id: lobby.lobby_id.clone(),
            winner,
            winnings,
            protocol_fee,
        });
        
        Ok(())
    }

    /// Cancel lobby and refund deposits
    pub fn cancel_lobby(ctx: Context<CancelLobby>) -> Result<()> {
        let lobby = &mut ctx.accounts.lobby;
        let vault = &mut ctx.accounts.vault;
        
        require!(
            lobby.status == LobbyStatus::Open || lobby.status == LobbyStatus::Full,
            ErrorCode::CannotCancelLobby
        );
        
        // Refund creator
        if vault.total_deposited > 0 {
            **vault.to_account_info().try_borrow_mut_lamports()? -= lobby.wager_lamports;
            **ctx.accounts.creator.to_account_info().try_borrow_mut_lamports()? += lobby.wager_lamports;
        }
        
        // Refund opponent if they joined
        if let Some(opponent) = lobby.opponent {
            **vault.to_account_info().try_borrow_mut_lamports()? -= lobby.wager_lamports;
            **ctx.accounts.opponent.to_account_info().try_borrow_mut_lamports()? += lobby.wager_lamports;
        }
        
        lobby.status = LobbyStatus::Cancelled;
        
        emit!(LobbyCancelled {
            lobby_id: lobby.lobby_id.clone(),
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(lobby_id: String)]
pub struct CreateLobby<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Lobby::INIT_SPACE,
        seeds = [b"LOBBY", lobby_id.as_bytes()],
        bump
    )]
    pub lobby: Account<'info, Lobby>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"VAULT", lobby_id.as_bytes()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    /// CHECK: This is the protocol fee vault
    #[account(mut)]
    pub fee_vault: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinLobby<'info> {
    #[account(mut)]
    pub lobby: Account<'info, Lobby>,
    
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub opponent: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LockLobby<'info> {
    #[account(mut)]
    pub lobby: Account<'info, Lobby>,
}

#[derive(Accounts)]
pub struct ResolveMatch<'info> {
    #[account(mut)]
    pub lobby: Account<'info, Lobby>,
    
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    
    /// CHECK: This is the creator account
    #[account(mut)]
    pub creator: UncheckedAccount<'info>,
    
    /// CHECK: This is the opponent account
    #[account(mut)]
    pub opponent: UncheckedAccount<'info>,
    
    /// CHECK: This is the protocol fee vault
    #[account(mut)]
    pub fee_vault: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CancelLobby<'info> {
    #[account(mut)]
    pub lobby: Account<'info, Lobby>,
    
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    
    /// CHECK: This is the creator account
    #[account(mut)]
    pub creator: UncheckedAccount<'info>,
    
    /// CHECK: This is the opponent account (may not exist)
    #[account(mut)]
    pub opponent: UncheckedAccount<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Lobby {
    pub creator: Pubkey,
    pub lobby_id: String,
    pub wager_lamports: u64,
    pub status: LobbyStatus,
    pub opponent: Option<Pubkey>,
    pub winner: Option<Pubkey>,
    pub transcript_hash: Option<[u8; 32]>,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub lobby_id: String,
    pub total_deposited: u64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum LobbyStatus {
    Open,
    Full,
    InProgress,
    Resolved,
    Cancelled,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Lobby is not open")]
    LobbyNotOpen,
    #[msg("Lobby is not full")]
    LobbyNotFull,
    #[msg("Lobby is not in progress")]
    LobbyNotInProgress,
    #[msg("Cannot join own lobby")]
    CannotJoinOwnLobby,
    #[msg("No opponent in lobby")]
    NoOpponent,
    #[msg("Invalid winner")]
    InvalidWinner,
    #[msg("Cannot cancel lobby in current state")]
    CannotCancelLobby,
}

// Events
#[event]
pub struct LobbyCreated {
    pub lobby_id: String,
    pub creator: Pubkey,
    pub wager_lamports: u64,
}

#[event]
pub struct LobbyJoined {
    pub lobby_id: String,
    pub opponent: Pubkey,
}

#[event]
pub struct LobbyLocked {
    pub lobby_id: String,
}

#[event]
pub struct MatchResolved {
    pub lobby_id: String,
    pub winner: Pubkey,
    pub winnings: u64,
    pub protocol_fee: u64,
}

#[event]
pub struct LobbyCancelled {
    pub lobby_id: String,
}
