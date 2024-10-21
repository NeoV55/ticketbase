import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';

const Navbar = () => {
  const [account, setAccount] = useState('');

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      const web3 = new Web3(provider);
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <nav className="navbar navbar-light bg-light">
      <span className="navbar-brand mb-0 h1">ticketbase</span>
      <button onClick={connectWallet} className="btn btn-primary">
        {account ? `Connected: ${account}` : 'Connect Wallet'}
      </button>
    </nav>
  );
};

export default Navbar;
