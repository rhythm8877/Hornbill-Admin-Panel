"use client"

import { useState } from "react"
import CabsTaxi from "../Cabs & Taxi/CabsTaxi"
import HotelsGuestHouse from "../Hotels & Guest House/HotelsGuestHouse"
import Navbar from "../Navbar/Navbar"
import RestaurantCafe from "../Restaurant & Cafe/RestaurantCafe"
import Sidebar from "../Sidebar/Sidebar"
import TourGuides from "../Tour Guides/TourGuides"
import TourOperators from "../Tour Operators/TourOperators"
import "./Dashboard.css"

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("hotels");

  // Function to handle navigation from sidebar
  const handleNavigation = (section) => {
    setActiveSection(section);
  };

  // Render the active component based on the selected section
  const renderActiveComponent = () => {
    switch (activeSection) {
      case "hotels":
        return <HotelsGuestHouse />;
      case "tours":
        return <TourOperators />;
      case "cabs":
        return <CabsTaxi />;
      case "guides":
        return <TourGuides />;
      case "restaurants":
        return <RestaurantCafe />;
      default:
        return <HotelsGuestHouse />;
    }
  };

  return (
    <div className="dashboard-grid">
      <Sidebar onNavigate={handleNavigation} />
      <div className="content-wrapper">
        <Navbar />
        <main className="main-content">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  )
}

export default Dashboard