import { Keypair } from "@solana/web3.js";
import axios from "axios"
import fs from "fs/promises"
import fsSync from "fs"
import 'dotenv/config';

const RPC_URL = process.env.RPC_URL;
const FILE_NAME = process.env.FILE_NAME;
const timeout = parseInt(process.env.timeout);
console.log(FILE_NAME, timeout, RPC_URL)

fsSync.appendFileSync(FILE_NAME, new Date().toISOString() + "\n")
async function getBalance() {
    let count = 0;
    let errors = {
        [FILE_NAME]: 0
    };
    while (true) {
        try {
            while (true) {
                const keypair = Keypair.generate();

                // Extract the public and private keys
                const publicKey = keypair.publicKey.toString();
                const secretKey = keypair.secretKey;
                // Display the public keys
                // console.log("Public Key:", publicKey);

                const response = await axios.post(RPC_URL, {
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getBalance",
                    params: [publicKey],
                });

                const lamports = response.data.result.value;
                const sol = lamports / 1_000_000_000;


                let data = {
                    lamports,
                    sol,
                    publicKey,
                    secretKey
                }

                let str = JSON.stringify(data) + "\n"

                if (lamports > 10000) {
                    await fs.appendFile(FILE_NAME, str)
                }

                count++;
                if (count % 100 == 0) {
                    console.log("Count: ", count);
                }
            }
        }
        catch (e) {
            errors[FILE_NAME]++;
            console.log("Errors: ", errors);
            await new Promise(resolve => setTimeout(resolve, timeout * 1000));
        }
    }
}

getBalance();

