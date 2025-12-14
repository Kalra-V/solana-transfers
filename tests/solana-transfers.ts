import * as anchor from "@coral-xyz/anchor";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { BN } from "bn.js";

describe("transfer-sol", () => {
  const provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const payer = provider.wallet;
  const program = anchor.workspace.solanaTransfers;

  const transferAmount = 1 * LAMPORTS_PER_SOL;

  const recipient = new Keypair();

  it("Transfer SOL", async () => {
    await getBalances(payer.publicKey, recipient.publicKey, "Beginning");

    await program.methods
      .transferSol(new BN(transferAmount))
      .accounts({
        payer: payer.publicKey,
        receiver: recipient.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await getBalances(payer.publicKey, recipient.publicKey, "Resulting");
  });

  async function getBalances(
    payerPubkey: PublicKey,
    recipientPubkey: PublicKey,
    timeframe: string
  ) {
    const payerBalance = await provider.connection.getBalance(payerPubkey);
    const recipientBalance = await provider.connection.getBalance(
      recipientPubkey
    );
    console.log(`${timeframe} balances:`);
    console.log(`   Payer: ${payerBalance / LAMPORTS_PER_SOL}`);
    console.log(`   Recipient: ${recipientBalance / LAMPORTS_PER_SOL}`);
  }
});

describe("transfer-tokens", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const payer = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.solanaTransfers;

  let mint: PublicKey;
  let senderTokenAccount: any;
  let recipientTokenAccount: any;
  const recipient = new Keypair();

  before(async () => {
    mint = await createMint(
      provider.connection,
      payer.payer,
      payer.publicKey,
      null,
      0
    );

    senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer.payer,
      mint,
      payer.publicKey
    );

    recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer.payer,
      mint,
      recipient.publicKey
    );

    await mintTo(
      provider.connection,
      payer.payer,
      mint,
      senderTokenAccount.address,
      payer.publicKey,
      100
    );
  });

  it("Transfer tokens!", async () => {
    await program.methods
      .transferTokens(new BN(50))
      .accounts({
        signer: payer.publicKey,
        mint,
        senderTokenAccount: senderTokenAccount.address,
        recipientTokenAccount: recipientTokenAccount.address,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  });
});
