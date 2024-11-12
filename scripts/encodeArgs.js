const { ethers } = require("hardhat");

async function main() {
  const abiCoder = new ethers.utils.AbiCoder();

  // Replace with the constructor arguments for your Factory contract
  const encoded = abiCoder.encode(
    ["address"], // Constructor argument types
    ["0x295c3A0D84Ed4cBEae881C2fc58B23d59d604ee2"] // Your constructor values
  );

  console.log("ABI-encoded constructor arguments:");
  console.log(encoded);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
