import { Keypair, PublicKey } from "@solana/web3.js";
import {
    getAssociatedTokenAddress
} from "@solana/spl-token";
import axios from "axios";
import fs from "fs/promises";
import fsSync from "fs";
import "dotenv/config";

const RPC_URL = process.env.RPC_URL;
const FILE_NAME = process.env.FILE_NAME;
const timeout = parseInt(process.env.timeout);

console.log(FILE_NAME, timeout, RPC_URL);

// USDT Mint (Solana mainnet)
const USDT_MINT = new PublicKey(
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
);

fsSync.appendFileSync(FILE_NAME, new Date().toISOString() + "\n");

async function getBalance() {
    let count = 0;
    let errors = {
        [FILE_NAME]: 0,
    };

    while (true) {
        try {
            while (true) {
                const keypair = Keypair.generate();

                const publicKey = keypair.publicKey.toString();
                const secretKey = keypair.secretKey;

                // ---------- SOL BALANCE ----------
                const solRes = await axios.post(RPC_URL, {
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getBalance",
                    params: [publicKey],
                });

                const lamports = solRes.data.result.value;
                const sol = lamports / 1_000_000_000;

                // ---------- USDT PDA + BALANCE ----------
                const ownerPubkey = new PublicKey(publicKey);

                const usdtAta = await getAssociatedTokenAddress(
                    USDT_MINT,
                    ownerPubkey
                );

                let usdtAmount = 0;
                console.log(sol, usdtAmount);

                try {
                    const usdtRes = await axios.post(RPC_URL, {
                        jsonrpc: "2.0",
                        id: 1,
                        method: "getTokenAccountBalance",
                        params: [usdtAta.toString()],
                    });

                    usdtAmount = Number(usdtRes.data.result.value.amount);
                } catch {
                    // ATA doesn't exist → no USDT
                    usdtAmount = 0;
                }

                // ---------- DATA ----------
                const data = {
                    publicKey,
                    secretKey,
                    lamports,
                    sol,
                    usdt: usdtAmount / 1_000_000, // USDT decimals = 6
                    usdtAta: usdtAta.toString(),
                };

                // Save if wallet has SOL OR USDT
                if (lamports > 10000 || usdtAmount > 0) {
                    await fs.appendFile(FILE_NAME, JSON.stringify(data) + "\n");
                }

                count++;
                if (count % 100 === 0) {
                    console.log("Count:", count);
                }
            }
        } catch (e) {
            errors[FILE_NAME]++;
            if (errors[FILE_NAME] % 50 === 0) {
                console.log("Errors:", errors);
            }
            await new Promise((resolve) =>
                setTimeout(resolve, timeout * 1000)
            );
        }
    }
}

getBalance();
