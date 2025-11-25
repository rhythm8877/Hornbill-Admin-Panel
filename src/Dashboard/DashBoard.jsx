"use client";

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import "./Dashboard.css";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = location.pathname.startsWith("/festival") ? "Festival" : "Services";

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;

    if (tab === "Services") {
      navigate("/services/hotels&guesthouse");
    } else {
      navigate("/festival/stalls");
    }
  };

  return (
    <div className="dashboard-grid">
      <Sidebar activeTab={activeTab} />
      <div className="content-wrapper">
        <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;