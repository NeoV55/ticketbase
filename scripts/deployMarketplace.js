const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("here1")
    // Define the initial parameters for the TicketMarketplace constructor
    const initialOwner = deployer.address; // or a different address if needed
    const anotherParameter = deployer.address; // replace with the actual parameter you need
    console.log("here1")
    // Deploy the TicketMarketplace contract
    const TicketMarketplace = await hre.ethers.getContractFactory("TicketMarketplace");
    console.log("here1")
    const ticketMarketplace = await TicketMarketplace.deploy(deployer.address, anotherParameter);
    console.log("here1")
    console.log("TicketMarketplace deployed to:", ticketMarketplace.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
