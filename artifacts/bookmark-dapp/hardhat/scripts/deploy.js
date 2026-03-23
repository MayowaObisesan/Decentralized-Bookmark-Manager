const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "tRBTC");

  if (balance === 0n) {
    console.error("ERROR: Account has no tRBTC. Get testnet funds from https://faucet.rootstock.io");
    process.exit(1);
  }

  console.log("Deploying BookmarkManager...");
  const BookmarkManager = await ethers.getContractFactory("BookmarkManager");
  const contract = await BookmarkManager.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("BookmarkManager deployed to:", address);
  console.log("\nSet this as your VITE_CONTRACT_ADDRESS secret in Replit:");
  console.log(address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
