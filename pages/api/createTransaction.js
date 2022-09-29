import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { create } from "ipfs-http-client";
import products from "./products.json";

const sellerAddress = '397SrhDetu3vQpPrNiaPwjY3kALjdu9P8S75RZgH9Mru'
const sellerPublicKey = new PublicKey(sellerAddress);

const createTransaction = async (req, res) => {
  try {

    // extract the transaction data from the request body

    const { buyer, orderID, itemID } = req.body;

    // If we don't have something we need, stop!
    if (!buyer) {
      return res.status(400).json({
        message: "missing buyer address",
      });
    }

    if (!orderID) {
      return res.status(400).json({
        message: "Missing order ID",
      });
    }
    
    // fetch item price from the products.json using itemID
    const itemPrice = products.find((item) => item.id === itemID).price;

    if (!itemPrice){
      return res.status(404).json({
        message: "Item not found, please check item ID",
      });
    }

    // convert our price to the correct format
    const bigAmount = BigNumber(itemPrice);
    const buyerPublicKey = new PublicKey(buyer);
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection (endpoint);

    // A blockhash is sort of like an ID for a block. It lets you identify each other.
    const {blockhash} = await connection.getLatestBlockhash("finalized");

    // The first two things we need 
    // - recent block id
    // - the public key of the fee payer

    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: buyerPublicKey,
    });

    // this is the action that the transaction will take and we're just going to transfer some SOL
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      lamports: bigAmount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      toPubkey: sellerPublicKey,
    });

    transferInstruction.keys.push({
      // we'll use our orderId to find this transaction later
      pubkey: new PublicKey(orderID),
      isSigner: false,
      isWritable: false,
    });

    tx.add(transferInstruction);

    // formatting our transaction
    const serializedTransaction = tx.serialize({
      requireAllSignatures: false,
    });

    const base64 = serializedTransaction.toString("base64");

    res.status(200).json({
      transaction: base64,
    });
  } catch (error) {
    console.error(error) ;

    res.status(500).json({ error: "error creating tx" });
    return;
  }
}

export default function handler (req, res) {
  if (req.method === "POST") {
    createTransaction(req, res);
  } else {
    res.status(405).end();
  }
}