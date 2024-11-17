<p align="center"><img src="dapp-frontend/src/assets/fonts/ticketbase1.png" width="480"\></p>

## Overview         
**TicketBase** is a full-stack, decentralized event management system built on blockchain technology. Designed as middleware, it seamlessly integrates with private, independent, or enterprise-level ticketing solutions. By leveraging smart contracts, DAO governance, and fintech capabilities, TicketBase offers a scalable, transparent, and secure environment for event creation, ticketing, attendance verification, and more.

TicketBase aligns with Sustainable Development Goals (SDGs), promoting inclusivity, sustainability, and public good through blockchain technology.

## Table of Contents
- [Overview](#Overview)
- [Tutorials & Video Guides](Tutorials#)
- [Documentation](#Documentation)
- [Visual, UI, and UX Demonstrations](#VisualUIandUXDemonstrations)
- [Deployed Contracts - Testnet](#DeployedContracts-Testnet)
- [Features](#Features)
- [Project Structure](#ProjectStructure)
- [Installation local development](#Installation)
- [Key Smart Contracts](#KeySmartContracts)
- [Usage Guide](#UsageGuide)
- [Security Considerations](#SecurityConsiderations)
- [Contributing](#Contributing)
- [License](#license)

---

## Resources

For a comprehensive understanding of how to interact with the TicketBase DApp, we have provided the following resources:

## Tutorials & Video Guides
- [Getting Started with TicketBase](link-to-video): A step-by-step video guide on setting up and using the DApp.
- [How to Create and Manage Events](link-to-video): Learn how to create, manage, and organize events on TicketBase.
- [Purchasing and Trading NFT Tickets](link-to-video): A visual walkthrough of buying and selling tickets securely on our platform.
- [Attendance Verification with NFTs](link-to-video): Discover how to verify event attendance using blockchain and NFTs for proof-of-attendance.
- [Contributing to the Liquidity Pool](link-to-video): Learn how to participate in the liquidity pool and earn governance tokens by supporting event-based pools.
- [Decentralized Autonomous Organization (DAO) Governance](link-to-video): An overview of how to engage with and participate in TicketBase’s DAO for decision-making.
- [Navigating the Ticket Marketplace](link-to-video): A guide to using TicketBase's decentralized ticket marketplace for secure P2P transactions.

## Documentation
- [TicketBase User Documentation](link-to-docs): Detailed, written instructions covering all aspects of the DApp, including setup, usage, and troubleshooting.
- [API Reference](link-to-api-docs): Comprehensive documentation for developers looking to interact programmatically with the TicketBase ecosystem.

## Visual, UI, and UX Demonstrations
- [UI/UX Design Overview](link-to-ui-ux-demo): Explore the design philosophy behind TicketBase, showcasing the user interface and user experience principles.
- [Interactive Demo](link-to-interactive-demo): Try out TicketBase in a simulated environment to get hands-on experience before interacting with the live DApp.

Resources Links :
- **[TicketBase Video Guide on YouTube](link-to-video)**
- **[TicketBase User Interaction Documentation](link-to-video)**
- **[TicketBase MVP Prototype WebSite](https://ticketbase-sigma.vercel.app/)**


These resources are designed to guide you through every step of using and contributing to TicketBase, ensuring an intuitive and seamless experience. Should you need further assistance, feel free to open an issue or consult the community.

### Deployed and Verfified Contracts Links - Base-Sepolia Testnet :
   - [LiquidityPoolFactory : 0x7f1a84008171D8f3209BB889743656DfC8373575](https://base-sepolia.blockscout.com/address/0x7f1a84008171D8f3209BB889743656DfC8373575)
   - [TicketMarketplace : 0x4b0864e55616b4aa2bFeFAedDA73c01565651033](https://base-sepolia.blockscout.com/address/0x4b0864e55616b4aa2bFeFAedDA73c01565651033)
   - [EventFactory : 0x1920De7F459cb722Ba31D7eeD05B1a4f05D23e7e](https://base-sepolia.blockscout.com/address/0x1920De7F459cb722Ba31D7eeD05B1a4f05D23e7e)
   - [TicketMarketplace : 0x430Ca916d02128A393aE0cE88a6e8450035AE838](https://base-sepolia.blockscout.com/address/0x430Ca916d02128A393aE0cE88a6e8450035AE838)
   - [LiquidityPoolFactory : 0xFf680809cb2D0334D3Ae8133CaA6eD70ABCe27eE](https://base-sepolia.blockscout.com/address/0xFf680809cb2D0334D3Ae8133CaA6eD70ABCe27eE)

</br>
</br>
</br>
<p align="center"><img src="dapp-frontend/src/assets/fonts/ticketbaXXXXXse2z.png" width="480"\></p>

## Features

### 1. **Decentralized Event Management**
   - **Smart Contract-Driven Ticketing**: Tickets are minted, sold, and transferred as NFTs, offering transparency and security.
   - **Event Marketplace**: List and manage events with blockchain-backed transparency.
   - **Flexible Event Parameters**: Organizers can update dates, ticket prices, and more before an event.
   - **Enterprise Integration**: Can be deployed as a middleware solution in private and enterprise contexts.

### 2. **DAO and Governance Integration**
   - **Community Voting**: Contributors earn governance tokens to vote on event-related decisions and platform changes.
   - **Token-Based Stakeholder System**: Grant contributors a say in platform evolution, rewards, and system upgrades.
   - **Dynamic DAO Roles**: Role-based DAO setup allowing various permissions based on contributions or token holdings.

### 3. **Sustainable Event Management**
   - **Carbon Footprint Tracking**: Track event emissions and offset carbon using smart contract-enabled credits.
   - **Green Incentives**: Reward attendees who minimize their carbon impact, such as using public transport.
   - **Green Event Certifications**: Offer verifiable sustainability badges for eco-friendly events.

### 4. **Decentralized Crowdfunding and Liquidity Pools**
   - **Crowdfunding Pools**: Event organizers can raise funds through decentralized liquidity pools.
   - **Investor Incentives**: Contributors earn governance tokens and may access exclusive perks or rewards.
   - **Tokenized ROI**: Create tokenized investment returns for major contributors.

### 5. **NFT-Based Ticketing and Collectibles**
   - **NFT Tickets**: Tickets are minted as NFTs (ERC-721/1155), guaranteeing authenticity and uniqueness.
   - **Proof of Attendance**: Attendees receive collectible NFTs as proof of participation, which may unlock rewards.
   - **Special Collectibles**: Limited-edition NFTs for exclusive events or VIP tickets.

### 6. **Inclusive Ticketing Solutions**
   - **Subsidized Ticketing**: Special rates for marginalized communities using blockchain verification.
   - **Flexible Payment Options**: Accept both cryptocurrency and fiat payments with integrated payment processors.
   - **Anti-Scalping Measures**: Ownership tracking to minimize scalping and ensure tickets go to real users.

### 7. **Decentralized Attendance Verification**
   - **Blockchain-Verified Check-ins**: Attendees verify tickets on-chain, ensuring secure attendance tracking.
   - **Incentivized Attendance**: Reward attendance with token-based incentives or access to future events.

### 8. **Enhanced Security**
   - **Smart Contract Audits**: Contracts undergo professional audits for maximum security.
   - **Multi-Signature Wallets**: Core functions are secured with multi-signature requirements.
   - **Reentrancy Protections**: Secure coding practices to protect against common smart contract vulnerabilities.

---

## Project Structure

1. **Frontend**:
   - Built using **React.js** for a seamless user interface.
   - Wallet integration through **MetaMask** or any compatible Web3 wallet.
   
2. **Backend**:
   - Core functionality implemented via Solidity smart contracts, handling event creation, ticketing, crowdfunding, attendance tracking, and more.

3. **Smart Contracts**:
   - **EventFactory**: Event creation and management.
   - **TicketMarketplace**: NFT-based ticket sales and peer-to-peer transactions.
   - **LiquidityPoolFactory**: Decentralized crowdfunding for events.
   - **EventTicketSystem**: Minting and validation of NFT tickets.
   - **NewEventAttendance**: Attendance tracking and NFT-based proof of attendance.

---

## To Start local development and interact on Base-Sepolia 

## Installation

### Prerequisites
- **Node.js** (v16+)
- **npm** or **yarn**
- **MetaMask** or any Web3 wallet
- **Ganache** or **Hardhat** for local blockchain development

### Steps

1. **Clone the Repository**:
    ```
    git clone https://github.com/NeoV55/ticketbase.git
    ```
2. **Change Directory**:
    ```
    cd dapp-frontend
    ```
3. **Install Node**:
    ```
    npm i
    ```
4. **Start Node**:
    ```
    npm start
    ```





# Key Smart Contracts

- **LiquidityPoolFactory**:  
  Enables event-based liquidity pools, rewarding contributors with governance tokens.

- **TicketMarketplace**:  
  Decentralized ticket trading platform, ensuring secure P2P transactions.

- **EventFactory**:  
  Facilitates decentralized event creation and management with immutable record-keeping.

- **EventTicketSystem**:  
  Manages NFT ticket issuance, validation, and marketplace integration.

- **NewEventAttendance**:  
  Blockchain-based attendance verification with NFTs for proof of attendance.

---

# Usage Guide

- **Create an Event**:  
  Connect your wallet, fill in event details, and submit to create an event on-chain.

- **Buy Tickets**:  
  Choose an event, complete purchase, and receive NFT tickets to your wallet.

- **Track Attendance**:  
  Verify attendance on-chain and receive proof-of-attendance NFTs as rewards.

- **Contribute to Crowdfunding**:  
  Invest in events through liquidity pools and earn governance tokens.

---

# Security Considerations

- **Smart Contract Audits**: All contracts are professionally audited.
- **Multi-Signature Wallets**: Critical functions secured with multi-signature wallets.
- **Reentrancy Protections**: Guards against reentrancy attacks in contracts.

---

# Contributing

We welcome contributions! Follow these steps:

1. Fork the repo.
2. Create a new branch:

    ```bash
    git checkout -b feature-name
    ```

3. Commit your changes:

    ```bash
    git commit -m "add feature"
    ```

4. Push to the branch:

    ```bash
    git push origin feature-name
    ```

5. Create a pull request.

---

# License

This project is licensed under the MIT License.

---

Thank you for supporting TicketBase! Feel free to raise issues or contribute to the project.

