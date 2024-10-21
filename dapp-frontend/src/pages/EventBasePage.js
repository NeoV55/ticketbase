import React, { useState, useEffect } from 'react';
import EventFactoryABI from '../contracts/EventFactory.json';
import EventTicketSystemABI from '../contracts/EventTicketSystem.json';
import Web3 from 'web3';

const EventBasePage = () => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [location, setLocation] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [totalTickets, setTotalTickets] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userEvents, setUserEvents] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [ticketId, setTicketId] = useState('');

  const eventFactoryAddress = '0x1920De7F459cb722Ba31D7eeD05B1a4f05D23e7e';
  const marketplaceAddress = '0x430Ca916d02128A393aE0cE88a6e8450035AE838'; // Replace with actual address

  useEffect(() => {
    const loadUserEvents = async () => {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const contract = new web3.eth.Contract(EventFactoryABI.abi, eventFactoryAddress);
      const events = await contract.methods.getDeployedEvents(accounts[0]).call();

      const eventNames = await Promise.all(
        events.map(async (eventAddress) => {
          const eventContract = new web3.eth.Contract(EventTicketSystemABI.abi, eventAddress);
          const eventName = await eventContract.methods.name().call();
          return { address: eventAddress, name: eventName };
        })
      );

      setUserEvents(eventNames);
    };
    loadUserEvents();
  }, []);

  const createEvent = async () => {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(EventFactoryABI.abi, eventFactoryAddress);

    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = await contract.methods
      .createEvent(name, symbol, location, eventImage, totalTickets, startTimestamp, endTimestamp)
      .estimateGas({ from: accounts[0] });

    await contract.methods
      .createEvent(name, symbol, location, eventImage, totalTickets, startTimestamp, endTimestamp)
      .send({ from: accounts[0], gasPrice, gas: gasLimit });

    alert('Event Created!');
  };

  const mintTicket = async (eventContract) => {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(EventTicketSystemABI.abi, eventContract);

    const gasPrice = await web3.eth.getGasPrice();
    await contract.methods.mintTicket().send({ from: accounts[0], gasPrice });
    alert('Ticket Minted!');
  };

  const transferTicket = async (eventContract) => {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(EventTicketSystemABI.abi, eventContract);

    const gasPrice = await web3.eth.getGasPrice();
    await contract.methods
      .transferTicket(recipient, ticketId)
      .send({ from: accounts[0], gasPrice });

    alert('Ticket Transferred!');
  };

  const setApprovalForAll = async (eventContract) => {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(EventTicketSystemABI.abi, eventContract);

    const gasPrice = await web3.eth.getGasPrice();
    await contract.methods
      .setApprovalForAll(marketplaceAddress, true)
      .send({ from: accounts[0], gasPrice });

    alert('Approval Set!');
  };

  return (
    <div className="container">
      <h1>Create New Event</h1>
      <input placeholder="Event Name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Location" onChange={(e) => setLocation(e.target.value)} />
      <input type="number" placeholder="Total Tickets" onChange={(e) => setTotalTickets(e.target.value)} />
      <input placeholder="Symbol" onChange={(e) => setSymbol(e.target.value)} />
      <input placeholder="Event Image URL" onChange={(e) => setEventImage(e.target.value)} />
      <input type="datetime-local" onChange={(e) => setStartDate(e.target.value)} />
      <input type="datetime-local" onChange={(e) => setEndDate(e.target.value)} />
      <button onClick={createEvent} className="btn btn-success">Create Event</button>

      <h1>Event Manager</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Mint Ticket</th>
            <th>Transfer Ticket</th>
            <th>Set Approval For All</th>
          </tr>
        </thead>
        <tbody>
          {userEvents.map((event, index) => (
            <tr key={index}>
              <td>{event.name}</td>
              <td>
                <button onClick={() => mintTicket(event.address)} className="btn btn-primary">
                  Mint Ticket
                </button>
              </td>
              <td>
                <input placeholder="Recipient Address" onChange={(e) => setRecipient(e.target.value)} />
                <input placeholder="Ticket ID" type="number" onChange={(e) => setTicketId(e.target.value)} />
                <button onClick={() => transferTicket(event.address)} className="btn btn-secondary">
                  Transfer Ticket
                </button>
              </td>
              <td>
                <button onClick={() => setApprovalForAll(event.address)} className="btn btn-warning">
                  Set Approval
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventBasePage;
