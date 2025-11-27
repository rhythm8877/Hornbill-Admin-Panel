"use client";

import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./Login/Login";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./Dashboard/DashBoard";
import CabsTaxi from "./Cabs & Taxi/CabsTaxi";
import HotelsGuestHouse from "./Hotels & Guest House/HotelsGuestHouse";
import RestaurantCafe from "./Restaurant & Cafe/RestaurantCafe";
import ServicesCarousel from "./ServicesCarousel/ServicesCarousel";
import Contest from "./Contest/Contest";
import Stalls from "./Stalls/Stalls";
import TourGuides from "./Tour Guides/TourGuides";
import TourOperators from "./Tour Operators/TourOperators";
import TouristSpots from "./Tourist Spots/TouristSpots";
import TribalFestival from "./Tribal Festival/TribalFestival";
import Tribes from "./Tribes/Tribes";

const App = () => {
  return (
    <Routes>
      {/* Login route - accessible without authentication */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes - require authentication */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/services/hotels&guesthouse" replace />} />

        {/* Services routes */}
        <Route path="services">
          <Route index element={<Navigate to="/services/hotels&guesthouse" replace />} />
          <Route path="hotels&guesthouse" element={<HotelsGuestHouse />} />
          <Route path="touroperators" element={<TourOperators />} />
          <Route path="cabs&taxi" element={<CabsTaxi />} />
          <Route path="tourguides" element={<TourGuides />} />
          <Route path="restaurants&cafes" element={<RestaurantCafe />} />
          <Route path="carousel">
            <Route index element={<ServicesCarousel />} />
            <Route path="add" element={<ServicesCarousel />} />
          </Route>
          <Route path="contest">
            <Route index element={<Contest />} />
            <Route path="add" element={<Contest />} />
          </Route>
        </Route>

        {/* Festival routes */}
        <Route path="festival">
          <Route index element={<Navigate to="/festival/stalls" replace />} />
          <Route path="stalls">
            <Route index element={<Stalls />} />
            <Route path="add" element={<Stalls />} />
          </Route>
          <Route path="touristspots">
            <Route index element={<TouristSpots />} />
            <Route path="add" element={<TouristSpots />} />
          </Route>
          <Route path="tribes">
            <Route index element={<Tribes />} />
            <Route path="add" element={<Tribes />} />
          </Route>
          <Route path="tribalfestival">
            <Route index element={<TribalFestival />} />
            <Route path="add" element={<TribalFestival />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/services/hotels&guesthouse" replace />} />
      </Route>

      {/* Redirect root to login if not authenticated, or to dashboard if authenticated */}
      <Route
        path="*"
        element={
          localStorage.getItem("isAuthenticated") === "true" ? (
            <Navigate to="/services/hotels&guesthouse" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
