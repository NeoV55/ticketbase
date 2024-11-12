import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import EventFactoryABI from '../contracts/EventFactory.json';
import EventTicketSystemABI from '../contracts/EventTicketSystem.json';
import Web3 from 'web3';

const WalletPage = () => {
  const [userAddress, setUserAddress] = useState('');
  const [createdEvents, setCreatedEvents] = useState([]);
  const [ticketsOwned, setTicketsOwned] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transferAddress, setTransferAddress] = useState('');
  const [selectedEventAddress, setSelectedEventAddress] = useState('');
  const operatorAddress = '0x4b0864e55616b4aa2bFeFAedDA73c01565651033'; // Hardcoded operator address marketplace
  //const operatorAddress1 = '0x7f1a84008171D8f3209BB889743656DfC8373575'; // Hardcoded operator address LP factory
  const eventFactoryAddress = '0x1920De7F459cb722Ba31D7eeD05B1a4f05D23e7e';

  useEffect(() => {
    const loadWalletData = async () => {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const web3 = new Web3(window.ethereum);
      try {
        const accounts = await web3.eth.requestAccounts();
        const user = accounts[0];
        setUserAddress(user);

        const eventFactory = new web3.eth.Contract(EventFactoryABI.abi, eventFactoryAddress);
        const events = await eventFactory.methods.getDeployedEvents().call();
        const ownedTicketsData = await fetchOwnedTickets(web3, events, user);
        setTicketsOwned(ownedTicketsData);

        const ownedEvents = ownedTicketsData.reduce((acc, ticket) => {
          if (!acc.some(event => event.address === ticket.eventAddress)) {
            acc.push({ address: ticket.eventAddress, name: ticket.eventName });
          }
          return acc;
        }, []);

        setCreatedEvents(ownedEvents);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        alert('Failed to load wallet data.');
      }

      setIsLoading(false);
    };

    loadWalletData();
  }, []);

  const fetchOwnedTickets = async (web3, events, user) => {
    const tickets = [];

    for (const eventAddress of events) {
      const contract = new web3.eth.Contract(EventTicketSystemABI.abi, eventAddress);
      try {
        const totalMinted = await contract.methods.ticketsMinted().call();
        const eventName = await contract.methods.name().call();

        for (let ticketId = 1; ticketId <= totalMinted; ticketId++) {
          const owner = await contract.methods.ownerOf(ticketId).call();
          if (owner.toLowerCase() === user.toLowerCase()) {
            tickets.push({ eventAddress, ticketId, eventName });
          }
        }
      } catch (error) {
        console.error(`Error fetching tickets for event ${eventAddress}:`, error);
      }
    }

    return tickets;
  };

  const setApprovalForAll = async (eventContract) => {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(EventTicketSystemABI.abi, eventContract);

    try {
      const gas = await contract.methods.setApprovalForAll(operatorAddress, true).estimateGas({ from: accounts[0] });
      await contract.methods.setApprovalForAll(operatorAddress, true).send({
        from: accounts[0],
        gas,
      });

      //await contract.methods.setApprovalForAll(operatorAddress1, true).send({
        //from: accounts[0],
        //gas,
      //});

      alert('Approval Set for MarketBase Listings!');
    } catch (error) {
      console.error('Error setting approval:', error);
      alert('Failed to set approval.');
    }
  };

  const transferTicket = async (ticketId, eventAddress) => {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(EventTicketSystemABI.abi, eventAddress);

    try {
      await contract.methods.transferFrom(userAddress, transferAddress, ticketId).send({ from: userAddress });
      alert(`Ticket ${ticketId} transferred successfully!`);
    } catch (error) {
      console.error('Error transferring ticket:', error);
      alert('Ticket transfer failed.');
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Ticket Portfolio</h1>
      {isLoading ? (
        <p>Loading your assets...</p>
      ) : (
        <>
          <h2>Connected Wallet: {userAddress}</h2>

          {/* Approval for Specific Ticket Dropdown */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', justifyContent: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h3>Approval Settings</h3>
              <select 
                value={selectedEventAddress} 
                onChange={(e) => setSelectedEventAddress(e.target.value)}
                style={{ padding: '10px', marginBottom: '10px' }}
              >
                <option value="">Select an event to approve</option>
                {createdEvents.map(event => (
                  <option key={event.address} value={event.address}>
                    {event.name}
                  </option>
                ))}
              </select>
              <button 
                onClick={() => setApprovalForAll(selectedEventAddress)} 
                style={{ padding: '10px 20px', cursor: 'pointer' }}
                disabled={!selectedEventAddress} // Disable button if no event is selected
              >
                Approve Tickets for Marketplace Listings
              </button>
            </div>
          </div>

          {/* Transfer Address Input */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h3>Transfer Ticket</h3>
            <input
              type="text"
              placeholder="Enter recipient address"
              value={transferAddress}
              onChange={(e) => setTransferAddress(e.target.value)}
              style={{ marginBottom: '10px', padding: '5px', width: '50%' }}
            />
          </div>

          {/* Created Events Table */}
          <h3>Events</h3>
          {createdEvents.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Event Name</th>
                </tr>
              </thead>
              <tbody>
                {createdEvents.map((event, index) => (
                  <tr key={index}>
                    <td>{event.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No events found where you own tickets.</p>
          )}

          {/* Owned Tickets Table with Transfer Button */}
          <h3>My Tickets</h3>
          {ticketsOwned.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Ticket ID</th>
                  <th>Transfer</th>
                </tr>
              </thead>
              <tbody>
                {ticketsOwned.map((ticket, index) => (
                  <tr key={index}>
                    <td>{ticket.eventName}</td>
                    <td>{ticket.ticketId}</td>
                    <td>
                      <button
                        onClick={() => transferTicket(ticket.ticketId, ticket.eventAddress)}
                        style={{ padding: '5px 10px', cursor: 'pointer' }}
                        disabled={!transferAddress} // Disable if no address is entered
                      >
                        Transfer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No tickets owned by this wallet.</p>
          )}
        </>
      )}
    </div>
  );
};

export default WalletPage;
