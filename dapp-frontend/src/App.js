// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';

// Import pages
import WalletPage from './pages/WalletPage';
import HomeBasePage from './pages/HomeBasePage';
import EventBasePage from './pages/EventBasePage';
import MarketBasePage from './pages/MarketBasePage';
import AttendanceBasePage from './pages/AttendanceBasePage';
import PoolBasePage from './pages/PoolBasePage';

// Import CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import Footer from './components/Footer'; // Adjust the path if necessary




function App() {
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);

  

  // MetaMask connection and network setup
  const connectWallet = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);

      try {
        const accounts = await web3Instance.eth.requestAccounts();
        setAccount(accounts[0]);

        // Optionally switch to the Base chain network
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14a54' }], // Example chain ID, replace with Base chain ID if different
        });
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this dApp.');
    }
  };

  

  useEffect(() => {
    // Auto-connect to MetaMask if already connected
    const checkWalletConnection = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    };
    checkWalletConnection();
  }, []);

  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <Link className="navbar-brand" to="/" style={{ fontSize: '36px', fontWeight: 'bold', color: '#0052cc' }}>ticketbase</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/wallet">Wallet</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/events">Events</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/marketplace">Marketplace</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/attendance">Attendance</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/pools">Pools</Link>
              </li>
            </ul>
          </div>
          <button onClick={connectWallet} className="btn btn-primary">
            {account ? `Connected: ${account}` : 'Connect Wallet'}
          </button>
        </nav>

        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<HomeBasePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/events" element={<EventBasePage />} />
            <Route path="/marketplace" element={<MarketBasePage />} />
            <Route path="/attendance" element={<AttendanceBasePage />} />
            <Route path="/pools" element={<PoolBasePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}


export default App;
