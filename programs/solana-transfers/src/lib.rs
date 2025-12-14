use anchor_lang::prelude::*;

declare_id!("4s2eUn3rBK2y6KSgPgMmkucsPPogxMPbK5HtUNhfV91y");

#[program]
pub mod solana_transfers {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
