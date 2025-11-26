"use client";

import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./CabsTaxi.css";

const CabsTaxi = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeaterType, setSelectedSeaterType] = useState({ value: "All", label: "All" });
  const [selectedDistrict, setSelectedDistrict] = useState({ value: "All", label: "All" });
  const [selectedStatus, setSelectedStatus] = useState({ value: "All", label: "All" });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");
  const [cabData, setCabData] = useState([]);

  const cabCollection = useMemo(() => collection(db, "taxis"), []);

  useEffect(() => {
    const cabQuery = query(cabCollection, orderBy("carModel", "asc"));
    const unsubscribe = onSnapshot(
      cabQuery,
      (snapshot) => {
        const records = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};

          const districtFlags = {
            Dimapur: Boolean(data.isDimapur),
            Kiphire: Boolean(data.isKiphire),
            Kohima: Boolean(data.isKohima),
            Longleng: Boolean(data.isLongleng),
            Meluri: Boolean(data.isMeluri),
            Mokokchung: Boolean(data.isMokokchung),
            Mon: Boolean(data.isMon),
            Niuland: Boolean(data.isNiuland),
            Noklak: Boolean(data.isNoklak),
            Peren: Boolean(data.isPeren),
            Phek: Boolean(data.isPhek),
            Shamator: Boolean(data.isShamator),
            Tseminyü: Boolean(data.isTseminyu),
            Tuensang: Boolean(data.isTuensang),
            Wokha: Boolean(data.isWokha),
            Zünheboto: Boolean(data.isZunheboto)
          };

          const districtsServing = Object.entries(districtFlags)
            .filter(([, value]) => value)
            .map(([label]) => label);

          return {
            docId: docSnap.id,
            id: typeof data.id === "number" ? data.id : Date.now(),
            carModel: data.carModel || "—",
            address: data.address || "—",
            driverName: data.driver || "—",
            phoneNumber: data.phoneNumber || "",
            seaterType: data.seater || "—",
            // Driving license image stored in `document` field
            drivingLicense: data.document || "",
            districtsServing,
            isActive: Boolean(data.isActive)
          };
        });
        setCabData(records);
      },
      (error) => {
        console.error("Error fetching taxis:", error);
      }
    );

    return () => unsubscribe();
  }, [cabCollection]);

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

  // Filter cabs based on search term, seater type, district and status
  const filteredCabs = cabData.filter(cab => {
    const matchesSearch = 
      cab.carModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cab.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cab.phoneNumber.includes(searchTerm);
    
    const matchesSeaterType = selectedSeaterType.value === "All" || 
      cab.seaterType === selectedSeaterType.value;
    
    const matchesDistrict = selectedDistrict.value === "All" || 
      cab.districtsServing.includes(
        selectedDistrict.value === "Chumoukedima/Dimapur" ? "Dimapur" : selectedDistrict.value
      );

    const matchesStatus = selectedStatus.value === "All"
      ? true
      : selectedStatus.value === "Active"
        ? cab.isActive
        : !cab.isActive;
    
    return matchesSearch && matchesSeaterType && matchesDistrict && matchesStatus;
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

  // Handle photo modal
  const handlePhotoClick = (photoUrl) => {
    setModalPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  const handleStatusToggle = async (cab) => {
    try {
      const docRef = doc(db, "taxis", cab.docId);
      await updateDoc(docRef, { isActive: !cab.isActive });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Unable to update cab status. Please try again.");
    }
  };

  const renderStatusButton = (cab) => {
    return (
      <button
        className={`cab-status-toggle ${cab.isActive ? "active" : "inactive"}`}
        onClick={() => handleStatusToggle(cab)}
      >
        {cab.isActive ? "Active" : "Inactive"}
      </button>
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

            <div className="cab-dropdown-group">
              <span className="cab-label-text">Status:</span>
              <div className="cab-select-container">
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCabs.map((cab, index) => (
                <tr key={cab.docId || cab.id}>
                  <td className="cab-sl-no-cell">{index + 1}</td>
                  <td>{cab.carModel}</td>
                  <td>{cab.address}</td>
                  <td>{cab.driverName}</td>
                  <td>+91-{cab.phoneNumber}</td>
                  <td>{cab.seaterType}</td>
                  <td>
                    {cab.drivingLicense ? (
                      <div
                        className="cab-photo-container"
                        onClick={() => handlePhotoClick(cab.drivingLicense)}
                      >
                        <img
                          src={cab.drivingLicense}
                          alt="Driving License"
                          className="cab-photo"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            if (e.target.parentNode) {
                              e.target.parentNode.innerHTML =
                                '<div class="cab-photo-placeholder">No Image</div>';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <span className="cab-muted-text">No document</span>
                    )}
                  </td>
                  <td>{renderDistricts(cab.districtsServing)}</td>
                  <td className="cab-status-cell">{renderStatusButton(cab)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="cab-photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div className="cab-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="cab-photo-modal-close" onClick={() => setShowPhotoModal(false)}>
              &times;
            </span>
            <img
              src={modalPhoto}
              alt="Driving License"
              className="cab-modal-photo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image Available%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CabsTaxi;
