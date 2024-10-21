const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  const LiquidityPoolFactory = await hre.ethers.getContractFactory("LiquidityPoolFactory");
  const liquidityPool = await LiquidityPoolFactory.deploy(deployer.address);
  await liquidityPool.deployed();

  console.log(`LiquidityPoolFactory deployed at: ${liquidityPool.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
