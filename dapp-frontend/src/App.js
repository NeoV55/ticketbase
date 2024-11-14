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
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

function App() {
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);

  const customRpcUrl = 'https://base-sepolia.blockpi.network/v1/rpc/public'; // Replace with your custom RPC URL

  // MetaMask connection and network setup
  const connectWallet = async () => {
    const provider = await detectEthereumProvider();
    let web3Instance;

    if (provider) {
      // Use MetaMask's provider
      web3Instance = new Web3(provider);
      try {
        const accounts = await web3Instance.eth.requestAccounts();
        setAccount(accounts[0]);

        // Optionally switch to the desired network
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14a34' }], // Replace with your target chain ID if needed
        });
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      // Fallback to custom RPC if MetaMask is not available
      web3Instance = new Web3(new Web3.providers.HttpProvider(customRpcUrl));
      console.log('Using custom RPC provider');
    }

    setWeb3(web3Instance);
  };

  useEffect(() => {
    // Auto-connect to MetaMask if already connected
    const checkWalletConnection = async () => {
      const provider = await detectEthereumProvider();
      let web3Instance;

      if (provider) {
        web3Instance = new Web3(provider);
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } else {
        // Initialize with custom RPC if MetaMask is not found
        web3Instance = new Web3(new Web3.providers.HttpProvider(customRpcUrl));
      }

      setWeb3(web3Instance);
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
        <Footer />
      </div>
    </Router>
  );
}

export default App;
