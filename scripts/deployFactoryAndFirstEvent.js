const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Deploy EventFactory
  const EventFactory = await hre.ethers.getContractFactory("EventFactory");
  const eventFactory = await EventFactory.deploy();
  await eventFactory.deployed();
  console.log(`EventFactory deployed at: ${eventFactory.address}`);

  // Create the first event
  const createEventTx = await eventFactory.createEvent(
    "BASE Hack Day SEA",
    "BHDSEA",
    "Sunway University, Malaysia",
    "https://based-sea.devfolio.co/_next/image?url=https%3A%2F%2Fassets.devfolio.co%2Fhackathons%2Fa64f63e38b5a4c549a517735d9d870cf%2Fassets%2Fcover%2F72.png&w=1024&q=100",
    100, // total tickets
    Math.floor(Date.now() / 1000) + 3600, // start date (1 hour from now)
    Math.floor(Date.now() / 1000) + 86400 // end date (24 hours from now)
  );
  await createEventTx.wait();
  console.log("First event created.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
