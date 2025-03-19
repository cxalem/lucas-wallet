import * as bip39 from "bip39";
import { HDNode } from "@ethersproject/hdnode";
import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";

const ETH_DERIVATION_PATH = "m/44'/60'/0'/0"; // Ethereum derivation path
const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'"; // Solana derivation path

export interface Wallet {
  mnemonic: string;
  privateKey: string;
  address: string;
}

/**
 * Generates a valid mnemonic phrase using bip39.
 * Throws an error if the generated mnemonic is invalid.
 */
function generateMnemonic(): string {
  const mnemonic = bip39.generateMnemonic();
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("Generated an invalid mnemonic.");
  }
  return mnemonic;
}

/**
 * Converts a mnemonic phrase to a seed buffer.
 *
 * @param mnemonic A valid BIP39 mnemonic phrase.
 * @returns A Buffer containing the generated seed.
 */
function mnemonicToSeed(mnemonic: string): Buffer {
  return bip39.mnemonicToSeedSync(mnemonic);
}

/**
 * Converts a seed buffer to an HDNode.
 *
 * @param seed A Buffer containing the seed.
 * @returns An HDNode derived from the seed.
 */
function seedToHDNode(seed: Buffer): HDNode {
  return HDNode.fromSeed(seed);
}

/**
 * Creates a new wallet by generating a new mnemonic phrase
 * and deriving its private key and address on the Ethereum path.
 *
 * @returns A Wallet object with mnemonic, privateKey, and address.
 */
export function createWallet(): Wallet {
  const mnemonic = generateMnemonic();
  return getWallet(mnemonic);
}

/**
 * Restores a wallet from an existing mnemonic phrase.
 * Validates the mnemonic and derives its private key and address.
 *
 * @param mnemonic A valid BIP39 mnemonic phrase.
 * @returns A Wallet object with mnemonic, privateKey, and address.
 */
export function getWallet(mnemonic: string): Wallet {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("Invalid mnemonic provided.");
  }
  const seed = mnemonicToSeed(mnemonic);
  const hdNode = seedToHDNode(seed);
  const childNode = hdNode.derivePath(ETH_DERIVATION_PATH);

  return {
    mnemonic,
    privateKey: childNode.privateKey,
    address: childNode.address,
  };
}

/**
 * Creates a Solana wallet from a mnemonic phrase.
 */
export function createSolanaWallet(): Wallet {
  const mnemonic = generateMnemonic();
  return getSolanaWallet(mnemonic);
}

/**
 * Restores a Solana wallet from a given mnemonic.
 */
export function getSolanaWallet(mnemonic: string): Wallet {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("Invalid mnemonic provided.");
  }

  const seed = mnemonicToSeed(mnemonic);
  const keypair = Keypair.fromSeed(
    derivePath(SOLANA_DERIVATION_PATH, seed.toString("hex")).key
  );

  return {
    mnemonic,
    privateKey: Buffer.from(keypair.secretKey).toString("hex"),
    address: keypair.publicKey.toBase58(),
  };
}