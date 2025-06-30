"use client";

import { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-search">
            <button className="search-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <input type="text" placeholder="Search..." />
          </div>
        </div>
        
        <div className="navbar-right">
          <div className="navbar-profile">
            <div className="profile-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="profile-avatar">
                <span>A</span>
              </div>
              <span className="profile-name">Admin</span>
              <svg className="dropdown-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <a href="#" className="dropdown-item">Profile</a>
                  <a href="#" className="dropdown-item">Settings</a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item">Logout</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
