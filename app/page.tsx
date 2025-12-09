"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { WinAmount } from "../backend/app.js";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
type Prediction = "heads" | "tails" | null;
export default function Home() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [selectedStake, setSelectedStake] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<Prediction>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<Prediction>(null);
  const [outcomeMessage, setOutcomeMessage] = useState<string | null>(null);

  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || "");
  const PLATFORM_WALLET = new PublicKey(
    process.env.NEXT_PUBLIC_PLATFORM_WALLET || ""
  );
  const wallet = useWallet();
  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet.publicKey) {
        const balance = await connection.getBalance(wallet.publicKey);
        setWalletBalance(balance / LAMPORTS_PER_SOL);
      } else {
        setWalletBalance(0);
      }
    };
    fetchBalance();
  }, [wallet.publicKey, connection]);
  const stakeAmounts = [0.1, 0.2, 0.3, 0.5, 1, 1.3, 1.5, 2];

  const handleFlip = async () => {
    if (!selectedStake || !prediction) return;

    setIsFlipping(true);

    const betAmount = selectedStake * LAMPORTS_PER_SOL;
    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey:
          wallet.publicKey != null ? wallet.publicKey : new PublicKey(""),
        toPubkey: PLATFORM_WALLET,
        lamports: Math.floor(betAmount),
      })
    );
    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, "confirmed");

    const flipResult = Math.random() > 0.5 ? "heads" : "tails";
    const won = flipResult === prediction;

    if (won) {
      await WinAmount(selectedStake, wallet.publicKey);
    }

    setResult(flipResult);

    // set outcome message
    setOutcomeMessage(
      won
        ? `Congrats! You won an amount of ${selectedStake * 2} SOL`
        : "You Lost — better luck next time"
    );

    setIsFlipping(false);

    setTimeout(() => {
      setIsFlipping(false);
      setResult(null);
      setSelectedStake(null);
      setPrediction(null);
      setOutcomeMessage(null);
    }, 2000);
  };

  return (
    <div className="relative min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="absolute top-4 right-4 z-50">
          <WalletMultiButton />
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Coin Flip</h1>
          <p className="text-purple-300">Double your bet or lose it all</p>
        </div>

        {/* Outcome message */}
        {outcomeMessage && (
          <div
            className={`p-4 rounded-lg mb-6 text-center font-semibold ${
              outcomeMessage.startsWith("Congrats")
                ? "bg-emerald-600 text-black"
                : "bg-red-600 text-white"
            }`}
          >
            {outcomeMessage}
          </div>
        )}

        {/* Wallet Balance */}
        <div className="bg-linear-to-r from-purple-600 to-pink-600 rounded-lg p-6 mb-10 shadow-lg">
          <p className="text-purple-100 text-sm mb-2">Wallet Balance</p>
          <h2 className="text-4xl font-bold text-white">
            {walletBalance.toFixed(2)} SOL
          </h2>
        </div>

        {/* Stake Selection */}
        <div className="mb-10">
          <h3 className="text-white text-lg font-semibold mb-4">
            Select Stake Amount
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {stakeAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedStake(amount)}
                disabled={isFlipping || amount > walletBalance}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedStake === amount
                    ? "bg-purple-600 text-white scale-105 shadow-lg shadow-purple-500"
                    : amount > walletBalance
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 text-white hover:bg-purple-500"
                }`}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Prediction Buttons */}
        <div className="mb-10">
          <h3 className="text-white text-lg font-semibold mb-4">
            Make Your Prediction
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => setPrediction("heads")}
              disabled={isFlipping || !selectedStake}
              className={`flex-1 py-4 rounded-lg font-semibold text-lg transition-all ${
                prediction === "heads"
                  ? "bg-yellow-500 text-black scale-105 shadow-lg shadow-yellow-400"
                  : "bg-gray-700 text-white hover:bg-yellow-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              👑 Heads
            </button>
            <button
              onClick={() => setPrediction("tails")}
              disabled={isFlipping || !selectedStake}
              className={`flex-1 py-4 rounded-lg font-semibold text-lg transition-all ${
                prediction === "tails"
                  ? "bg-blue-500 text-white scale-105 shadow-lg shadow-blue-400"
                  : "bg-gray-700 text-white hover:bg-blue-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🪙 Tails
            </button>
          </div>
        </div>

        {/* Flip Button */}
        <button
          onClick={handleFlip}
          disabled={!selectedStake || !prediction || isFlipping}
          className="w-full py-4 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          {isFlipping ? "Flipping..." : "FLIP COIN"}
        </button>
      </div>

      {/* Rotating Coin Loader */}
      {isFlipping && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 relative animate-spin">
              <div className="w-full h-full rounded-full bg-linear-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-6xl shadow-2xl border-4 border-yellow-300">
                🪙
              </div>
            </div>
            <p className="text-white text-xl font-semibold">Flipping...</p>
          </div>

          {/* Result Display */}
          {result && (
            <div className="absolute text-center">
              <div className="text-6xl font-bold text-white mb-4 animate-bounce">
                {result === "heads" ? "👑 HEADS" : "🪙 TAILS"}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
