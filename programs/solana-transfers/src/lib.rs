use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token_interface::{self, TokenAccount, TokenInterface, TransferChecked, Mint};

declare_id!("4s2eUn3rBK2y6KSgPgMmkucsPPogxMPbK5HtUNhfV91y");

#[program]
pub mod solana_transfers {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn transfer_sol(ctx: Context<TransferSol>, amount: u64) -> Result<()> {
        msg!("Transferring SOL...");

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.receiver.to_account_info(),
                },
            ),
            amount, // amount taken is in lamports
        )?;

        msg!("SOL transferred successfully!");

        Ok(())
    }

    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        msg!("Transferring tokens...");

        let decimals = ctx.accounts.mint.decimals;

        let cpi_accounts = TransferChecked {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.sender_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
        token_interface::transfer_checked(cpi_context, amount, decimals)?;

        msg!("Tokens transferred successfully!");

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct TransferSol<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub receiver: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub sender_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
}
