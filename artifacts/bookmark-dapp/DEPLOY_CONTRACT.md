# Deploying BookmarkManager to Rootstock Testnet

## Prerequisites

1. Node.js installed
2. tRBTC in your wallet (get it from https://faucet.rootstock.io)
3. MetaMask configured for Rootstock Testnet

## Quick Deploy with Hardhat

```bash
npm install -g hardhat
mkdir deploy-bookmark && cd deploy-bookmark
npx hardhat init   # choose "empty hardhat.config.js"
```

Copy `contracts/BookmarkManager.sol` into `contracts/` folder.

Install dependencies:
```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

Update `hardhat.config.js`:
```js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    rootstockTestnet: {
      url: "YOUR_ALCHEMY_RPC_URL",
      chainId: 31,
      accounts: ["YOUR_PRIVATE_KEY"],
    },
  },
};
```

Create `scripts/deploy.js`:
```js
const { ethers } = require("hardhat");

async function main() {
  const BookmarkManager = await ethers.getContractFactory("BookmarkManager");
  const contract = await BookmarkManager.deploy();
  await contract.waitForDeployment();
  console.log("BookmarkManager deployed to:", await contract.getAddress());
}

main().catch(console.error);
```

Deploy:
```bash
npx hardhat run scripts/deploy.js --network rootstockTestnet
```

## After Deployment

Copy the contract address and set it as `VITE_CONTRACT_ADDRESS` in your Replit Secrets. The app will automatically connect to the deployed contract.
