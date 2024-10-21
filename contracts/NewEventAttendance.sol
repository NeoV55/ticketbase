// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NewEventAttendance {
    struct EventDetails {
        uint256 startDate;
        uint256 endDate;
        address eventContractAddress;
    }

    mapping(uint256 => EventDetails) public events; // Mapping from event ID to event details
    mapping(address => mapping(uint256 => bool)) public attendance; // Mapping from attendee address to event ID
    uint256[] public eventIds; // Array to store event IDs for easy access

    event AttendanceVerified(address indexed attendee, uint256 indexed eventId);

    // Function to set event details (to be called from the factory or by the owner)
    function setEventDetails(
        uint256 eventId,
        address eventContract,
        uint256 startDate,
        uint256 endDate
    ) external {
        events[eventId] = EventDetails({
            startDate: startDate,
            endDate: endDate,
            eventContractAddress: eventContract
        });
        eventIds.push(eventId); // Store the event ID for listing
    }

    // Function to verify attendance
    function verifyAttendance(uint256 eventId) external {
        EventDetails storage eventDetails = events[eventId];

        // Ensure the event exists
        require(
            eventDetails.eventContractAddress != address(0),
            "Event does not exist."
        );

        // Check if the current timestamp is within the event dates
        require(
            block.timestamp >= eventDetails.startDate &&
                block.timestamp <= eventDetails.endDate,
            "Attendance can only be verified during the event period."
        );

        // Check if the user owns a ticket for the event
        require(
            IERC721(eventDetails.eventContractAddress).balanceOf(msg.sender) >
                0,
            "You do not own a ticket for this event."
        );

        // Check if the attendance has already been verified
        require(!attendance[msg.sender][eventId], "Already verified.");

        // Mark attendance as verified
        attendance[msg.sender][eventId] = true;

        emit AttendanceVerified(msg.sender, eventId);
    }

    // Function to check if an attendee has verified their attendance
    function hasAttended(
        address attendee,
        uint256 eventId
    ) external view returns (bool) {
        return attendance[attendee][eventId];
    }

    // Function to get all event IDs and their contract addresses
    function getAllEvents()
        external
        view
        returns (uint256[] memory ids, address[] memory contracts)
    {
        uint256 length = eventIds.length;
        address[] memory eventContracts = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            eventContracts[i] = events[eventIds[i]].eventContractAddress;
        }

        return (eventIds, eventContracts);
    }
}
