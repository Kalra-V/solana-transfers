import * as anchor from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
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
