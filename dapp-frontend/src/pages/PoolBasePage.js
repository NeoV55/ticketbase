import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Navbar from '../components/Navbar';
import EventTicketSystemABI from '../contracts/EventTicketSystem.json';
import PoolContractABI from '../contracts/LiquidityPoolFactory.json'; // Replace with actual PoolContract ABI
import EventFactoryABI from '../contracts/EventFactory.json';

const POOL_CONTRACT_ADDRESS = '0x7f1a84008171D8f3209BB889743656DfC8373575'; // Replace with your Pool Contract address
const eventFactoryAddress = '0x1920De7F459cb722Ba31D7eeD05B1a4f05D23e7e'; // EventFactory address

const PoolBasePage = () => {
    const [nfts, setNfts] = useState([]);
    const [selectedNft, setSelectedNft] = useState(null);
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ethAmount, setEthAmount] = useState('');
    const [proposalDescription, setProposalDescription] = useState('');
    const [votingDuration, setVotingDuration] = useState('');
    const [poolDetails, setPoolDetails] = useState({});

    const web3 = new Web3(window.ethereum);

    useEffect(() => {
        loadUserNFTs();
        loadActivePools();
    }, []);

    // Load NFTs from user's wallet (same logic as MarketBasePage)
    const loadUserNFTs = async () => {
        try {
            const accounts = await web3.eth.getAccounts();
            const user = accounts[0];
            const eventFactory = new web3.eth.Contract(EventFactoryABI.abi, eventFactoryAddress);
            const events = await eventFactory.methods.getDeployedEvents().call();
            const ownedTickets = await fetchOwnedTickets(events, user);
            setNfts(ownedTickets);
        } catch (error) {
            console.error('Error loading NFTs:', error);
        }
    };

    const fetchOwnedTickets = async (events, user) => {
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

    // Create a new liquidity pool
    const handleCreateLiquidityPool = async () => {
        if (!selectedNft || !ethAmount) {
            alert('Please select an NFT and enter an ETH amount.');
            return;
        }
        try {
            const accounts = await web3.eth.getAccounts();
            const user = accounts[0];
            const contract = new web3.eth.Contract(PoolContractABI.abi, POOL_CONTRACT_ADDRESS);
            const amountInWei = web3.utils.toWei(ethAmount, 'ether');
            await contract.methods
                .createLiquidityPool(selectedNft.eventAddress, selectedNft.tokenId)
                .send({ from: user, value: amountInWei });
            alert('Liquidity Pool created successfully!');
            loadActivePools(); // Reload pools
        } catch (error) {
            console.error('Error creating liquidity pool:', error);
            alert('Transaction failed! Check console for details.');
        }
    };

    // Load active pools using getAllActivePools()
    const loadActivePools = async () => {
        try {
            const contract = new web3.eth.Contract(PoolContractABI.abi, POOL_CONTRACT_ADDRESS);
            const activePools = await contract.methods.getAllActivePools().call();
            setPools(activePools);
        } catch (error) {
            console.error('Error loading active pools:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get detailed stats for a pool
    const getPoolStats = async (poolId) => {
        try {
            const contract = new web3.eth.Contract(PoolContractABI.abi, POOL_CONTRACT_ADDRESS);
            const details = await contract.methods.getPoolDetails(poolId).call();
            setPoolDetails(details);
        } catch (error) {
            console.error('Error fetching pool details:', error);
        }
    };

    return (
        <div className="container">
            <Navbar />
            <h1>Liquidity Pools</h1>

            <h2>Create Liquidity Pool</h2>
            <div>
                <label>Select NFT:</label>
                <select
                    onChange={(e) => setSelectedNft(nfts[e.target.value])}
                >
                    <option value="">Select NFT</option>
                    {nfts.map((nft, index) => (
                        <option key={index} value={index}>
                            {nft.eventName} (Token ID: {nft.tokenId})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>ETH Amount:</label>
                <input
                    type="text"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    placeholder="Enter ETH amount"
                />
            </div>

            <button onClick={handleCreateLiquidityPool}>
                Create Liquidity Pool
            </button>

            <h2>Active Pools</h2>
            {loading ? (
                <p>Loading pools...</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Pool ID</th>
                            <th>Pool Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pools.map((pool, index) => (
                            <tr key={index}>
                                <td>{pool.poolId}</td>
                                <td>{pool.poolAddress}</td>
                                <td>
                                    <button onClick={() => getPoolStats(pool.poolId)}>
                                        View Details
                                    </button>
                                    <button>Add Liquidity</button>
                                    <button>Create Proposal</button>
                                    <button>Vote</button>
                                    <button>Execute Proposal</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {poolDetails.token && (
                <div>
                    <h3>Pool Details</h3>
                    <p>Token: {poolDetails.token}</p>
                    <p>NFT: {poolDetails.nft}</p>
                    <p>Total Liquidity: {poolDetails.totalLiquidity}</p>
                    <p>Total Proposals: {poolDetails.totalProposals}</p>
                    <p>Active: {poolDetails.isActive ? 'Yes' : 'No'}</p>
                </div>
            )}
        </div>
    );
};

export default PoolBasePage;
