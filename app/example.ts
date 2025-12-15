import { Program, web3 } from "@coral-xyz/anchor";
import type { SolanaTransfers } from "../target/types/solana_transfers";
import idl from "./idl/solana_transfers.json";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import fs from "fs";
import { BN } from "bn.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const recipient = new PublicKey("DF8TJWHnn6P3avD6zr6bxmevQCSADWNquJbse6fhzdt6");

let wallet;

try {
  const keypairPath = process.env.SOLANA_KEYPAIR_PATH;

  if (!keypairPath) {
    throw new Error("SOLANA_KEYPAIR_PATH env var is not set");
  }

  wallet = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, "utf8")))
  );
  console.log("Wallet loaded successfully");
} catch (error) {
  console.error("Error loading wallet", error);
}

export const program = new Program(idl as SolanaTransfers, { connection });

export const transferSol = async () => {
  let blockhash = await connection.getLatestBlockhash();

  const instructions = [
    await program.methods
      .transferSol(new BN(1 * LAMPORTS_PER_SOL))
      .accounts({
        payer: wallet.publicKey,
        receiver: recipient,
        systemProgram: SystemProgram.programId,
      })
      .instruction(),
  ];

  const messageV0 = new web3.TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions: instructions,
  }).compileToV0Message();

  const transaction = new web3.VersionedTransaction(messageV0);

  transaction.sign([wallet]);

  const txSignature = await connection.sendTransaction(transaction);

  console.log("Transaction hash", txSignature);
  console.log(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
};

// transferSol()
//   .then(async () => {
//     console.log("Transfer complete");
//   })
//   .catch((error) => {
//     console.error("Error transferring SOL", error);
//   });

export const transferTokens = async () => {
  let blockhash = await connection.getLatestBlockhash();

  // the token I am using has 9 decimals
  const decimals = 9;
  const amountInBaseUnits = new BN(1).mul(new BN(10).pow(new BN(decimals)));

  const MINT_ADDRESS = new PublicKey(
    "9PW5vownEEBguqy1WEcCH55vzyLb18428RdFagq7mLfe"
  );

  const [senderTokenAccountAddress] = PublicKey.findProgramAddressSync(
    [
      wallet.publicKey.toBuffer(),
      TOKEN_2022_PROGRAM_ID.toBuffer(),
      MINT_ADDRESS.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const [recipientTokenAccountAddress] = PublicKey.findProgramAddressSync(
    [
      recipient.toBuffer(),
      TOKEN_2022_PROGRAM_ID.toBuffer(),
      MINT_ADDRESS.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  console.log("SENDER ATA: ", senderTokenAccountAddress);
  console.log("RECIPIENT ATA: ", recipientTokenAccountAddress);

  const instructions = [
    await program.methods
      .transferTokens(amountInBaseUnits)
      .accounts({
        signer: wallet.publicKey,
        mint: MINT_ADDRESS,
        senderTokenAccount: senderTokenAccountAddress,
        recipientTokenAccount: recipientTokenAccountAddress,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .instruction(),
  ];

  const messageV0 = new web3.TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions: instructions,
  }).compileToV0Message();

  const transaction = new web3.VersionedTransaction(messageV0);

  transaction.sign([wallet]);

  const txSignature = await connection.sendTransaction(transaction);

  console.log("Transaction hash", txSignature);
  console.log(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
};

// transferTokens()
//   .then(async () => {
//     console.log("Transfer complete");
//   })
//   .catch((error) => {
//     console.error("Error transferring TOKENS", error);
//   });
