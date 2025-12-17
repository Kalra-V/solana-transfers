use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};

declare_id!("4s2eUn3rBK2y6KSgPgMmkucsPPogxMPbK5HtUNhfV91y");

#[program]
pub mod solana_transfers {
    use super::*;

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

    pub fn transfer_sol_to_pda(ctx: Context<TransferSolToPDA>, amount: u64) -> Result<()> {
        let from_pubkey = ctx.accounts.sender.to_account_info();
        let to_pubkey = ctx.accounts.recipient.to_account_info();
        let program_id = ctx.accounts.system_program.to_account_info();

        let cpi_context = CpiContext::new(
            program_id,
            system_program::Transfer {
                from: from_pubkey,
                to: to_pubkey,
            },
        );
        system_program::transfer(cpi_context, amount)?;
        Ok(())
    }

    pub fn transfer_sol_from_pda(ctx: Context<TransferSolFromPDA>, amount: u64) -> Result<()> {
        ctx.accounts.pda.sub_lamports(amount)?;
        ctx.accounts.recipient.add_lamports(amount)?;

        Ok(())
    }
}

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

#[derive(Accounts)]
pub struct TransferSolToPDA<'info> {
    #[account(mut)]
    sender: Signer<'info>,
    /// CHECK: we are not sure if the PDA already exists on-chain or not.
    /// So we use init_if_needed to ensure the account is created if its not there
    #[account(init_if_needed, payer = sender, space = 0, seeds = [b"xyzpda", sender.key().as_ref()], bump)]
    recipient: UncheckedAccount<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferSolFromPDA<'info> {
    /// CHECK: not sure why this is unsafe
    #[account(mut, seeds = [b"xyzpda", recipient.key().as_ref()], bump)]
    pda: AccountInfo<'info>,
    #[account(mut)]
    recipient: SystemAccount<'info>,
    system_program: Program<'info, System>,
}
