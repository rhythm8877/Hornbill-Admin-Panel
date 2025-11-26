"use client";

import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import Select from "react-select";
import { useEffect, useMemo, useState } from "react";
import "./HotelsGuestHouse.css";
import { db } from "../firebaseConfig";

const HotelsGuestHouse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState({ value: "All", label: "All" });
  const [selectedDistrict, setSelectedDistrict] = useState({ value: "All", label: "All" });
  const [selectedStatus, setSelectedStatus] = useState({ value: "All", label: "All" });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");
  const [hotelData, setHotelData] = useState([]);
  const hotelCollection = useMemo(() => collection(db, "hotels"), []);

  useEffect(() => {
    const hotelQuery = query(hotelCollection, orderBy("hotelName", "asc"));
    const unsubscribe = onSnapshot(
      hotelQuery,
      (snapshot) => {
        const records = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          return {
            docId: docSnap.id,
            photo: data.photo || "",
            name: data.hotelName || "—",
            address: data.address || "—",
            townVillage: data.town || "—",
            district: data.district || "—",
            ownerName: data.owner || "—",
            phoneNumber: data.phoneNumber || "",
            propertyType: data.property || "—",
            googleMapsLink: data.gmaps || "",
            govtId: data.document || "",
            amenities: {
              wifi: Boolean(data.isWifi),
              fooding: Boolean(data.isFooding),
              "air conditioner": Boolean(data.isAC),
              fridge: Boolean(data.isFridge),
              parking: Boolean(data.isParking),
              "power backup": Boolean(data.isPowerBackup),
              "swimming pool": Boolean(data.isSwimming)
            },
            isActive: Boolean(data.isActive)
          };
        });
        setHotelData(records);
      },
      (error) => {
        console.error("Error fetching hotels:", error);
      }
    );

    return () => unsubscribe();
  }, [hotelCollection]);

  // Property type options
  const propertyTypeOptions = [
    { value: "All", label: "All" },
    { value: "Hotel", label: "Hotel" },
    { value: "Guest House", label: "Guest House" },
    { value: "Resort", label: "Resort" }
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
    
    const matchesStatus = selectedStatus.value === "All"
      ? true
      : selectedStatus.value === "Active"
        ? hotel.isActive
        : !hotel.isActive;
    
    return matchesSearch && matchesPropertyType && matchesDistrict && matchesStatus;
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
  const renderAmenities = (amenitiesObj = {}) => {
    const entries = Object.entries(amenitiesObj).filter(([, value]) => value);
    if (entries.length === 0) {
      return <span className="hotel-muted-text">No amenities</span>;
    }
    return (
      <div className="hotel-amenities">
        {entries.map(([label]) => (
          <span key={label} className="hotel-amenity-tag">
            {label}
          </span>
        ))}
      </div>
    );
  };

  const handleStatusToggle = async (hotel) => {
    try {
      const docRef = doc(db, "hotels", hotel.docId);
      await updateDoc(docRef, { isActive: !hotel.isActive });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Unable to update hotel status. Please try again.");
    }
  };

  const renderStatusButton = (hotel) => {
    return (
      <button
        className={`hotel-status-toggle ${hotel.isActive ? "active" : "inactive"}`}
        onClick={() => handleStatusToggle(hotel)}
      >
        {hotel.isActive ? "Active" : "Inactive"}
      </button>
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
            <div className="hotel-dropdown-group">
              <span className="hotel-label-text">Status:</span>
              <div className="hotel-select-container">
                <Select
                  value={selectedStatus}
                  onChange={(option) => setSelectedStatus(option)}
                  options={[
                    { value: "All", label: "All" },
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" }
                  ]}
                  styles={customSelectStyles}
                  isSearchable={false}
                  placeholder="Select status"
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
              <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHotels.map((hotel, index) => (
                <tr key={hotel.docId || hotel.id}>
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
                      {hotel.googleMapsLink ? "View on Map" : "—"}
                    </a>
                  </td>
                  <td>
                    {hotel.govtId ? (
                      <div
                        className="hotel-photo-container"
                        onClick={() => handlePhotoClick(hotel.govtId)}
                      >
                        <img
                          src={hotel.govtId}
                          alt="Govt Document"
                          className="hotel-photo"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            if (e.target.parentNode) {
                              e.target.parentNode.innerHTML =
                                '<div class="hotel-photo-placeholder">No Image</div>';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <span className="hotel-muted-text">No document</span>
                    )}
                  </td>
                  <td>{renderAmenities(hotel.amenities)}</td>
                  <td className="hotel-status-cell">{renderStatusButton(hotel)}</td>
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
