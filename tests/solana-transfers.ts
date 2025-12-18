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

  const transferAmount = 0.5 * LAMPORTS_PER_SOL;

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

describe("transfer-sol-to-pda", () => {
  const provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const payer = provider.wallet;
  const program = anchor.workspace.solanaTransfers;

  const transferAmount = 0.5 * LAMPORTS_PER_SOL;

  const [recipientPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("xyzpda"), payer.publicKey.toBuffer()],
    program.programId
  );

  it("Transfer SOL to PDA", async () => {
    await program.methods
      .transferSolToPda(new BN(transferAmount))
      .accounts({
        sender: payer.publicKey,
        recipient: recipientPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  });
});

describe("transfer-sol-from-pda", () => {
  const provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const payer = provider.wallet;
  const program = anchor.workspace.solanaTransfers;

  const transferAmount = 0.5 * LAMPORTS_PER_SOL;

  const [pdaAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("xyzpda"), payer.publicKey.toBuffer()],
    program.programId
  );

  console.log("PDA ACCOUNT: ", pdaAccount);

  it("Transfer SOL from PDA", async () => {
    await program.methods
      .transferSolFromPda(new BN(transferAmount))
      .accounts({
        pda: pdaAccount,
        recipient: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  });
});

describe("transfer-tokens-to-pda", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const payer = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.solanaTransfers;

  let mint: PublicKey;
  let senderTokenAccount: any;
  let pda_token_account: any;
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

    pda_token_account = await getOrCreateAssociatedTokenAccount(
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

  it("Transfer tokens to PDA!", async () => {
    await program.methods
      .transferTokensToPda(new BN(50))
      .accounts({
        signer: payer.publicKey,
        mint,
        senderTokenAccount: senderTokenAccount.address,
        pdaTokenAccount: pda_token_account.address,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  });
});

describe("transfer-tokens-from-pda", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const payer = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.solanaTransfers;

  let mint: PublicKey;
  let recipientTokenAccount: any;
  let pda_token_account: any;

  const [recipient] = PublicKey.findProgramAddressSync(
    [Buffer.from("xyzpdastill"), payer.publicKey.toBuffer()],
    program.programId
  );

  before(async () => {
    mint = await createMint(
      provider.connection,
      payer.payer,
      payer.publicKey,
      null,
      0
    );

    recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer.payer,
      mint,
      payer.publicKey
    );

    pda_token_account = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer.payer,
      mint,
      recipient,
      true
    );

    console.log("MINT: ", mint);
    console.log("PDA ATA: ", pda_token_account.address);
    console.log("PDA: ", recipient);

    await mintTo(
      provider.connection,
      payer.payer,
      mint,
      recipientTokenAccount.address,
      payer.publicKey,
      100
    );
  });

  console.log("Minted to user's ATA");

  it("Transfer tokens from PDA!", async () => {
    console.log("Sending from user's ATA to PDA");
    await program.methods
      .transferTokensToPda(new BN(50))
      .accounts({
        signer: payer.publicKey,
        mint,
        senderTokenAccount: recipientTokenAccount.address,
        pdaTokenAccount: pda_token_account.address,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Sending from PDA to user's ATA");
    await program.methods
      .transferTokensFromPda(new BN(50))
      .accounts({
        signer: payer.publicKey,
        recipient,
        mint,
        receiverTokenAccount: recipientTokenAccount.address,
        pdaTokenAccount: pda_token_account.address,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  });
});
