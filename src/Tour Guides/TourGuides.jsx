"use client";

import { useState } from "react";
import Select from "react-select";
import "./TourGuides.css";

const TourGuides = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState({ value: "All", label: "All" });

  // Dummy tour guide data
  const tourGuideData = [
    {
      id: 1,
      name: "Rajesh Kumar",
      address: "123 Main Road, Kohima",
      district: "Kohima",
      phoneNumber: "9876543210",
      ntaIdCard: ""
    },
    {
      id: 2,
      name: "Anita Singh",
      address: "456 Hill View, Dimapur",
      district: "Dimapur",
      phoneNumber: "8765432109",
      ntaIdCard: ""
    },
    {
      id: 3,
      name: "Vikram Thapa",
      address: "789 East Road, Mokokchung",
      district: "Mokokchung",
      phoneNumber: "7654321098",
      ntaIdCard: ""
    },
    {
      id: 4,
      name: "Priya Sharma",
      address: "101 Ridge Road, Wokha",
      district: "Wokha",
      phoneNumber: "6543210987",
      ntaIdCard: ""
    },
    {
      id: 5,
      name: "Arun Patel",
      address: "202 Valley Road, Phek",
      district: "Phek",
      phoneNumber: "5432109876",
      ntaIdCard: ""
    },
    {
      id: 6,
      name: "Sanjay Gupta",
      address: "303 Forest Lane, Tuensang",
      district: "Tuensang",
      phoneNumber: "4321098765",
      ntaIdCard: ""
    },
    {
      id: 7,
      name: "Kavita Rao",
      address: "404 River Road, Mon",
      district: "Mon",
      phoneNumber: "3210987654",
      ntaIdCard: ""
    },
    {
      id: 8,
      name: "Rahul Mehta",
      address: "505 Mountain Pass, Zunheboto",
      district: "Zunheboto",
      phoneNumber: "2109876543",
      ntaIdCard: ""
    },
    {
      id: 9,
      name: "Neha Verma",
      address: "606 West Road, Kiphire",
      district: "Kiphire",
      phoneNumber: "1098765432",
      ntaIdCard: ""
    },
    {
      id: 10,
      name: "Amit Singh",
      address: "707 Forest Edge, Peren",
      district: "Peren",
      phoneNumber: "9087654321",
      ntaIdCard: ""
    }
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

  // Filter tour guides based on search term and district
  const filteredTourGuides = tourGuideData.filter(guide => {
    const matchesSearch = 
      guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.phoneNumber.includes(searchTerm);
    
    const matchesDistrict = selectedDistrict.value === "All" || 
      guide.district === (selectedDistrict.value === "Chumoukedima/Dimapur" ? "Dimapur" : selectedDistrict.value);
    
    return matchesSearch && matchesDistrict;
  });

  // Custom select styles to match theme
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: '200px',
      border: '1px solid var(--guide-border-color)',
      borderRadius: '6px',
      fontSize: '14px',
      '&:hover': {
        borderColor: 'var(--guide-primary-color)'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'var(--guide-primary-color)' : 'white',
      color: state.isSelected ? 'white' : '#333',
      '&:hover': {
        backgroundColor: state.isSelected ? 'var(--guide-primary-color)' : 'var(--guide-primary-light)'
      }
    })
  };

  return (
    <div className="guide-container">
      <header>
        <div className="guide-logo-text">Tour Guides</div>
      </header>

      <div className="guide-data-container">
        {/* Search and Filters */}
        <div className="guide-control-panel-filters">
          <div className="guide-filters-row">
            {/* Search Bar */}
            <div className="guide-search-container">
              <div className="guide-search-input-wrapper">
                <svg className="guide-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="guide-search-input"
                  placeholder="Search by Tour Guide's Name or Phone Number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* District Dropdown */}
            <div className="guide-dropdown-group">
              <span className="guide-label-text">District:</span>
              <div className="guide-select-container">
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

        {/* Tour Guides Table */}
        <div className="guide-table-container">
          <table className="guide-table">
            <thead>
              <tr>
                <th className="guide-sl-no-header">Sl No.</th>
                <th>Tour Guide's Name</th>
                <th>Address</th>
                <th>District</th>
                <th>Phone Number</th>
                <th>NTA ID Card</th>
              </tr>
            </thead>
            <tbody>
              {filteredTourGuides.map((guide, index) => (
                <tr key={guide.id}>
                  <td className="guide-sl-no-cell">{index + 1}</td>
                  <td>{guide.name}</td>
                  <td>{guide.address}</td>
                  <td>{guide.district}</td>
                  <td>+91-{guide.phoneNumber}</td>
                  <td>{guide.ntaIdCard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TourGuides;
