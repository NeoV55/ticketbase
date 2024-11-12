const { exec } = require("child_process");

const verifyContract = async (address, constructorArgs = []) => {
  let argsString = constructorArgs.join(" ");
  exec(
    `npx hardhat verify --network base-sepolia ${address} ${argsString}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Contract verified: ${stdout}`);
    }
  );
};

// Add your deployed contract addresses here
(async () => {
  //await verifyContract("0x1920De7F459cb722Ba31D7eeD05B1a4f05D23e7e");
  //await verifyContract("0x430Ca916d02128A393aE0cE88a6e8450035AE838");
  //await verifyContract("0xFf680809cb2D0334D3Ae8133CaA6eD70ABCe27eE");
})();
