require("@nomicfoundation/hardhat-ethers");

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const RPC_URL = process.env.VITE_RPC_URL || "https://public-node.testnet.rsk.co";

const formattedKey = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    rootstockTestnet: {
      url: RPC_URL,
      chainId: 31,
      accounts: [formattedKey],
    },
  },
};
