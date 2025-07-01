"use client";

import { useState } from "react";
import Select from "react-select";
import "./CabsTaxi.css";

const CabsTaxi = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeaterType, setSelectedSeaterType] = useState({ value: "All", label: "All" });
  const [selectedDistrict, setSelectedDistrict] = useState({ value: "All", label: "All" });

  // Dummy cab data
  const cabData = [
    {
      id: 1,
      carModel: "Toyota Innova",
      address: "123 Main Road, Kohima",
      driverName: "Rajesh Kumar",
      phoneNumber: "9876543210",
      seaterType: "6 seater",
      drivingLicense: "",
      districtsServing: ["Kohima", "Dimapur", "Mokokchung"]
    },
    {
      id: 2,
      carModel: "Maruti Suzuki Swift",
      address: "456 Hill View, Dimapur",
      driverName: "Anita Singh",
      phoneNumber: "8765432109",
      seaterType: "4 seater",
      drivingLicense: "",
      districtsServing: ["Dimapur", "Kohima"]
    },
    {
      id: 3,
      carModel: "Mahindra Scorpio",
      address: "789 East Road, Mokokchung",
      driverName: "Vikram Thapa",
      phoneNumber: "7654321098",
      seaterType: "6 seater",
      drivingLicense: "",
      districtsServing: ["Mokokchung", "Wokha", "Tuensang"]
    },
    {
      id: 4,
      carModel: "Hyundai i20",
      address: "101 Ridge Road, Wokha",
      driverName: "Priya Sharma",
      phoneNumber: "6543210987",
      seaterType: "5 seater",
      drivingLicense: "",
      districtsServing: ["Wokha", "Mokokchung"]
    },
    {
      id: 5,
      carModel: "Tata Nexon",
      address: "202 Valley Road, Phek",
      driverName: "Arun Patel",
      phoneNumber: "5432109876",
      seaterType: "5 seater",
      drivingLicense: "",
      districtsServing: ["Phek", "Kohima", "Kiphire"]
    },
    {
      id: 6,
      carModel: "Toyota Fortuner",
      address: "303 Forest Lane, Tuensang",
      driverName: "Sanjay Gupta",
      phoneNumber: "4321098765",
      seaterType: "6 seater",
      drivingLicense: "",
      districtsServing: ["Tuensang", "Mon", "Longleng"]
    },
    {
      id: 7,
      carModel: "Maruti Suzuki Ertiga",
      address: "404 River Road, Mon",
      driverName: "Kavita Rao",
      phoneNumber: "3210987654",
      seaterType: "6 seater",
      drivingLicense: "",
      districtsServing: ["Mon", "Longleng"]
    },
    {
      id: 8,
      carModel: "Honda City",
      address: "505 Mountain Pass, Zunheboto",
      driverName: "Rahul Mehta",
      phoneNumber: "2109876543",
      seaterType: "5 seater",
      drivingLicense: "",
      districtsServing: ["Zunheboto", "Phek"]
    },
    {
      id: 9,
      carModel: "Hyundai Creta",
      address: "606 West Road, Kiphire",
      driverName: "Neha Verma",
      phoneNumber: "1098765432",
      seaterType: "5 seater",
      drivingLicense: "",
      districtsServing: ["Kiphire", "Phek", "Tuensang"]
    },
    {
      id: 10,
      carModel: "Mahindra XUV500",
      address: "707 Forest Edge, Peren",
      driverName: "Amit Singh",
      phoneNumber: "9087654321",
      seaterType: "6 seater",
      drivingLicense: "",
      districtsServing: ["Peren", "Kohima", "Dimapur"]
    }
  ];

  // Seater type options
  const seaterTypeOptions = [
    { value: "All", label: "All" },
    { value: "4 seater", label: "4 seater" },
    { value: "5 seater", label: "5 seater" },
    { value: "6 seater", label: "6 seater" }
  ];

  // District options
  const districtOptions = [
    { value: "All", label: "All" },
    { value: "Chumoukedima/Dimapur", label: "Chumoukedima/Dimapur" },
    { value: "Kiphire", label: "Kiphire" },
    { value: "Kohima", label: "Kohima" },
    { value: "Longleng", label: "Longleng" },
    { value: "Mokokchung", label: "Mokokchung" },
    { value: "Mon", label: "Mon" },
    { value: "Niuland", label: "Niuland" },
    { value: "Noklak", label: "Noklak" },
    { value: "Peren", label: "Peren" },
    { value: "Phek", label: "Phek" },
    { value: "Shamator", label: "Shamator" },
    { value: "Tuensang", label: "Tuensang" },
    { value: "Tseminyü", label: "Tseminyü" },
    { value: "Wokha", label: "Wokha" },
    { value: "Zünheboto", label: "Zünheboto" }
  ];

  // Filter cabs based on search term, seater type and district
  const filteredCabs = cabData.filter(cab => {
    const matchesSearch = 
      cab.carModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cab.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cab.phoneNumber.includes(searchTerm);
    
    const matchesSeaterType = selectedSeaterType.value === "All" || 
      cab.seaterType === selectedSeaterType.value;
    
    const matchesDistrict = selectedDistrict.value === "All" || 
      cab.districtsServing.includes(selectedDistrict.value === "Chumoukedima/Dimapur" ? "Dimapur" : selectedDistrict.value);
    
    return matchesSearch && matchesSeaterType && matchesDistrict;
  });

  // Custom select styles to match theme
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: '200px',
      border: '1px solid var(--cab-border-color)',
      borderRadius: '6px',
      fontSize: '14px',
      '&:hover': {
        borderColor: 'var(--cab-primary-color)'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'var(--cab-primary-color)' : 'white',
      color: state.isSelected ? 'white' : '#333',
      '&:hover': {
        backgroundColor: state.isSelected ? 'var(--cab-primary-color)' : 'var(--cab-primary-light)'
      }
    })
  };

  // Render districts with tags
  const renderDistricts = (districts) => {
    return (
      <div className="cab-districts">
        {districts.map((district, index) => (
          <span key={index} className="cab-district-tag">
            {district}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="cab-container">
      <header>
        <div className="cab-logo-text">Cabs & Taxi</div>
      </header>

      <div className="cab-data-container">
        {/* Search and Filters */}
        <div className="cab-control-panel-filters">
          {/* Search Bar */}
          <div className="cab-search-container">
            <div className="cab-search-input-wrapper">
              <svg className="cab-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="cab-search-input"
                placeholder="Search by Car Model, Driver's Name or Phone Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="cab-dropdown-container">
            <div className="cab-dropdown-group">
              <span className="cab-label-text">Seater Type:</span>
              <div className="cab-select-container">
                <Select
                  value={selectedSeaterType}
                  onChange={(option) => setSelectedSeaterType(option)}
                  options={seaterTypeOptions}
                  styles={customSelectStyles}
                  isSearchable
                  placeholder="Select Seater Type"
                />
              </div>
            </div>

            <div className="cab-dropdown-group">
              <span className="cab-label-text">District Serving:</span>
              <div className="cab-select-container">
                <Select
                  value={selectedDistrict}
                  onChange={(option) => setSelectedDistrict(option)}
                  options={districtOptions}
                  styles={customSelectStyles}
                  isSearchable
                  placeholder="Select District"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cabs Table */}
        <div className="cab-table-container">
          <table className="cab-table">
            <thead>
              <tr>
                <th className="cab-sl-no-header">Sl No.</th>
                <th>Car Model</th>
                <th>Address</th>
                <th>Driver's Name</th>
                <th>Phone Number</th>
                <th>Seater Type</th>
                <th>Driving License</th>
                <th>Districts Serving</th>
              </tr>
            </thead>
            <tbody>
              {filteredCabs.map((cab, index) => (
                <tr key={cab.id}>
                  <td className="cab-sl-no-cell">{index + 1}</td>
                  <td>{cab.carModel}</td>
                  <td>{cab.address}</td>
                  <td>{cab.driverName}</td>
                  <td>+91-{cab.phoneNumber}</td>
                  <td>{cab.seaterType}</td>
                  <td>{cab.drivingLicense}</td>
                  <td>{renderDistricts(cab.districtsServing)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CabsTaxi;
