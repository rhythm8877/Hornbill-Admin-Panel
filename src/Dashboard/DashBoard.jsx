"use client"

import { useEffect, useState } from "react"
import CabsTaxi from "../Cabs & Taxi/CabsTaxi"
import HotelsGuestHouse from "../Hotels & Guest House/HotelsGuestHouse"
import Navbar from "../Navbar/Navbar"
import RestaurantCafe from "../Restaurant & Cafe/RestaurantCafe"
import ServicesCarousel from "../ServicesCarousel/ServicesCarousel"
import Sidebar from "../Sidebar/Sidebar"
import Stalls from "../Stalls/Stalls"
import TourGuides from "../Tour Guides/TourGuides"
import TourOperators from "../Tour Operators/TourOperators"
import TouristSpots from "../Tourist Spots/TouristSpots"
import "./Dashboard.css"

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("hotels");
  const [activeTab, setActiveTab] = useState("Services");

  // Set default section based on active tab
  useEffect(() => {
    if (activeTab === "Services") {
      setActiveSection("hotels");
    } else if (activeTab === "Festival") {
      setActiveSection("stalls");
    }
  }, [activeTab]);

  // Function to handle navigation from sidebar
  const handleNavigation = (section) => {
    setActiveSection(section);
  };

  // Render the active component based on the selected section
  const renderActiveComponent = () => {
    // Services tab components
    if (activeTab === "Services") {
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
        case "carousel":
          return <ServicesCarousel />;
        default:
          return <HotelsGuestHouse />;
      }
    } else {
      // Festival tab components
      switch (activeSection) {
        case "stalls":
          return <Stalls />;
        case "touristSpots":
          return <TouristSpots />;
        default:
          return <Stalls />;
      }
    }
  };

  return (
    <div className="dashboard-grid">
      <Sidebar onNavigate={handleNavigation} activeTab={activeTab} />
      <div className="content-wrapper">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="main-content">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  )
}

export default Dashboard