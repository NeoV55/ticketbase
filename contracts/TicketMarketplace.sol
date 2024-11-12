// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract TicketMarketplace is Ownable, ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 price;
        bool isActive;
    }

    struct NFTInfo {
        address nftContract;
        uint256 tokenId;
    }

    // Mappings and storage
    mapping(address => mapping(uint256 => Listing)) public listings; // Mapping of NFT contract to tokenId to Listing
    NFTInfo[] public allListings; // Array to store all listings for easy access
    uint256 public platformFee = 250; // Platform fee in basis points (2.5%)
    address public feeReceiver; // Address to receive the fees

    event TicketListed(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 price,
        address seller
    );
    event TicketSold(
        address indexed nftContract,
        uint256 indexed tokenId,
        address buyer,
        address seller,
        uint256 price
    );
    event TicketCancelled(address indexed nftContract, uint256 indexed tokenId);

    constructor(address initialOwner, address _feeReceiver) {
        transferOwnership(initialOwner);
        feeReceiver = _feeReceiver;
    }

    function listTicket(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external {
        require(price > 0, "Price must be greater than 0");

        // Transfer the NFT to the marketplace contract
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        listings[nftContract][tokenId] = Listing(msg.sender, price, true);

        // Add the listing to the array for tracking
        allListings.push(NFTInfo(nftContract, tokenId));

        emit TicketListed(nftContract, tokenId, price, msg.sender);
    }

    function buyTicket(
        address nftContract,
        uint256 tokenId
    ) external payable nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient payment");

        // Calculate platform fee
        uint256 fee = (listing.price * platformFee) / 10000;
        uint256 sellerProceeds = listing.price - fee;

        // Transfer the payment to the seller
        (bool sent, ) = payable(listing.seller).call{value: sellerProceeds}("");
        require(sent, "Failed to send Ether");

        // Transfer the fee to the fee receiver
        (bool feeSent, ) = payable(feeReceiver).call{value: fee}("");
        require(feeSent, "Failed to send fee");

        // Transfer the NFT to the buyer
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        // Mark the listing as inactive
        listing.isActive = false;

        emit TicketSold(
            nftContract,
            tokenId,
            msg.sender,
            listing.seller,
            listing.price
        );
    }

    function cancelListing(address nftContract, uint256 tokenId) external {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.seller == msg.sender, "Only seller can cancel");
        require(listing.isActive, "Listing is not active");

        // Transfer the NFT back to the seller
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        // Mark the listing as inactive
        listing.isActive = false;

        emit TicketCancelled(nftContract, tokenId);
    }

    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 10000, "Fee must be less than or equal to 100%");
        platformFee = newFee;
    }

    /**
     * @dev Retrieves all active listings.
     * Returns an array of NFT contract addresses and token IDs.
     */
    function getAllActiveListings() external view returns (NFTInfo[] memory) {
        // Count active listings first
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allListings.length; i++) {
            if (
                listings[allListings[i].nftContract][allListings[i].tokenId]
                    .isActive
            ) {
                activeCount++;
            }
        }

        // Create array with active listings only
        NFTInfo[] memory activeListings = new NFTInfo[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allListings.length; i++) {
            if (
                listings[allListings[i].nftContract][allListings[i].tokenId]
                    .isActive
            ) {
                activeListings[index] = allListings[i];
                index++;
            }
        }

        return activeListings;
    }
}
