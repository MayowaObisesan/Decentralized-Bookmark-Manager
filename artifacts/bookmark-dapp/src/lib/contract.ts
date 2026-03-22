import { ethers } from "ethers";

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "url", type: "string" },
      { internalType: "string", name: "tag", type: "string" },
    ],
    name: "addBookmark",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getBookmarks",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "url", type: "string" },
          { internalType: "string", name: "tag", type: "string" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "bool", name: "deleted", type: "bool" },
        ],
        internalType: "struct BookmarkManager.Bookmark[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "deleteBookmark",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getBookmarkCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: false, internalType: "string", name: "title", type: "string" },
      { indexed: false, internalType: "string", name: "url", type: "string" },
      { indexed: false, internalType: "string", name: "tag", type: "string" },
    ],
    name: "BookmarkAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "BookmarkDeleted",
    type: "event",
  },
] as const;

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export const ROOTSTOCK_TESTNET = {
  chainId: 31,
  chainIdHex: "0x1f",
  name: "Rootstock Testnet",
  rpcUrl: import.meta.env.VITE_RPC_URL || "https://public-node.testnet.rsk.co",
  currency: {
    name: "Test RBTC",
    symbol: "tRBTC",
    decimals: 18,
  },
  blockExplorer: "https://explorer.testnet.rootstock.io",
};

export type Bookmark = {
  id: bigint;
  title: string;
  url: string;
  tag: string;
  createdAt: bigint;
  deleted: boolean;
};

export function getReadOnlyContract() {
  const provider = new ethers.JsonRpcProvider(ROOTSTOCK_TESTNET.rpcUrl);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

export function getSignerContract(signer: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}
