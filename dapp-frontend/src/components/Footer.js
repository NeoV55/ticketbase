import React from 'react';
import './Footer.css'; // Import your footer styles

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <a href="/terms" className="footer-link">Terms of Service</a>
                <span className="footer-center">ticketbase, base.eth</span>
                <a href="/privacy" className="footer-link">Privacy Policy</a>
            </div>
        </footer>
    );
};

export default Footer;
