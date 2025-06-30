"use client"

import { useState } from "react"
import HotelsGuestHouse from "../Hotels & Guest House/HotelsGuestHouse"
import Navbar from "../Navbar/Navbar"
import Sidebar from "../Sidebar/Sidebar"
import "./Dashboard.css"

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("hotels");

  // Function to handle navigation from sidebar
  const handleNavigation = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="dashboard-grid">
      <Sidebar onNavigate={handleNavigation} />
      <div className="content-wrapper">
        <Navbar />
        <main className="main-content">
          <HotelsGuestHouse />
        </main>
      </div>
    </div>
  )
}

export default Dashboard