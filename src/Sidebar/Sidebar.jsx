"use client";

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const servicesNavItems = [
  {
    to: "/services/hotels&guesthouse",
    label: "Hotels & Guest House",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
      </svg>
    )
  },
  {
    to: "/services/touroperators",
    label: "Tour Operators",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    )
  },
  {
    to: "/services/cabs&taxi",
    label: "Cabs & Taxi",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="5" width="12" height="10" rx="2"></rect>
        <path d="M5 15h14"></path>
        <path d="M6 18h2"></path>
        <path d="M16 18h2"></path>
        <circle cx="9" cy="18" r="2"></circle>
        <circle cx="15" cy="18" r="2"></circle>
      </svg>
    )
  },
  {
    to: "/services/tourguides",
    label: "Tour Guides",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    to: "/services/restaurants&cafes",
    label: "Restaurants & Cafes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2l1.578 6.131A1 1 0 0 0 5.557 9H9a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H6.5"></path>
        <path d="M2 2h1.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2"></path>
        <path d="M8 2h1.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H8"></path>
        <path d="M14 2h1.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H14"></path>
        <path d="M20 2h1.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H20"></path>
        <path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9"></path>
      </svg>
    )
  },
  {
    to: "/services/carousel",
    label: "Carousel",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M22 12h-4"></path>
        <path d="M6 12H2"></path>
        <path d="M17 12l-3 3"></path>
        <path d="M17 12l-3-3"></path>
        <path d="M7 12l3 3"></path>
        <path d="M7 12l3-3"></path>
      </svg>
    )
  },
  {
    to: "/services/contest",
    label: "Contest",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 4h18M7 4v2a4 4 0 0 0 8 0V4"></path>
        <path d="M5 22h14"></path>
        <path d="M5 16h14v6H5z"></path>
        <path d="M12 16v6"></path>
      </svg>
    )
  },
  {
    to: "/services/landmark",
    label: "Landmark",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    )
  }
];

const festivalNavItems = [
  {
    to: "/festival/stalls",
    label: "Stalls",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zm0 0H2"></path>
        <path d="M6 9v12"></path>
        <path d="M18 9v12"></path>
        <path d="M4 22h16"></path>
        <path d="M10 7v8"></path>
        <path d="M14 7v8"></path>
      </svg>
    )
  },
  {
    to: "/festival/touristspots",
    label: "Tourist Spots",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      </svg>
    )
  },
  {
    to: "/festival/tribes",
    label: "Tribes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        <circle cx="12" cy="16" r="1"></circle>
        <circle cx="18" cy="16" r="1"></circle>
        <circle cx="6" cy="16" r="1"></circle>
      </svg>
    )
  },
  {
    to: "/festival/tribalfestival",
    label: "Tribal Festival",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8z"></path>
        <path d="M3.29 7 12 12l8.71-5"></path>
        <path d="M12 22V12"></path>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    )
  }
];

const Sidebar = ({
  activeTab = "Services",
  isMobile = false,
  isMobileOpen = true,
  onMobileClose
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const menuItems = activeTab === "Festival" ? festivalNavItems : servicesNavItems;

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    navigate("/login", { replace: true });
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const handleNavClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarClasses = [
    "sidebar",
    isCollapsed ? "collapsed" : "",
    isMobile ? "mobile" : "",
    isMobile ? (isMobileOpen ? "mobile-open" : "mobile-closed") : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {isMobile && (
        <div
          className={`sidebar-backdrop ${isMobileOpen ? "show" : ""}`}
          onClick={onMobileClose}
        />
      )}
      <div className={sidebarClasses}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-text">
              <span className="college-name">Hornbill</span>
              <span className="college-type">Admin Panel</span>
            </div>
          </div>
          {!isMobile && (
            <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isCollapsed ? (
                  <polyline points="9 18 15 12 9 6"></polyline>
                ) : (
                  <polyline points="15 18 9 12 15 6"></polyline>
                )}
              </svg>
            </button>
          )}
        </div>

        <nav className="nav-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="logout-container">
          <button className="logout-button" onClick={handleLogout}>
            <div className="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
