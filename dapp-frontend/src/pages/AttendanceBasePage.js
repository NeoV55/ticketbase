import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AttendanceContractABI from '../contracts/NewEventAttendance.json';
import EventTicketSystemABI from '../contracts/EventTicketSystem.json';
import Web3 from 'web3';

const ATTENDANCE_CONTRACT_ADDRESS = '0xc7380b030af507151006a10c6537283442082f2B'; // Your Attendance contract address

const AttendanceBasePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [account, setAccount] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const attendanceContract = new web3.eth.Contract(AttendanceContractABI.abi, ATTENDANCE_CONTRACT_ADDRESS);

      try {
        const allEvents = await attendanceContract.methods.getAllEvents().call();
        console.log('All Events:', allEvents);

        // Fetch event names and attendance status
        const eventsWithDetails = await Promise.all(allEvents.ids.map(async (eventId, index) => {
          const eventSystemContract = new web3.eth.Contract(EventTicketSystemABI.abi, allEvents.contracts[index]);
          const eventName = await eventSystemContract.methods.name().call();

          // Call attendance status function
          const attendanceStatus = await attendanceContract.methods.attendance(account, eventId).call();

          return {
            id: eventId.toString(),
            contractAddress: allEvents.contracts[index],
            name: eventName,
            status: attendanceStatus ? 'Verified' : 'None'
          };
        }));

        setEvents(eventsWithDetails);
      } catch (error) {
        console.error('Error fetching events:', error);
      }

      setLoading(false);
    };

    loadEvents();
  }, [account]);

  const handleVerifyAttendance = async (eventId) => {
    if (!eventId) {
      alert('Please select an event.');
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const attendanceContract = new web3.eth.Contract(AttendanceContractABI.abi, ATTENDANCE_CONTRACT_ADDRESS);

      await attendanceContract.methods.verifyAttendance(eventId).send({ from: account });
      alert('Attendance verified successfully!');
    } catch (error) {
      console.error('Error verifying attendance:', error);
      alert('Verification failed! Please check the console for details.');
    }
  };

  return (
    <div className="container">
      <Navbar />
      <h1>Attendance Verification</h1>
      {loading ? (
        <p>Loading events...</p>
      ) : (
        <>
          <h2>Available Events</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Event ID</th>
                <th>Contract Address</th>
                <th>Status</th>
                <th>Verify</th>
              </tr>
            </thead>
            <tbody>
              {events.slice().reverse().map((event, index) => (
                <tr key={index}>
                  <td>{event.name}</td>
                  <td>{event.id}</td>
                  <td>{event.contractAddress}</td>
                  <td>{event.status}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleVerifyAttendance(event.id)}>
                      Verify Attendance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AttendanceBasePage;
