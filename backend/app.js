import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const connection = new Connection(clusterApiUrl("devnet"));
const secret = bs58.decode(process.env.NEXT_PUBLIC_PRIVATE_KEY);
const keyPair = Keypair.fromSecretKey(secret);
export async function fetchWalletBalance(wallet) {
  const balance = await connection.getBalance(new PublicKey(wallet));
  console.log(balance / LAMPORTS_PER_SOL);
  return balance;
}

export async function WinAmount(amount, wallet) {
  const platformWallet = await connection.getBalance(keyPair.publicKey);
  if (amount > platformWallet) {
    return {
      sucess: false,
    };
  }
  const transfer = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keyPair.publicKey,
      toPubkey: new PublicKey(wallet),
      lamports:
        2 * amount * LAMPORTS_PER_SOL - 0.03 * amount * LAMPORTS_PER_SOL,
    })
  );

  await connection.sendTransaction(transfer, [keyPair]);

  return {
    success: true,
    message: `Congrats! you won an amount of ${amount * 2}`,
  };
}
