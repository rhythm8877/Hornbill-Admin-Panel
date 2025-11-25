"use client";

import { useState } from "react";
import Select from "react-select";
import { generatePlaceholderImage } from "../utils/placeholderImage";
import "./TourOperators.css";

const TourOperators = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState({ value: "All", label: "All" });
  const [selectedDistrict, setSelectedDistrict] = useState({ value: "All", label: "All" });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");

  // Dummy tour operator data
  const tourOperatorData = [
    {
      id: 1,
      photo: generatePlaceholderImage(800, 400, "Tour Operator 1"),
      businessName: "Nagaland Explorer",
      address: "123 Main Road",
      district: "Kohima",
      ownerName: "Rajesh Kumar",
      phoneNumber: "9876543210",
      govtId: "",
      services: ["Dzükou Valley Tours", "Nagaland Tours"]
    },
    {
      id: 2,
      photo: generatePlaceholderImage(800, 400, "Tour Operator 2"),
      businessName: "Northeast Journeys",
      address: "456 Hill View",
      district: "Dimapur",
      ownerName: "Anita Singh",
      phoneNumber: "8765432109",
      govtId: "",
      services: ["Northeast Tours"]
    },
    {
      id: 3,
      photo: generatePlaceholderImage(800, 400, "Tour Operator 3"),
      businessName: "Dzükou Trekkers",
      address: "789 East Road",
      district: "Mokokchung",
      ownerName: "Vikram Thapa",
      phoneNumber: "7654321098",
      govtId: "",
      services: ["Dzükou Valley Tours"]
    },
    {
      id: 4,
      photo: generatePlaceholderImage(800, 400, "Tour Operator 4"),
      businessName: "Highland Adventures",
      address: "101 Ridge Road",
      district: "Wokha",
      ownerName: "Priya Sharma",
      phoneNumber: "6543210987",
      govtId: "",
      services: ["Nagaland Tours", "Northeast Tours"]
    },
    {
      id: 5,
      photo: generatePlaceholderImage(800, 400, "Tour Operator 5"),
      businessName: "Nagaland Discovery",
      address: "202 Valley Road",
      district: "Phek",
      ownerName: "Arun Patel",
      phoneNumber: "5432109876",
      govtId: "",
      services: ["Nagaland Tours", "Dzükou Valley Tours", "Northeast Tours"]
    },
    {
      id: 6,
      photo: generatePlaceholderImage(800, 400, "Tour Operator 6"),
      businessName: "Dzükou Valley Expeditions",
      address: "303 Forest Lane",
      district: "Tuensang",
      ownerName: "Sanjay Gupta",
      phoneNumber: "4321098765",
      govtId: "",
      services: ["Dzükou Valley Tours"]
    },
    {
      id: 7,
      photo: generatePlaceholderImage(800, 400, "Tour Operator 7"),
      businessName: "Northeast Explorer",
      address: "404 River Road",
      district: "Mon",
      ownerName: "Kavita Rao",
      phoneNumber: "3210987654",
      govtId: "",
      services: ["Northeast Tours"]
    },
    {
      id: 8,
      photo: generatePlaceholderImage(800, 400, "Tour Operator 8"),
      businessName: "Nagaland Trails",
      address: "505 Mountain Pass",
      district: "Zunheboto",
      ownerName: "Rahul Mehta",
      phoneNumber: "2109876543",
      govtId: "",
      services: ["Nagaland Tours"]
    },
    {
      id: 9,
      photo: generatePlaceholderImage(800, 400, "Tour Operator 9"),
      businessName: "Dzükou Ventures",
      address: "606 West Road",
      district: "Kiphire",
      ownerName: "Neha Verma",
      phoneNumber: "1098765432",
      govtId: "",
      services: ["Dzükou Valley Tours", "Nagaland Tours"]
    },
    {
      id: 10,
      photo: generatePlaceholderImage(800, 400, "Tour Operator 10"),
      businessName: "Northeast Discoveries",
      address: "707 Forest Edge",
      district: "Peren",
      ownerName: "Amit Singh",
      phoneNumber: "9087654321",
      govtId: "",
      services: ["Northeast Tours", "Nagaland Tours"]
    }
  ];

  // Service options
  const serviceOptions = [
    { value: "All", label: "All" },
    { value: "Dzükou Valley Tours", label: "Dzükou Valley Tours" },
    { value: "Nagaland Tours", label: "Nagaland Tours" },
    { value: "Northeast Tours", label: "Northeast Tours" }
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

  // Filter tour operators based on search term, service and district
  const filteredTourOperators = tourOperatorData.filter(operator => {
    const matchesSearch = 
      operator.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.phoneNumber.includes(searchTerm);
    
    const matchesService = selectedService.value === "All" || 
      operator.services.includes(selectedService.value);
    
    const matchesDistrict = selectedDistrict.value === "All" || 
      operator.district === selectedDistrict.value;
    
    return matchesSearch && matchesService && matchesDistrict;
  });

  // Handle photo modal
  const handlePhotoClick = (photoUrl) => {
    setModalPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  // Custom select styles to match theme
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: '200px',
      border: '1px solid var(--tour-border-color)',
      borderRadius: '6px',
      fontSize: '14px',
      '&:hover': {
        borderColor: 'var(--tour-primary-color)'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'var(--tour-primary-color)' : 'white',
      color: state.isSelected ? 'white' : '#333',
      '&:hover': {
        backgroundColor: state.isSelected ? 'var(--tour-primary-color)' : 'var(--tour-primary-light)'
      }
    })
  };

  // Render services with tags
  const renderServices = (services) => {
    return (
      <div className="tour-services">
        {services.map((service, index) => (
          <span key={index} className="tour-service-tag">
            {service}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="tour-container">
      <header>
        <div className="tour-logo-text">Tour Operators</div>
      </header>

      <div className="tour-data-container">
        {/* Search and Filters */}
        <div className="tour-control-panel-filters">
          {/* Search Bar */}
          <div className="tour-search-container">
            <div className="tour-search-input-wrapper">
              <svg className="tour-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="tour-search-input"
                placeholder="Search by Business Name, Owner's Name or Phone Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="tour-dropdown-container">
            <div className="tour-dropdown-group">
              <span className="tour-label-text">Services:</span>
              <div className="tour-select-container">
                <Select
                  value={selectedService}
                  onChange={(option) => setSelectedService(option)}
                  options={serviceOptions}
                  styles={customSelectStyles}
                  isSearchable
                  placeholder="Select Service"
                />
              </div>
            </div>

            <div className="tour-dropdown-group">
              <span className="tour-label-text">District:</span>
              <div className="tour-select-container">
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

        {/* Tour Operators Table */}
        <div className="tour-table-container">
          <table className="tour-table">
            <thead>
              <tr>
                <th className="tour-sl-no-header">Sl No.</th>
                <th>Banner/Cover Photo</th>
                <th>Business Name</th>
                <th>Address</th>
                <th>District</th>
                <th>Owner's Name</th>
                <th>Phone Number</th>
                <th>Govt ID</th>
                <th>Services</th>
              </tr>
            </thead>
            <tbody>
              {filteredTourOperators.map((operator, index) => (
                <tr key={operator.id}>
                  <td className="tour-sl-no-cell">{index + 1}</td>
                  <td>
                    <div
                      className="tour-photo-container"
                      onClick={() => handlePhotoClick(operator.photo)}
                    >
                      <img
                        src={operator.photo}
                        alt={operator.businessName}
                        className="tour-photo"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          if (e.target.parentNode) {
                            e.target.parentNode.innerHTML = '<div class="tour-photo-placeholder">No Image</div>';
                          }
                        }}
                      />
                    </div>
                  </td>
                  <td>{operator.businessName}</td>
                  <td>{operator.address}</td>
                  <td>{operator.district}</td>
                  <td>{operator.ownerName}</td>
                  <td>+91-{operator.phoneNumber}</td>
                  <td>{operator.govtId}</td>
                  <td>{renderServices(operator.services)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="tour-photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div className="tour-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="tour-photo-modal-close" onClick={() => setShowPhotoModal(false)}>&times;</span>
            <img 
              src={modalPhoto} 
              alt="Tour Operator" 
              className="tour-modal-photo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image Available%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TourOperators;
