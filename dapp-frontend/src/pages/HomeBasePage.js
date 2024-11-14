import React, { useEffect, useState } from 'react';
import EventFactoryABI from '../contracts/EventFactory.json';
import EventTicketSystemABI from '../contracts/EventTicketSystem.json';
import Web3 from 'web3';

const HomeBasePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const eventFactoryAddress = '0x1920De7F459cb722Ba31D7eeD05B1a4f05D23e7e'; // Replace with your address

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        const factoryContract = new web3.eth.Contract(EventFactoryABI.abi, eventFactoryAddress);

        // Get the deployed event addresses from the factory
        const deployedEventAddresses = await factoryContract.methods.getDeployedEvents().call();

        for (const eventAddress of deployedEventAddresses) {
          const eventContract = new web3.eth.Contract(EventTicketSystemABI.abi, eventAddress);

          // Fetch event details
          const name = await eventContract.methods.name().call();
          const location = await eventContract.methods.location().call();
          const symbol = await eventContract.methods.symbol().call();
          const totalTickets = await eventContract.methods.totalTickets().call();
          const ticketsMinted = await eventContract.methods.ticketsMinted().call();

          const startDateBigInt = await eventContract.methods.startDate().call();
          const endDateBigInt = await eventContract.methods.endDate().call();

          const formattedStartDate = new Date(Number(startDateBigInt) * 1000).toLocaleString();
          const formattedEndDate = new Date(Number(endDateBigInt) * 1000).toLocaleString();

          const newEvent = {
            name,
            location,
            symbol,
            totalTickets: totalTickets.toString(),
            ticketsMinted: ticketsMinted.toString(),
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          };

          // Add each event as soon as it is loaded
          setEvents((prevEvents) => [newEvent, ...prevEvents]);
        }
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Failed to load events. Please check the console for more details.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <div className="container">
      <h1>All Events</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Symbol</th>
              <th>Tickets Available</th>
              <th>Tickets Minted</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && loading && <tr><td colSpan="7">Loading events...</td></tr>}
            {events.map((event, index) => (
              <tr key={index}>
                <td>{event.name}</td>
                <td>{event.location}</td>
                <td>{event.symbol}</td>
                <td>{event.totalTickets}</td>
                <td>{event.ticketsMinted}</td>
                <td>{event.startDate}</td>
                <td>{event.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HomeBasePage;
