use anchor_lang::prelude::*;

declare_id!("PackVRF111111111111111111111111111111111");

#[program]
pub mod packs_vrf {
    use super::*;

    /// Purchase a booster pack
    pub fn buy_pack(
        ctx: Context<BuyPack>,
        pack_id: String,
    ) -> Result<()> {
        let pack = &mut ctx.accounts.pack;
        let vault = &mut ctx.accounts.vault;
        
        // Initialize pack
        pack.buyer = ctx.accounts.buyer.key();
        pack.pack_id = pack_id.clone();
        pack.price_lamports = PACK_PRICE_LAMPORTS;
        pack.status = PackStatus::Purchased;
        pack.bump = *ctx.bumps.get("pack").unwrap();
        
        // Transfer payment
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, PACK_PRICE_LAMPORTS)?;
        
        vault.total_revenue += PACK_PRICE_LAMPORTS;
        
        emit!(PackPurchased {
            pack_id: pack.pack_id.clone(),
            buyer: pack.buyer,
            price_lamports: PACK_PRICE_LAMPORTS,
        });
        
        Ok(())
    }

    /// Request VRF for pack opening
    pub fn request_vrf(
        ctx: Context<RequestVrf>,
        vrf_request_id: String,
    ) -> Result<()> {
        let pack = &mut ctx.accounts.pack;
        
        require!(pack.status == PackStatus::Purchased, ErrorCode::PackNotPurchased);
        
        pack.vrf_request_id = Some(vrf_request_id.clone());
        pack.status = PackStatus::VrfRequested;
        
        emit!(VrfRequested {
            pack_id: pack.pack_id.clone(),
            vrf_request_id,
        });
        
        Ok(())
    }

    /// Fulfill VRF and generate pack rewards
    pub fn fulfill_vrf(
        ctx: Context<FulfillVrf>,
        randomness: [u8; 32],
    ) -> Result<()> {
        let pack = &mut ctx.accounts.pack;
        
        require!(pack.status == PackStatus::VrfRequested, ErrorCode::VrfNotRequested);
        require!(pack.vrf_request_id.is_some(), ErrorCode::NoVrfRequest);
        
        // Generate pack rewards based on randomness
        let rewards = generate_pack_rewards(randomness);
        
        pack.rewards = Some(rewards.clone());
        pack.status = PackStatus::Opened;
        pack.opened_at = Some(Clock::get()?.unix_timestamp);
        
        emit!(PackOpened {
            pack_id: pack.pack_id.clone(),
            buyer: pack.buyer,
            rewards: rewards.clone(),
        });
        
        Ok(())
    }

    /// Claim pack rewards (creates cards off-chain)
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let pack = &mut ctx.accounts.pack;
        
        require!(pack.status == PackStatus::Opened, ErrorCode::PackNotOpened);
        require!(pack.rewards.is_some(), ErrorCode::NoRewards);
        require!(!pack.claimed, ErrorCode::AlreadyClaimed);
        
        pack.claimed = true;
        
        emit!(RewardsClaimed {
            pack_id: pack.pack_id.clone(),
            buyer: pack.buyer,
        });
        
        Ok(())
    }
}

fn generate_pack_rewards(randomness: [u8; 32]) -> Vec<CardReward> {
    let mut rewards = Vec::new();
    let mut rng_seed = randomness;
    
    // Generate 5 cards per pack
    for i in 0..5 {
        let card_reward = generate_single_card(&mut rng_seed, i);
        rewards.push(card_reward);
    }
    
    rewards
}

fn generate_single_card(rng_seed: &mut [u8; 32], index: usize) -> CardReward {
    // Simple PRNG using the seed
    let mut value = u64::from_le_bytes([
        rng_seed[index * 4],
        rng_seed[index * 4 + 1],
        rng_seed[index * 4 + 2],
        rng_seed[index * 4 + 3],
        0, 0, 0, 0,
    ]);
    
    // Update seed for next generation
    value = value.wrapping_mul(1103515245).wrapping_add(12345);
    rng_seed[index * 4..index * 4 + 4].copy_from_slice(&value.to_le_bytes()[..4]);
    
    // Determine rarity based on probability
    let rarity_roll = value % 100;
    let rarity = if rarity_roll < 2 {
        Rarity::Legendary
    } else if rarity_roll < 20 {
        Rarity::Rare
    } else {
        Rarity::Common
    };
    
    // Determine if shiny (1/128 chance)
    let shiny_roll = value % 128;
    let is_shiny = shiny_roll == 0;
    
    // Random Pokemon (1-151 for Gen 1)
    let pokemon_roll = value % 151;
    let dex_number = (pokemon_roll + 1) as u16;
    
    CardReward {
        dex_number,
        rarity,
        is_shiny,
        level: 1,
    }
}

#[derive(Accounts)]
#[instruction(pack_id: String)]
pub struct BuyPack<'info> {
    #[account(
        init,
        payer = buyer,
        space = 8 + Pack::INIT_SPACE,
        seeds = [b"PACK", pack_id.as_bytes()],
        bump
    )]
    pub pack: Account<'info, Pack>,
    
    #[account(
        mut,
        seeds = [b"VAULT"],
        bump
    )]
    pub vault: Account<'info, PackVault>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestVrf<'info> {
    #[account(mut)]
    pub pack: Account<'info, Pack>,
}

#[derive(Accounts)]
pub struct FulfillVrf<'info> {
    #[account(mut)]
    pub pack: Account<'info, Pack>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub pack: Account<'info, Pack>,
}

#[account]
#[derive(InitSpace)]
pub struct Pack {
    pub buyer: Pubkey,
    pub pack_id: String,
    pub price_lamports: u64,
    pub status: PackStatus,
    pub vrf_request_id: Option<String>,
    pub rewards: Option<Vec<CardReward>>,
    pub opened_at: Option<i64>,
    pub claimed: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct PackVault {
    pub total_revenue: u64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PackStatus {
    Purchased,
    VrfRequested,
    Opened,
    Claimed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct CardReward {
    pub dex_number: u16,
    pub rarity: Rarity,
    pub is_shiny: bool,
    pub level: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Rarity {
    Common,
    Rare,
    Legendary,
}

const PACK_PRICE_LAMPORTS: u64 = 100_000_000; // 0.1 SOL

#[error_code]
pub enum ErrorCode {
    #[msg("Pack not purchased")]
    PackNotPurchased,
    #[msg("VRF not requested")]
    VrfNotRequested,
    #[msg("No VRF request")]
    NoVrfRequest,
    #[msg("Pack not opened")]
    PackNotOpened,
    #[msg("No rewards")]
    NoRewards,
    #[msg("Already claimed")]
    AlreadyClaimed,
}

// Events
#[event]
pub struct PackPurchased {
    pub pack_id: String,
    pub buyer: Pubkey,
    pub price_lamports: u64,
}

#[event]
pub struct VrfRequested {
    pub pack_id: String,
    pub vrf_request_id: String,
}

#[event]
pub struct PackOpened {
    pub pack_id: String,
    pub buyer: Pubkey,
    pub rewards: Vec<CardReward>,
}

#[event]
pub struct RewardsClaimed {
    pub pack_id: String,
    pub buyer: Pubkey,
}
