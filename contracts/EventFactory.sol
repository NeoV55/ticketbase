// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EventTicketSystem.sol";
import "./NewEventAttendance.sol";

contract EventFactory {
    address[] public deployedEvents;
    NewEventAttendance public attendanceContract;

    event EventCreated(
        address indexed eventAddress,
        string name,
        string symbol
    );

    constructor() {
        // Deploy the NewEventAttendance contract when the factory is created
        attendanceContract = new NewEventAttendance();
    }

    function createEvent(
        string memory _name,
        string memory _symbol,
        string memory _location,
        string memory _eventImage,
        uint256 _totalTickets,
        uint256 _startDate,
        uint256 _endDate
    ) external {
        // Deploy a new event contract and set the deployer as the owner
        EventTicketSystem newEvent = new EventTicketSystem(
            _name,
            _symbol,
            _location,
            _eventImage,
            _totalTickets,
            _startDate,
            _endDate,
            msg.sender // Assign deployer as the owner
        );

        deployedEvents.push(address(newEvent));

        // Set event details in the attendance contract
        attendanceContract.setEventDetails(
            deployedEvents.length - 1,
            address(newEvent),
            _startDate,
            _endDate
        );

        emit EventCreated(address(newEvent), _name, _symbol);
    }

    function getDeployedEvents() external view returns (address[] memory) {
        return deployedEvents;
    }

    // New function to retrieve event details
    function getEventDetails()
        external
        view
        returns (uint256[] memory ids, address[] memory contracts)
    {
        uint256 length = deployedEvents.length;
        ids = new uint256[](length);
        contracts = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            ids[i] = i; // Assuming the ID corresponds to its index in the array
            contracts[i] = deployedEvents[i];
        }

        return (ids, contracts);
    }
}
