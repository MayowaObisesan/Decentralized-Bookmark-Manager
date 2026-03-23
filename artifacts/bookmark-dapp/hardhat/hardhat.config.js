require("@nomicfoundation/hardhat-ethers");

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const RPC_URL = process.env.VITE_RPC_URL;

if (!PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY not set");
if (!RPC_URL) throw new Error("VITE_RPC_URL not set");

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
      accounts: [PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`],
    },
  },
};
