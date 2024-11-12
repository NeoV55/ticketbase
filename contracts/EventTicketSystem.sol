// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicketSystem is ERC721, Ownable {
    string public location;
    string public eventImage;
    uint256 public totalTickets;
    uint256 public ticketsMinted;
    uint256 public startDate;
    uint256 public endDate;
    bool public isFinalized;

    event TicketMinted(address indexed buyer, uint256 ticketId);
    event EventFinalized();

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _location,
        string memory _eventImage,
        uint256 _totalTickets,
        uint256 _startDate,
        uint256 _endDate,
        address _owner
    ) ERC721(_name, _symbol) Ownable() {
        transferOwnership(_owner);
        location = _location;
        eventImage = _eventImage;
        totalTickets = _totalTickets;
        startDate = _startDate;
        endDate = _endDate;
    }

    modifier eventActive() {
        require(
            block.timestamp >= startDate && block.timestamp <= endDate,
            "Event is not active."
        );
        require(!isFinalized, "Event is finalized.");
        _;
    }

    function mintTicket() external onlyOwner eventActive {
        require(ticketsMinted < totalTickets, "All tickets sold.");
        uint256 ticketId = ticketsMinted + 1;
        ticketsMinted++;

        _safeMint(msg.sender, ticketId);
        emit TicketMinted(msg.sender, ticketId);
    }

    function finalizeEvent() external onlyOwner {
        isFinalized = true;
        emit EventFinalized();
    }

    function transferTicket(address to, uint256 ticketId) external {
        require(ownerOf(ticketId) == msg.sender, "You do not own this ticket.");
        _transfer(msg.sender, to, ticketId);
    }
}
