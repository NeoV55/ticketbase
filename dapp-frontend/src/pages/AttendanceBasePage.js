import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AttendanceContractABI from '../contracts/NewEventAttendance.json';
import EventTicketSystemABI from '../contracts/EventTicketSystem.json';
import Web3 from 'web3';

const ATTENDANCE_CONTRACT_ADDRESS = '0xc7380b030af507151006a10c6537283442082f2B';

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

      const attendanceContract = new web3.eth.Contract(
        AttendanceContractABI.abi,
        ATTENDANCE_CONTRACT_ADDRESS
      );

      try {
        const allEvents = await attendanceContract.methods.getAllEvents().call();
        console.log('All Events:', allEvents);

        // Fetch each event's name and attendance status one by one
        for (let i = 0; i < allEvents.ids.length; i++) {
          const eventId = allEvents.ids[i];
          const eventAddress = allEvents.contracts[i];

          try {
            const eventSystemContract = new web3.eth.Contract(EventTicketSystemABI.abi, eventAddress);
            const eventName = await eventSystemContract.methods.name().call();
            const attendanceStatus = await attendanceContract.methods.attendance(account, eventId).call();

            const eventDetail = {
              id: eventId.toString(),
              contractAddress: eventAddress,
              name: eventName,
              status: attendanceStatus ? 'Verified' : 'None',
            };

            // Add each event to the state as it loads
            setEvents((prevEvents) => [eventDetail, ...prevEvents]);
          } catch (error) {
            console.error(`Error fetching details for event ID: ${eventId}`, error);
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
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
      const attendanceContract = new web3.eth.Contract(
        AttendanceContractABI.abi,
        ATTENDANCE_CONTRACT_ADDRESS
      );

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
      {loading && events.length === 0 ? (
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
              {events.map((event, index) => (
                <tr key={index}>
                  <td>{event.name}</td>
                  <td>{event.id}</td>
                  <td>{event.contractAddress}</td>
                  <td>{event.status}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleVerifyAttendance(event.id)}
                    >
                      Verify Attendance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p>Loading more events...</p>}
        </>
      )}
    </div>
  );
};

export default AttendanceBasePage;
