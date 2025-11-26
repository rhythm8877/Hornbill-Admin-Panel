"use client";

import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import Select from "react-select";
import { useEffect, useMemo, useState } from "react";
import "./TourOperators.css";
import { db } from "../firebaseConfig";

const TourOperators = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState({ value: "All", label: "All" });
  const [selectedDistrict, setSelectedDistrict] = useState({ value: "All", label: "All" });
  const [selectedStatus, setSelectedStatus] = useState({ value: "All", label: "All" });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");
  const [tourOperatorData, setTourOperatorData] = useState([]);
  const tourCollection = useMemo(() => collection(db, "tour_operators"), []);

  useEffect(() => {
    const tourQuery = query(tourCollection, orderBy("businessName", "asc"));
    const unsubscribe = onSnapshot(
      tourQuery,
      (snapshot) => {
        const records = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          return {
            docId: docSnap.id,
            photo: data.photo || "",
            businessName: data.businessName || "—",
            address: data.address || "—",
            district: data.district || "—",
            ownerName: data.owner || "—",
            phoneNumber: data.phoneNumber || "",
            govtId: data.document || "",
            services: {
              "Dzükou Valley Tours": Boolean(data.isDzukoTour),
              "Nagaland Tours": Boolean(data.isNagalandTour),
              "Northeast Tours": Boolean(data.isNorthEastTour)
            },
            isActive: Boolean(data.isActive)
          };
        });
        setTourOperatorData(records);
      },
      (error) => {
        console.error("Error fetching tour operators:", error);
      }
    );

    return () => unsubscribe();
  }, [tourCollection]);

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
      operator.services[selectedService.value];
    
    const matchesDistrict = selectedDistrict.value === "All" || 
      operator.district === selectedDistrict.value;

    const matchesStatus = selectedStatus.value === "All"
      ? true
      : selectedStatus.value === "Active"
        ? operator.isActive
        : !operator.isActive;
    
    return matchesSearch && matchesService && matchesDistrict && matchesStatus;
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
  const renderServices = (servicesObj = {}) => {
    const entries = Object.entries(servicesObj).filter(([, value]) => value);
    if (entries.length === 0) {
      return <span className="tour-muted-text">No services</span>;
    }
    return (
      <div className="tour-services">
        {entries.map(([service]) => (
          <span key={service} className="tour-service-tag">
            {service}
          </span>
        ))}
      </div>
    );
  };

  const handleStatusToggle = async (operator) => {
    try {
      const docRef = doc(db, "tour_operators", operator.docId);
      await updateDoc(docRef, { isActive: !operator.isActive });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Unable to update status. Please try again.");
    }
  };

  const renderStatusButton = (operator) => {
    return (
      <button
        className={`tour-status-toggle ${operator.isActive ? "active" : "inactive"}`}
        onClick={() => handleStatusToggle(operator)}
      >
        {operator.isActive ? "Active" : "Inactive"}
      </button>
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

            <div className="tour-dropdown-group">
              <span className="tour-label-text">Status:</span>
              <div className="tour-select-container">
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
                  placeholder="Select Status"
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTourOperators.map((operator, index) => (
                <tr key={operator.docId || operator.id}>
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
                  <td>
                    {operator.govtId ? (
                      <div
                        className="tour-photo-container"
                        onClick={() => handlePhotoClick(operator.govtId)}
                      >
                        <img
                          src={operator.govtId}
                          alt="Govt Document"
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
                    ) : (
                      <span className="tour-muted-text">No document</span>
                    )}
                  </td>
                  <td>{renderServices(operator.services)}</td>
                  <td className="tour-status-cell">{renderStatusButton(operator)}</td>
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
