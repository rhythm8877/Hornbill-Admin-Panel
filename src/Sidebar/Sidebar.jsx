"use client";

import { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("hotels");

  // Handle item click
  const handleItemClick = (item) => {
    setActiveItem(item);
    if (onNavigate) {
      onNavigate(item);
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-text">
            <span className="college-name">Hornbill</span>
            <span className="college-type">Admin Panel</span>
          </div>
        </div>
        <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isCollapsed ? (
              <polyline points="9 18 15 12 9 6"></polyline>
            ) : (
              <polyline points="15 18 9 12 15 6"></polyline>
            )}
          </svg>
        </button>
      </div>

      <nav className="nav-menu">
        <div 
          className={`nav-item ${activeItem === "hotels" ? "active" : ""}`}
          onClick={() => handleItemClick("hotels")}
        >
          <div className="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
          </div>
          <span className="nav-label">Hotels & Guest House</span>
        </div>

        <div 
          className={`nav-item ${activeItem === "tours" ? "active" : ""}`}
          onClick={() => handleItemClick("tours")}
        >
          <div className="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <span className="nav-label">Tour Operators</span>
        </div>

        <div 
          className={`nav-item ${activeItem === "cabs" ? "active" : ""}`}
          onClick={() => handleItemClick("cabs")}
        >
          <div className="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="5" width="12" height="10" rx="2"></rect>
              <path d="M5 15h14"></path>
              <path d="M6 18h2"></path>
              <path d="M16 18h2"></path>
              <circle cx="9" cy="18" r="2"></circle>
              <circle cx="15" cy="18" r="2"></circle>
            </svg>
          </div>
          <span className="nav-label">Cabs & Taxi</span>
        </div>

        <div
          className={`nav-item ${activeItem === "guides" ? "active" : ""}`}
          onClick={() => handleItemClick("guides")}
        >
          <div className="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <span className="nav-label">Tour Guides</span>
        </div>

        <div
          className={`nav-item ${activeItem === "restaurants" ? "active" : ""}`}
          onClick={() => handleItemClick("restaurants")}
        >
          <div className="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2l1.578 6.131A1 1 0 0 0 5.557 9H9a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H6.5"></path>
              <path d="M2 2h1.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2"></path>
              <path d="M8 2h1.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H8"></path>
              <path d="M14 2h1.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H14"></path>
              <path d="M20 2h1.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H20"></path>
              <path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9"></path>
            </svg>
          </div>
          <span className="nav-label">Restaurants & Cafes</span>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
