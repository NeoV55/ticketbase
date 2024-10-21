import React from 'react';
import './Footer.css'; // If you have a CSS file for the footer

const Footer = () => (
    <footer style={{ backgroundColor: '#001b5e', color: 'white', padding: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Terms of Service</span>
            <span style={{ fontWeight: 'bold' }}>ticketbase, base.eth</span>
            <span>Privacy Policy</span>
        </div>
    </footer>
);

export default Footer;
