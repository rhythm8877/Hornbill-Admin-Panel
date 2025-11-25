"use client";

import { useState } from "react";
import Select from "react-select";
import "./HotelsGuestHouse.css";

const HotelsGuestHouse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState({ value: "All", label: "All" });
  const [selectedDistrict, setSelectedDistrict] = useState({ value: "All", label: "All" });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");

  // Dummy hotel data
  const hotelData = [
    {
      id: 1,
      photo: "https://via.placeholder.com/800x400/24B295/ffffff?text=Hotel+Image+1",
      name: "Green Valley Resort",
      address: "123 Main Road",
      townVillage: "Green Hills",
      district: "Kohima",
      ownerName: "Rajesh Kumar",
      phoneNumber: "9876543210",
      propertyType: "Hotel",
      googleMapsLink: "https://maps.google.com/?q=Kohima",
      govtId: "",
      amenities: ["wifi", "fooding", "power backup", "parking"]
    },
    {
      id: 2,
      photo: "https://via.placeholder.com/800x400/24B295/ffffff?text=Hotel+Image+2",
      name: "Blue Mountain Guest House",
      address: "456 Hill View",
      townVillage: "Pine Valley",
      district: "Dimapur",
      ownerName: "Anita Singh",
      phoneNumber: "8765432109",
      propertyType: "Guest House",
      googleMapsLink: "https://maps.google.com/?q=Dimapur",
      govtId: "",
      amenities: ["wifi", "fooding", "air conditioner", "fridge"]
    },
    {
      id: 3,
      photo: "https://via.placeholder.com/800x400/24B295/ffffff?text=Hotel+Image+3",
      name: "Sunrise Hotel",
      address: "789 East Road",
      townVillage: "Sunrise Valley",
      district: "Mokokchung",
      ownerName: "Vikram Thapa",
      phoneNumber: "7654321098",
      propertyType: "Hotel",
      googleMapsLink: "https://maps.google.com/?q=Mokokchung",
      govtId: "",
      amenities: ["wifi", "fooding", "swimming pool", "air conditioner", "parking"]
    },
    {
      id: 4,
      photo: "https://via.placeholder.com/800x400/24B295/ffffff?text=Hotel+Image+4",
      name: "Mountain View Inn",
      address: "101 Ridge Road",
      townVillage: "Highland",
      district: "Wokha",
      ownerName: "Priya Sharma",
      phoneNumber: "6543210987",
      propertyType: "Guest House",
      googleMapsLink: "https://maps.google.com/?q=Wokha",
      govtId: "",
      amenities: ["wifi", "power backup", "parking"]
    },
    {
      id: 5,
      photo: "https://via.placeholder.com/800x400/24B295/ffffff?text=Hotel+Image+5",
      name: "Valley View Resort",
      address: "202 Valley Road",
      townVillage: "Green Valley",
      district: "Phek",
      ownerName: "Arun Patel",
      phoneNumber: "5432109876",
      propertyType: "Hotel",
      googleMapsLink: "https://maps.google.com/?q=Phek",
      govtId: "",
      amenities: ["wifi", "fooding", "swimming pool", "power backup", "air conditioner", "parking", "fridge"]
    },
    {
      id: 6,
      photo: "https://via.placeholder.com/800x400/24B295/ffffff?text=Hotel+Image+6",
      name: "Pine Tree Lodge",
      address: "303 Forest Lane",
      townVillage: "Pine Forest",
      district: "Tuensang",
      ownerName: "Sanjay Gupta",
      phoneNumber: "4321098765",
      propertyType: "Guest House",
      googleMapsLink: "https://maps.google.com/?q=Tuensang",
      govtId: "",
      amenities: ["wifi", "fooding", "power backup"]
    },
    {
      id: 7,
      photo: "https://via.placeholder.com/800x400/24B295/ffffff?text=Hotel+Image+7",
      name: "Riverside Retreat",
      address: "404 River Road",
      townVillage: "River Bank",
      district: "Mon",
      ownerName: "Kavita Rao",
      phoneNumber: "3210987654",
      propertyType: "Hotel",
      googleMapsLink: "https://maps.google.com/?q=Mon",
      govtId: "",
      amenities: ["wifi", "fooding", "power backup", "air conditioner", "parking"]
    },
    {
      id: 8,
      photo: "https://via.placeholder.com/800x400/24B295/ffffff?text=Hotel+Image+8",
      name: "Highland Guest House",
      address: "505 Mountain Pass",
      townVillage: "Mountain Top",
      district: "Zunheboto",
      ownerName: "Rahul Mehta",
      phoneNumber: "2109876543",
      propertyType: "Guest House",
      googleMapsLink: "https://maps.google.com/?q=Zunheboto",
      govtId: "",
      amenities: ["wifi", "fooding", "fridge"]
    },
    {
      id: 9,
      photo: "https://via.placeholder.com/800x400/24B295/ffffff?text=Hotel+Image+9",
      name: "Sunset Hotel",
      address: "606 West Road",
      townVillage: "Sunset Hills",
      district: "Kiphire",
      ownerName: "Neha Verma",
      phoneNumber: "1098765432",
      propertyType: "Hotel",
      googleMapsLink: "https://maps.google.com/?q=Kiphire",
      govtId: "",
      amenities: ["wifi", "fooding", "swimming pool", "power backup", "air conditioner"]
    },
    {
      id: 10,
      photo: "https://via.placeholder.com/800x400/24B295/ffffff?text=Hotel+Image+10",
      name: "Forest Edge Lodge",
      address: "707 Forest Edge",
      townVillage: "Forest View",
      district: "Peren",
      ownerName: "Amit Singh",
      phoneNumber: "9087654321",
      propertyType: "Guest House",
      googleMapsLink: "https://maps.google.com/?q=Peren",
      govtId: "",
      amenities: ["wifi", "fooding", "power backup", "parking"]
    }
  ];

  // Property type options
  const propertyTypeOptions = [
    { value: "All", label: "All" },
    { value: "Hotel", label: "Hotel" },
    { value: "Guest House", label: "Guest House" }
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

  // Filter hotels based on search term, property type and district
  const filteredHotels = hotelData.filter(hotel => {
    const matchesSearch = 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.phoneNumber.includes(searchTerm);
    
    const matchesPropertyType = selectedPropertyType.value === "All" || 
      hotel.propertyType === selectedPropertyType.value;
    
    const matchesDistrict = selectedDistrict.value === "All" || 
      hotel.district === selectedDistrict.value;
    
    return matchesSearch && matchesPropertyType && matchesDistrict;
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
      border: '1px solid var(--navbar-border)',
      borderRadius: '6px',
      fontSize: '14px',
      '&:hover': {
        borderColor: 'var(--primary-color)'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'var(--primary-color)' : 'white',
      color: state.isSelected ? 'white' : '#333',
      '&:hover': {
        backgroundColor: state.isSelected ? 'var(--primary-color)' : 'var(--primary-light)'
      }
    })
  };

  // Render amenities with icons
  const renderAmenities = (amenities) => {
    return (
      <div className="hotel-amenities">
        {amenities.map((amenity, index) => (
          <span key={index} className="hotel-amenity-tag">
            {amenity}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="hotel-container">
      <header>
        <div className="hotel-logo-text">Hotels & Guest House</div>
      </header>

      <div className="hotel-data-container">
        {/* Search and Filters */}
        <div className="hotel-control-panel-filters">
          {/* Search Bar */}
          <div className="hotel-search-container">
            <div className="hotel-search-input-wrapper">
              <svg className="hotel-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="hotel-search-input"
                placeholder="Search by Hotel/PG Name, Owner's Name or Phone Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="hotel-dropdown-container">
            <div className="hotel-dropdown-group">
              <span className="hotel-label-text">Property Type:</span>
              <div className="hotel-select-container">
                <Select
                  value={selectedPropertyType}
                  onChange={(option) => setSelectedPropertyType(option)}
                  options={propertyTypeOptions}
                  styles={customSelectStyles}
                  isSearchable
                  placeholder="Select Property Type"
                />
              </div>
            </div>

            <div className="hotel-dropdown-group">
              <span className="hotel-label-text">District:</span>
              <div className="hotel-select-container">
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

        {/* Hotels Table */}
        <div className="hotel-table-container">
          <table className="hotel-table">
            <thead>
              <tr>
                <th className="hotel-sl-no-header">Sl No.</th>
                <th>Banner/Cover Photo</th>
                <th>Hotel/PG Name</th>
                <th>Address</th>
                <th>Town/Village</th>
                <th>District</th>
                <th>Owner's Name</th>
                <th>Phone Number</th>
                <th>Property Type</th>
                <th>Google Maps Link</th>
                <th>Govt ID</th>
                <th>Amenities</th>
              </tr>
            </thead>
            <tbody>
              {filteredHotels.map((hotel, index) => (
                <tr key={hotel.id}>
                  <td className="hotel-sl-no-cell">{index + 1}</td>
                  <td>
                    <div
                      className="hotel-photo-container"
                      onClick={() => handlePhotoClick(hotel.photo)}
                    >
                      <img
                        src={hotel.photo}
                        alt={hotel.name}
                        className="hotel-photo"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          if (e.target.parentNode) {
                            e.target.parentNode.innerHTML = '<div class="hotel-photo-placeholder">No Image</div>';
                          }
                        }}
                      />
                    </div>
                  </td>
                  <td>{hotel.name}</td>
                  <td>{hotel.address}</td>
                  <td>{hotel.townVillage}</td>
                  <td>{hotel.district}</td>
                  <td>{hotel.ownerName}</td>
                  <td>+91-{hotel.phoneNumber}</td>
                  <td>{hotel.propertyType}</td>
                  <td>
                    <a 
                      href={hotel.googleMapsLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hotel-map-link"
                    >
                      View on Map
                    </a>
                  </td>
                  <td>{hotel.govtId}</td>
                  <td>{renderAmenities(hotel.amenities)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="hotel-photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div className="hotel-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="hotel-photo-modal-close" onClick={() => setShowPhotoModal(false)}>&times;</span>
            <img 
              src={modalPhoto} 
              alt="Hotel" 
              className="hotel-modal-photo"
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

export default HotelsGuestHouse;
