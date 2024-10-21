import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import EventFactoryABI from '../contracts/EventFactory.json';
import EventTicketSystemABI from '../contracts/EventTicketSystem.json';
import Web3 from 'web3';

const WalletPage = () => {
  const [userAddress, setUserAddress] = useState('');
  const [createdEvents, setCreatedEvents] = useState([]); // Events with owned tickets
  const [ticketsOwned, setTicketsOwned] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  const eventFactoryAddress = '0x1920De7F459cb722Ba31D7eeD05B1a4f05D23e7e'; // Your EventFactory address

  useEffect(() => {
    const loadWalletData = async () => {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const user = accounts[0];
      setUserAddress(user);

      const eventFactory = new web3.eth.Contract(EventFactoryABI.abi, eventFactoryAddress);

      try {
        const events = await eventFactory.methods.getDeployedEvents().call(); // Fetch all events
        const ownedTicketsData = await fetchOwnedTickets(web3, events, user);
        setTicketsOwned(ownedTicketsData);

        // Extract events where the user owns at least one ticket
        const ownedEvents = ownedTicketsData.reduce((acc, ticket) => {
          if (!acc.some(event => event.address === ticket.eventAddress)) {
            acc.push({ address: ticket.eventAddress, name: ticket.eventName });
          }
          return acc;
        }, []);

        setCreatedEvents(ownedEvents);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }

      setIsLoading(false);
    };

    loadWalletData();
  }, []);

  const fetchOwnedTickets = async (web3, events, user) => {
    const tickets = [];

    for (const eventAddress of events) {
      const contract = new web3.eth.Contract(EventTicketSystemABI.abi, eventAddress);
      const totalMinted = await contract.methods.ticketsMinted().call();
      const eventName = await contract.methods.name().call();

      for (let ticketId = 1; ticketId <= totalMinted; ticketId++) {
        const owner = await contract.methods.ownerOf(ticketId).call();
        if (owner.toLowerCase() === user.toLowerCase()) {
          tickets.push({ eventAddress, ticketId, eventName });
        }
      }
    }

    return tickets;
  };

  return (
    <div>
      <Navbar />
      <h1>Wallet Portfolio</h1>
      {isLoading ? (
        <p>Loading your assets...</p>
      ) : (
        <>
          <h2>Connected Wallet: {userAddress}</h2>

          <h3>Created Events</h3>
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

          <h3>Owned Tickets</h3>
          {ticketsOwned.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Ticket ID</th>
                </tr>
              </thead>
              <tbody>
                {ticketsOwned.map((ticket, index) => (
                  <tr key={index}>
                    <td>{ticket.eventName}</td>
                    <td>{ticket.ticketId}</td>
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
