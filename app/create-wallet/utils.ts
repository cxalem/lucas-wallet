import * as bip39 from "bip39";
import { HDNode } from "@ethersproject/hdnode";

const ETH_PATH = "m/44'/60'/0'/0";

const generateMnemonic = () => {
  const mnemonic = bip39.generateMnemonic();
  const isValid = bip39.validateMnemonic(mnemonic);

  if (!isValid) {
    throw new Error("Invalid mnemonic");
  }

  return mnemonic;
};

const menemonicToSeed = (mnemonic: string) => {
  return bip39.mnemonicToSeedSync(mnemonic);
};

const seedToHdNode = (seed: Buffer<ArrayBufferLike>) => {
  return HDNode.fromSeed(seed);
};

export const createWallet = () => {
  const mnemonic = generateMnemonic();
  const seed = menemonicToSeed(mnemonic);
  const hdNode = seedToHdNode(seed);
  const childNode = hdNode.derivePath(ETH_PATH);

  return {
    mnemonic,
    privateKey: childNode.privateKey,
    address: childNode.address,
  };
};

export const getWallet = (mnemonic: string) => {
  const seed = menemonicToSeed(mnemonic);
  const hdNode = seedToHdNode(seed);
  const childNode = hdNode.derivePath(ETH_PATH);

  return {
    mnemonic,
    privateKey: childNode.privateKey,
    address: childNode.address,
  };
};
