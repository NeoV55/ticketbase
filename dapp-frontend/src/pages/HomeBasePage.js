import React, { useEffect, useState } from 'react';
import EventFactoryABI from '../contracts/EventFactory.json';
import EventTicketSystemABI from '../contracts/EventTicketSystem.json'; // Import the ABI for EventTicketSystem
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
        const eventDetailsPromises = deployedEventAddresses.map(async (eventAddress) => {
          const eventContract = new web3.eth.Contract(EventTicketSystemABI.abi, eventAddress);
          // Assuming these methods exist in the EventTicketSystem contract to get event details
          const name = await eventContract.methods.name().call();
          const location = await eventContract.methods.location().call();
          const totalTickets = await eventContract.methods.totalTickets().call();
          //const startDate = await eventContract.methods.startDate().call();
          //const endDate = await eventContract.methods.endDate().call();

          // Convert to human-readable format
          //const formattedStartDate = new Date(startDate * 1000).toLocaleString();
          //const formattedEndDate = new Date(endDate * 1000).toLocaleString();

          // Fetching and converting BigInt to Number for dates
          const startDateBigInt = await eventContract.methods.startDate().call();
          const endDateBigInt = await eventContract.methods.endDate().call();

          // Convert BigInt to Number and format to human-readable date
          const formattedStartDate = new Date(Number(startDateBigInt) * 1000).toLocaleString();
          const formattedEndDate = new Date(Number(endDateBigInt) * 1000).toLocaleString();

          return { name, location, totalTickets: totalTickets.toString(), startDate: formattedStartDate, endDate: formattedEndDate };
        });

        // Fetch all event details
        const eventsData = await Promise.all(eventDetailsPromises);
        setEvents(eventsData);
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
      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Tickets Available</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={index}>
                <td>{event.name}</td>
                <td>{event.location}</td>
                <td>{event.totalTickets}</td>
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
