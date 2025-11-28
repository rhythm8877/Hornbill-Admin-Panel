"use client";

import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import "./Dashboard.css";

const MOBILE_BREAKPOINT = 900;

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeTab = location.pathname.startsWith("/festival") ? "Festival" : "Services";

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isMobile && isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isMobileMenuOpen]);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;

    if (tab === "Services") {
      navigate("/services/hotels&guesthouse");
    } else {
      navigate("/festival/stalls");
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className={`dashboard-grid ${isMobile ? "dashboard-mobile" : ""}`}>
      <Sidebar
        activeTab={activeTab}
        isMobile={isMobile}
        isMobileOpen={isMobile ? isMobileMenuOpen : true}
        onMobileClose={closeMobileMenu}
      />
      <div className="content-wrapper">
        <Navbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onMenuToggle={() => setIsMobileMenuOpen((prev) => !prev)}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;