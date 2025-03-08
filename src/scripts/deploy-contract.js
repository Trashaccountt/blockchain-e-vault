
// Deployment script for DocumentRegistry contract

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying DocumentRegistry contract...");
  
  // Get the trusted forwarder address for OpenGSN
  const trustedForwarder = process.env.OPEN_GSN_PAYMASTER || "0x0000000000000000000000000000000000000000";
  
  // Get the deployer account (first account from the node)
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  // Deploy the contract
  const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
  const documentRegistry = await DocumentRegistry.deploy(trustedForwarder, deployer.address);
  
  await documentRegistry.deployed();
  
  console.log(`DocumentRegistry deployed to: ${documentRegistry.address}`);
  console.log(`Set CONTRACT_ADDRESS=${documentRegistry.address} in your .env file`);
  
  // Wait for etherscan to index the contract
  console.log("Waiting for Etherscan to index the contract...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds delay
  
  // Verify the contract on Etherscan
  try {
    await hre.run("verify:verify", {
      address: documentRegistry.address,
      constructorArguments: [trustedForwarder, deployer.address],
    });
    console.log("Contract verified on Etherscan");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
