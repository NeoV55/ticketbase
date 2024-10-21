// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol"; // For NFT ownership check
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // For ERC20 token support

contract LiquidityPoolFactory is Ownable {
    using Counters for Counters.Counter;

    struct LiquidityPool {
        address token; // ERC20 token used for liquidity
        address nft; // NFT contract required to interact
        uint256 totalLiquidity; // Total liquidity in the pool
        mapping(address => uint256) userBalances; // User liquidity balances
        Proposal[] proposals; // List of proposals for fund withdrawals
        bool active; // Pool status
    }

    struct Proposal {
        uint256 id;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => LiquidityPool) public pools;
    Counters.Counter private totalPools;

    event PoolCreated(uint256 poolId, address token, address nft);
    event ProposalCreated(
        uint256 poolId,
        uint256 proposalId,
        string description
    );
    event Voted(
        uint256 poolId,
        uint256 proposalId,
        bool support,
        address voter
    );
    event ProposalExecuted(uint256 poolId, uint256 proposalId, bool passed);
    event LiquidityAdded(uint256 poolId, address user, uint256 amount);

    constructor(address initialOwner) {
        transferOwnership(initialOwner);
    }

    // Create a liquidity pool - Only valid NFT holders can create pools
    function createLiquidityPool(
        address _token,
        address _nft
    ) external returns (uint256 poolId) {
        require(
            IERC721(_nft).balanceOf(msg.sender) > 0,
            "You must own an NFT to create a pool"
        );

        poolId = totalPools.current();
        totalPools.increment();

        LiquidityPool storage newPool = pools[poolId];
        newPool.token = _token;
        newPool.nft = _nft;
        newPool.active = true;

        emit PoolCreated(poolId, _token, _nft);
    }

    // Add liquidity to the pool with ERC20 tokens
    function addLiquidity(uint256 poolId, uint256 amount) external {
        require(poolId < totalPools.current(), "Pool does not exist");
        LiquidityPool storage pool = pools[poolId];

        // Ensure the user has approved the contract to transfer tokens
        require(
            IERC20(pool.token).allowance(msg.sender, address(this)) >= amount,
            "Insufficient token allowance"
        );

        // Transfer the tokens to the contract
        bool success = IERC20(pool.token).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        require(success, "Token transfer failed");

        // Update user balance and total liquidity
        pool.userBalances[msg.sender] += amount;
        pool.totalLiquidity += amount;

        emit LiquidityAdded(poolId, msg.sender, amount);
    }

    // Create a proposal - Only NFT holders can create proposals
    function createProposal(
        uint256 poolId,
        string calldata description,
        uint256 votingDuration
    ) external {
        require(poolId < totalPools.current(), "Pool does not exist");

        LiquidityPool storage pool = pools[poolId];
        require(
            IERC721(pool.nft).balanceOf(msg.sender) > 0,
            "You must own an NFT to create a proposal"
        );

        uint256 proposalId = pool.proposals.length;

        Proposal storage newProposal = pool.proposals.push();
        newProposal.id = proposalId;
        newProposal.description = description;
        newProposal.endTime = block.timestamp + votingDuration;

        emit ProposalCreated(poolId, proposalId, description);
    }

    // Vote on a proposal
    function vote(uint256 poolId, uint256 proposalId, bool support) external {
        require(poolId < totalPools.current(), "Pool does not exist");
        LiquidityPool storage pool = pools[poolId];
        require(proposalId < pool.proposals.length, "Proposal does not exist");

        Proposal storage proposal = pool.proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(block.timestamp < proposal.endTime, "Voting period ended");

        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
        proposal.hasVoted[msg.sender] = true;

        emit Voted(poolId, proposalId, support, msg.sender);
    }

    // Execute a proposal if it has passed - Funds sent to NFT contract owner
    function executeProposal(uint256 poolId, uint256 proposalId) external {
        require(poolId < totalPools.current(), "Pool does not exist");
        LiquidityPool storage pool = pools[poolId];
        require(proposalId < pool.proposals.length, "Proposal does not exist");

        Proposal storage proposal = pool.proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(block.timestamp >= proposal.endTime, "Voting still ongoing");

        bool passed = proposal.votesFor > proposal.votesAgainst;
        proposal.executed = true;

        if (passed) {
            // Transfer the funds to the NFT contract owner instead of the NFT contract
            address nftOwner = Ownable(pool.nft).owner();
            uint256 amountToTransfer = pool.totalLiquidity;
            require(amountToTransfer > 0, "No funds to transfer");

            // Transfer the liquidity to the NFT contract's owner
            bool success = IERC20(pool.token).transfer(
                nftOwner,
                amountToTransfer
            );
            require(success, "Transfer to NFT contract owner failed");

            // Reset total liquidity after transfer
            pool.totalLiquidity = 0;
        }

        emit ProposalExecuted(poolId, proposalId, passed);
    }

    // Get details of a pool by poolId
    function getPoolDetails(
        uint256 poolId
    )
        public
        view
        returns (
            address token,
            address nft,
            uint256 totalLiquidity,
            uint256 totalProposals,
            bool isActive
        )
    {
        require(poolId < totalPools.current(), "Pool does not exist");
        LiquidityPool storage pool = pools[poolId];

        return (
            pool.token,
            pool.nft,
            pool.totalLiquidity,
            pool.proposals.length,
            pool.active
        );
    }

    // Get details of a proposal by poolId and proposalId
    function getProposalDetails(
        uint256 poolId,
        uint256 proposalId
    )
        public
        view
        returns (
            string memory description,
            uint256 endTime,
            uint256 votesFor,
            uint256 votesAgainst,
            bool executed
        )
    {
        require(poolId < totalPools.current(), "Pool does not exist");
        LiquidityPool storage pool = pools[poolId];
        require(proposalId < pool.proposals.length, "Proposal does not exist");

        Proposal storage proposal = pool.proposals[proposalId];

        return (
            proposal.description,
            proposal.endTime,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.executed
        );
    }

    // New function: Get all active pools for dashboard
    function getAllActivePools() public view returns (uint256[] memory) {
        uint256 totalActivePools = 0;
        for (uint256 i = 0; i < totalPools.current(); i++) {
            if (pools[i].active) {
                totalActivePools++;
            }
        }

        uint256[] memory activePools = new uint256[](totalActivePools);
        uint256 index = 0;
        for (uint256 i = 0; i < totalPools.current(); i++) {
            if (pools[i].active) {
                activePools[index] = i;
                index++;
            }
        }

        return activePools;
    }
}
