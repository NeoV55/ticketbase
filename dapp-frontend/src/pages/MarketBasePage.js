import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TicketMarketplaceABI from '../contracts/TicketMarketplace.json';
import EventTicketSystemABI from '../contracts/EventTicketSystem.json';
import EventFactoryABI from '../contracts/EventFactory.json';
import Web3 from 'web3';

const MARKETPLACE_ADDRESS = '0x4b0864e55616b4aa2bFeFAedDA73c01565651033'; // Your TicketMarketplace contract address
const FEE_RECEIVER_ADDRESS = '0x295c3A0D84Ed4cBEae881C2fc58B23d59d604ee2'; // Replace with your actual fee receiver address
const eventFactoryAddress = '0x1920De7F459cb722Ba31D7eeD05B1a4f05D23e7e'; // Your EventFactory address

const MarketBasePage = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true); // State to manage loading status
    const [nfts, setNfts] = useState([]); // State to manage owned NFTs
    const [selectedNft, setSelectedNft] = useState({ contractAddress: '', tokenId: '' }); // Selected NFT for listing
    const [price, setPrice] = useState(''); // Price input for listing

    useEffect(() => {
        const loadWalletData = async () => {
            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const user = accounts[0]; // Connected wallet address

            const eventFactory = new web3.eth.Contract(EventFactoryABI.abi, eventFactoryAddress);

            try {
                const events = await eventFactory.methods.getDeployedEvents().call(); // Fetch all events
                const ownedTicketsData = await fetchOwnedTickets(web3, events, user);
                setNfts(ownedTicketsData); // Set NFTs owned by the user

                // Call to load listings after fetching NFTs
                loadListings(web3, user);
            } catch (error) {
                console.error('Error fetching wallet data:', error);
            }
            
            setLoading(false);
        };

        loadWalletData();
    }, []);

    // Load listings from the marketplace
    const loadListings = async (web3) => {
        try {
            const contract = new web3.eth.Contract(TicketMarketplaceABI.abi, MARKETPLACE_ADDRESS);
            
            // Call getAllActiveListings function from the contract
            const items = await contract.methods.getAllActiveListings().call();

            // Transform the tuple data to a more readable format
            const transformedListings = items.map(([contractAddress, ticketId, seller, price]) => ({
                contractAddress,  // Address of the ticket contract
                ticketId,         // ID of the ticket being sold
                seller,           // Seller's address
                price             // Ticket price in Wei
            }));

            setListings(transformedListings); // Set listings state
        } catch (error) {
            console.error("Error loading listings:", error);
        }
    };


    // Fetch owned tickets function (renamed for clarity)
    const fetchOwnedTickets = async (web3, events, user) => {
        const tickets = [];

        for (const eventAddress of events) {
            const contract = new web3.eth.Contract(EventTicketSystemABI.abi, eventAddress);
            const totalMinted = await contract.methods.ticketsMinted().call();
            const eventName = await contract.methods.name().call();

            for (let ticketId = 1; ticketId <= totalMinted; ticketId++) {
                const owner = await contract.methods.ownerOf(ticketId).call();
                if (owner.toLowerCase() === user.toLowerCase()) {
                    tickets.push({ eventAddress, tokenId: ticketId, eventName });
                }
            }
        }

        return tickets;
    };

    // Function to handle listing the NFT
    const handleListNft = async () => {
        if (!selectedNft.contractAddress || !selectedNft.tokenId || !price) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const currentAccount = accounts[0];

            const contract = new web3.eth.Contract(TicketMarketplaceABI.abi, MARKETPLACE_ADDRESS);
            const priceInWei = web3.utils.toWei(price, 'ether'); // Convert price from ETH to Wei

            await contract.methods.listTicket(selectedNft.contractAddress, selectedNft.tokenId, priceInWei).send({ from: currentAccount });
            alert("Ticket listed successfully!");
            loadListings(web3, currentAccount); // Reload listings after successful listing
        } catch (error) {
            console.error("Error listing ticket:", error);
            alert("Transaction failed! Please check console for details.");
        }
    };

    // Function to handle buy action
    const handleBuy = async (item) => {
        try {
            const web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const currentAccount = accounts[0];

            // Interact with contract to buy the ticket
            const contract = new web3.eth.Contract(TicketMarketplaceABI.abi, MARKETPLACE_ADDRESS);
            await contract.methods.buyTicket(item.tokenId).send({ from: currentAccount, value: item.price });
            alert("Ticket purchased successfully!");
        } catch (error) {
            console.error("Error purchasing ticket:", error);
            alert("Transaction failed! Please check console for details.");
        }
    };

    return (
        <div className="container">
            <Navbar />
            <h1>Marketplace</h1>
            {loading ? (
                <p>Loading listings...</p>
            ) : (
                <>
                    <h2>Current Listings</h2>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Owner</th>
                                <th>Price</th>
                                <th>Buy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.seller}</td>
                                    <td>{Web3.utils.fromWei(item.price, 'ether')} ETH</td>
                                    <td>
                                        <button className="btn btn-primary" onClick={() => handleBuy(item)}>Buy</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h2>List Your NFT</h2>
                    <div>
                        <label htmlFor="nftDropdown">Select NFT:</label>
                        <select
                            id="nftDropdown"
                            onChange={(e) => {
                                const selected = nfts[e.target.value];
                                setSelectedNft({ contractAddress: selected.eventAddress, tokenId: selected.tokenId });
                            }}
                        >
                            <option value="">Select NFT</option>
                            {nfts.map((nft, index) => (
                                <option key={index} value={index}>
                                    {nft.eventName} (Token ID: {nft.tokenId})
                                </option>
                            ))}
                        </select>

                        <div>
                            <label htmlFor="price">Price (ETH):</label>
                            <input
                                type="text"
                                id="price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Enter price in ETH"
                            />
                        </div>
                        <button onClick={handleListNft}>List NFT</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default MarketBasePage;
