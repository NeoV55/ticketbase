import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Navbar from '../components/Navbar';
import EventTicketSystemABI from '../contracts/EventTicketSystem.json';
import PoolContractABI from '../contracts/LiquidityPoolFactory.json';
import EventFactoryABI from '../contracts/EventFactory.json';

const POOL_CONTRACT_ADDRESS = '0x7f1a84008171D8f3209BB889743656DfC8373575'; // Replace with your Pool Contract address
const eventFactoryAddress = '0x1920De7F459cb722Ba31D7eeD05B1a4f05D23e7e'; // EventFactory address

const PoolBasePage = () => {
    const [nfts, setNfts] = useState([]);
    const [selectedNft, setSelectedNft] = useState(null);
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ethAmount, setEthAmount] = useState('');
    const [ethAmounts, setEthAmounts] = useState({}); // Track individual pool amounts
    const [approvedPools, setApprovedPools] = useState([]); // Track approved pools
    const [poolDetails, setPoolDetails] = useState({});
    const [proposalDetails, setProposalDetails] = useState({});
    const [voteSelections, setVoteSelections] = useState({});
    const [selectedTokens, setSelectedTokens] = useState({});
    //const [ethAmount, setEthAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState(''); // Add this line
    const web3 = new Web3(window.ethereum);
    

    useEffect(() => {
        loadUserNFTs();
        loadActivePools();
    }, []);

    

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

    const handleCreateLiquidityPool = async () => {
        if (!selectedNft || !selectedToken) {
            alert('Please select an NFT and enter an ETH amount.');
            return;
        }
        try {
            const accounts = await web3.eth.getAccounts();
            const user = accounts[0];
            const poolContract = new web3.eth.Contract(PoolContractABI.abi, POOL_CONTRACT_ADDRESS);
            //const amountInWei = web3.utils.toWei(ethAmount, 'ether');

            // Approve the token for the pool contract
            //await approveToken(selectedNft.eventAddress, amountInWei, user);

            // Create the liquidity pool
            await poolContract.methods
                .createLiquidityPool(selectedToken, selectedNft.eventAddress)
                .send({ from: user });

            alert('Liquidity Pool created successfully!');
            loadActivePools(); // Reload pools
        } catch (error) {
            console.error('Error creating liquidity pool:', error);
            alert('Transaction failed! Check console for details.');
        }
    };

    const loadActivePools = async () => {
        try {
            const contract = new web3.eth.Contract(PoolContractABI.abi, POOL_CONTRACT_ADDRESS);
            const activePoolIds = await contract.methods.getAllActivePools().call();

            const activePoolsDetails = await Promise.all(
                activePoolIds.map(async (poolId) => {
                    const poolDetails = await fetchPoolDetails(poolId);
                    const details = await getPoolStats(poolId);
                    if (poolDetails) {
                        const proposals = await loadProposalsForPool(poolId, poolDetails.totalProposals);
                        return { poolId, ...poolDetails, proposals };
                    }
                    return null;
                })
            );

            setPools(activePoolsDetails.filter(pool => pool !== null)); // Filter out any null responses
        } catch (error) {
            console.error('Error loading active pools:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPoolStats = async (poolId) => {
        try {
            const contract = new web3.eth.Contract(PoolContractABI.abi, POOL_CONTRACT_ADDRESS);
            const details = await contract.methods.getPoolDetails(poolId).call();
            return {
                poolId: poolId,  // explicitly store poolId here
                token: details.token,
                nft: details.nft,
                totalLiquidity: details.totalLiquidity,
                totalProposals: details.totalProposals,
                isActive: details.isActive,
            };
        } catch (error) {
            console.error('Error fetching pool details:', error);
            return {};
        }
    };

    const approveToken = async (poolId, tokenAddress) => {
        try {
            const accounts = await web3.eth.getAccounts();
            const user = accounts[0];
            const amountInWei = web3.utils.toWei(ethAmounts[poolId] || '0', 'ether');
            const tokenContract = new web3.eth.Contract(EventTicketSystemABI.abi, tokenAddress);

            await tokenContract.methods.approve(POOL_CONTRACT_ADDRESS, amountInWei).send({ from: user });

            alert('Approval successful!');
            setApprovedPools((prev) => [...prev, poolId]);
        } catch (error) {
            console.error('Approval failed:', error);
            alert('Approval failed! Please try again.');
        }
    };

    const addLiquidity = async (poolId) => {
        try {
            const accounts = await web3.eth.getAccounts();
            const user = accounts[0];
            const amountInWei = web3.utils.toWei(ethAmounts[poolId] || '0', 'ether');

            const contract = new web3.eth.Contract(PoolContractABI.abi, POOL_CONTRACT_ADDRESS);
            await contract.methods.addLiquidity(poolId, amountInWei).send({ from: user });

            alert('Liquidity added successfully!');
            loadActivePools(); // Reload pools
        } catch (error) {
            console.error('Error adding liquidity:', error);
            alert('Failed to add liquidity!');
        }
    };

    const handleCreateProposal = async (poolId) => {
        const pool = pools.find(p => p.poolId === poolId);
        const { description, votingDuration } = pool || {};
      
        // Validate inputs before sending the proposal
        if (!description || description.trim() === '') {
          alert('Please enter a valid description');
          return;
        }
      
        if (!votingDuration || votingDuration <= 0) {
          alert('Please enter a valid voting duration in seconds');
          return;
        }
      
        try {
          const accounts = await web3.eth.getAccounts();
          const user = accounts[0];
      
          const contract = new web3.eth.Contract(PoolContractABI.abi, POOL_CONTRACT_ADDRESS);
          
          // Call the createProposal function with the necessary parameters
          await contract.methods
            .createProposal(poolId, description, votingDuration)
            .send({ from: user });
      
          alert('Proposal created successfully!');
          loadActivePools(); // Reload pools after creating the proposal
        } catch (error) {
          console.error('Error creating proposal:', error);
          alert('Failed to create proposal. Check the console for details.');
        }
    };
      

    const handleDescriptionChange = (poolId, description) => {
        //console.log('Updating description for pool:', poolId, 'with:', description); // Debugging line
        setPools(prevPools =>
          prevPools.map(pool =>
            pool.poolId === poolId ? { ...pool, description } : pool
          )
        );
    };
      
    const handleVotingDurationChange = (poolId, dateTimeValue) => {
        // Calculate the duration in seconds from the current time to the selected datetime
        const selectedDate = new Date(dateTimeValue);
        const currentDate = new Date();
        const durationInSeconds = Math.floor((selectedDate - currentDate) / 1000);
        
        setPools(prevPools =>
          prevPools.map(pool =>
            pool.poolId === poolId ? { ...pool, votingDuration: durationInSeconds } : pool
          )
        );
    };

    const fetchPoolDetails = async (poolId) => {
        try {
            const contract = new web3.eth.Contract(PoolContractABI.abi, POOL_CONTRACT_ADDRESS);
            const poolDetails = await contract.methods.getPoolDetails(poolId).call();
    
            // Fetch the NFT symbol using the EventTicketSystem ABI
            const nftContract = new web3.eth.Contract(EventTicketSystemABI.abi, poolDetails.nft);
            const nftSymbol = await nftContract.methods.symbol().call(); // Call symbol function
    
            return {
                ...poolDetails,
                nftSymbol,  // Add the retrieved symbol here
            };
        } catch (error) {
            console.error('Error fetching pool details:', error);
            return null;
        }
    };
    

    // Fetch proposal details for a specific pool and proposal ID
    const fetchProposalDetails = async (poolId, proposalId) => {
        try {
            const contract = new web3.eth.Contract(PoolContractABI.abi, POOL_CONTRACT_ADDRESS);
            const proposalDetails = await contract.methods.getProposalDetails(poolId, proposalId).call();
            return proposalDetails;
        } catch (error) {
            console.error(`Error fetching proposal details for Pool ID ${poolId}, Proposal ID ${proposalId}:`, error);
            return null;
        }
    };

    // Function to load proposals for each pool
    const loadProposalsForPool = async (poolId, totalProposals) => {
        const proposals = [];
        for (let i = 0; i < totalProposals; i++) {
            const proposal = await fetchProposalDetails(poolId, i);
            if (proposal) proposals.push({ proposalId: i, ...proposal });
        }
        return proposals;
    };

    // Handle vote selection change
    const handleVoteSelectionChange = (proposalId, selection) => {
        setVoteSelections((prev) => ({ ...prev, [proposalId]: selection === 'true' }));
    };

    // Voting function
    const handleVote = async (poolId, proposalId) => {
        try {
            const accounts = await web3.eth.getAccounts();
            const user = accounts[0];
            const support = voteSelections[proposalId];
            const contract = new web3.eth.Contract(PoolContractABI.abi, POOL_CONTRACT_ADDRESS);
            await contract.methods.vote(poolId, proposalId, support).send({ from: user });
            alert('Vote submitted successfully!');
        } catch (error) {
            console.error('Error voting on proposal:', error);
            alert('Error voting on proposal.');
        }
    };

    // Execute Proposal function
    const handleExecuteProposal = async (poolId, proposalId) => {
        try {
            const accounts = await web3.eth.getAccounts();
            const user = accounts[0];
            const contract = new web3.eth.Contract(PoolContractABI.abi, POOL_CONTRACT_ADDRESS);
            await contract.methods.executeProposal(poolId, proposalId).send({ from: user });
            alert('Proposal executed successfully!');
        } catch (error) {
            console.error('Error executing proposal:', error);
            alert('Error executing proposal.');
        }
    };


    const handleAmountChange = (poolId, value) => {
        setEthAmounts((prev) => ({ ...prev, [poolId]: value }));
    };

    const tokenSymbols = {
        "0x443Bc4A1B34A01e1B7e45B6d9D4026f0B6B6764F": "ETH (ETH)",
        "0x9A0c4B4997485F51FF1013F7080464780BA8b67D": "ETH",
        "0xE4aB69C077896252FAFBD49EFD26B5D171A32410": "LINK",
        "0x4200000000000000000000000000000000000006": "WETH",
        "0xaf8AA02E8B99B0b99cab13ed0dc105Bc8C2F57CA": "dUSD",
        "0x009d17f23E38524258F6184834616b53F1b864ae": "DACKIE"
    };    


    return (
        <div className="container">
            <Navbar />
            <h1>Liquidity Pools</h1>

            <h2>Create Liquidity Pool</h2>
            <div>
                <label>Select NFT:</label>
                <select onChange={(e) => setSelectedNft(nfts[e.target.value])}>
                    <option value="">Select NFT</option>
                    {nfts.map((nft, index) => (
                        <option key={index} value={index}>
                            {nft.eventName} (Token ID: {nft.tokenId})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Select Token Contract:</label>
                <select onChange={(e) => setSelectedToken(e.target.value)}>
                    <option value="">Select Token</option>
                    <option value="0xE4aB69C077896252FAFBD49EFD26B5D171A32410">LINK</option>
                    <option value="0x4200000000000000000000000000000000000006">WETH</option>
                    <option value="0xaf8AA02E8B99B0b99cab13ed0dc105Bc8C2F57CA">dUSD</option>
                    <option value="0x009d17f23E38524258F6184834616b53F1b864ae">DACKIE</option>
                </select>
            </div>

            <button onClick={handleCreateLiquidityPool}>Create Liquidity Pool</button>

            <h2></h2>
            {loading ? (
                <p>Loading pools...</p>
            ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Pool ID</th>
                                <th>Token</th>
                                <th>NFT</th>
                                <th>Total Liquidity</th>
                                <th>Add Liquidity</th>
                                <th>Proposal Descriptions</th> {/* New column */}
                                <th>Proposal Voting Duration</th> {/* New column */}
                                <th>Create Proposal</th> {/* New column for creating proposal */}
                            </tr>
                        </thead>
                        <tbody>
                            {pools && pools.map((pool) => (
                                <React.Fragment key={pool.poolId.toString()}>
                                    <tr key={pool.poolId.toString()}>
                                        <td>{pool.poolId.toString()}</td>
                                        <td>{tokenSymbols[pool.token] || pool.token}</td>
                                        <td>{pool.nftSymbol || pool.nft}</td>
                                        <td>{web3.utils.fromWei(pool.totalLiquidity, 'ether')}</td>
                                        <td>
                                            <input
                                                type="text"
                                                placeholder="Enter amount"
                                                value={ethAmounts[pool.poolId] || ''}
                                                onChange={(e) => handleAmountChange(pool.poolId, e.target.value)}
                                            />
                                            <button onClick={() => approveToken(pool.poolId, pool.token)}>Approve</button>
                                            <button
                                                onClick={() => addLiquidity(pool.poolId)}
                                                disabled={!approvedPools.includes(pool.poolId)}
                                            >
                                                Add Liquidity
                                            </button>
                                        </td>
                                        {/* Description input */}
                                        <td>
                                            <input
                                                type="text"
                                                placeholder="Enter description"
                                                value={pool.description || ''}
                                                onChange={(e) => handleDescriptionChange(pool.poolId, e.target.value)}
                                                style={{ width: '200px', height: '100px', padding: '10px' }} // Add these styles
                                            />
                                        </td>
                                        {/* Voting Duration input */}
                                        <td>
                                            <input
                                                type="datetime-local"
                                                onChange={(e) => handleVotingDurationChange(pool.poolId, e.target.value)}
                                            />
                                        </td>
                                        {/* Create Proposal button */}
                                        <td>
                                            <button
                                                onClick={() => handleCreateProposal(pool.poolId)}
                                                disabled={!pool.description || !pool.votingDuration}
                                            >
                                                Create Proposal
                                            </button>
                                        </td>

                                        {/* Proposal Details Section */}
                                        <td>
                                        <td colSpan="5">
                                            <h4>Proposals</h4>
                                            {pool.proposals.length > 0 ? (
                                                <table className="table proposal-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Proposal ID</th>
                                                            <th>Description</th>
                                                            <th>End Time</th>
                                                            <th>Votes For</th>
                                                            <th>Votes Against</th>
                                                            <th>Executed</th>
                                                            <th>Vote</th>  {/* New column for voting */}
                                                            <th>Execute</th> {/* New column for execution */}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pool.proposals.map((proposal) => (
                                                            <tr key={proposal.proposalId.toString()}>
                                                                <td>{proposal.proposalId.toString()}</td>
                                                                <td>{proposal.description}</td>
                                                                <td>{new Date(Number(proposal.endTime) * 1000).toLocaleString()}</td>
                                                                <td>{proposal.votesFor.toString()}</td>
                                                                <td>{proposal.votesAgainst.toString()}</td>
                                                                <td>{proposal.executed ? 'Yes' : 'No'}</td>
                                                                {/* Vote Functionality */}
                                                                <td>
                                                                    <select
                                                                        value={voteSelections[proposal.proposalId] || ''}
                                                                        onChange={(e) => handleVoteSelectionChange(proposal.proposalId, e.target.value)}
                                                                    >
                                                                        <option value="">Select</option>
                                                                        <option value="true">Vote For</option>
                                                                        <option value="false">Vote Against</option>
                                                                    </select>
                                                                    <button
                                                                        onClick={() => handleVote(pool.poolId, proposal.proposalId)}
                                                                        disabled={voteSelections[proposal.proposalId] === undefined}
                                                                    >
                                                                        Vote
                                                                    </button>
                                                                </td>

                                                                {/* Execute Proposal */}
                                                                <td>
                                                                    <button
                                                                        onClick={() => handleExecuteProposal(pool.poolId, proposal.proposalId)}
                                                                        disabled={proposal.executed}
                                                                    >
                                                                        Execute
                                                                    </button>
                                                                </td>
                               
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p>No proposals available for this pool.</p>
                                            )}
                                        </td>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PoolBasePage;
