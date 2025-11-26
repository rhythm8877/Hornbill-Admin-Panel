"use client";

import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import "./TourGuides.css";
import { db } from "../firebaseConfig";

const TourGuides = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState({ value: "All", label: "All" });
  const [selectedStatus, setSelectedStatus] = useState({ value: "All", label: "All" });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");
  const [tourGuideData, setTourGuideData] = useState([]);

  const guideCollection = useMemo(() => collection(db, "tour_guides"), []);

  useEffect(() => {
    const guideQuery = query(guideCollection, orderBy("fullName", "asc"));
    const unsubscribe = onSnapshot(
      guideQuery,
      (snapshot) => {
        const records = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          return {
            docId: docSnap.id,
            name: data.fullName || "—",
            address: data.address || "—",
            district: data.district || "—",
            phoneNumber: data.phoneNumber || "",
            ntaIdCard: data.document || "",
            isActive: Boolean(data.isActive)
          };
        });
        setTourGuideData(records);
      },
      (error) => {
        console.error("Error fetching tour guides:", error);
      }
    );

    return () => unsubscribe();
  }, [guideCollection]);

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

  // Filter tour guides based on search term, district and status
  const filteredTourGuides = tourGuideData.filter(guide => {
    const matchesSearch = 
      guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.phoneNumber.includes(searchTerm);
    
    const matchesDistrict = selectedDistrict.value === "All" || 
      guide.district === (selectedDistrict.value === "Chumoukedima/Dimapur" ? "Dimapur" : selectedDistrict.value);

    const matchesStatus = selectedStatus.value === "All"
      ? true
      : selectedStatus.value === "Active"
        ? guide.isActive
        : !guide.isActive;
    
    return matchesSearch && matchesDistrict && matchesStatus;
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

  const handlePhotoClick = (photoUrl) => {
    setModalPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  const handleStatusToggle = async (guide) => {
    try {
      const docRef = doc(db, "tour_guides", guide.docId);
      await updateDoc(docRef, { isActive: !guide.isActive });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Unable to update status. Please try again.");
    }
  };

  const renderStatusButton = (guide) => {
    return (
      <button
        className={`guide-status-toggle ${guide.isActive ? "active" : "inactive"}`}
        onClick={() => handleStatusToggle(guide)}
      >
        {guide.isActive ? "Active" : "Inactive"}
      </button>
    );
  };

  return (
    <div className="guide-container">
      <header>
        <div className="guide-logo-text">Tour Guides</div>
      </header>

      <div className="guide-data-container">
        {/* Search and Filters */}
        <div className="guide-control-panel-filters">
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

          {/* Dropdown Filters */}
          <div className="guide-dropdown-container">
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

            <div className="guide-dropdown-group">
              <span className="guide-label-text">Status:</span>
              <div className="guide-select-container">
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTourGuides.map((guide, index) => (
                <tr key={guide.docId || guide.id}>
                  <td className="guide-sl-no-cell">{index + 1}</td>
                  <td>{guide.name}</td>
                  <td>{guide.address}</td>
                  <td>{guide.district}</td>
                  <td>+91-{guide.phoneNumber}</td>
                  <td>
                    {guide.ntaIdCard ? (
                      <div
                        className="guide-photo-container"
                        onClick={() => handlePhotoClick(guide.ntaIdCard)}
                      >
                        <img
                          src={guide.ntaIdCard}
                          alt="NTA ID Card"
                          className="guide-photo"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            if (e.target.parentNode) {
                              e.target.parentNode.innerHTML =
                                '<div class="guide-photo-placeholder">No Image</div>';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <span className="guide-muted-text">No document</span>
                    )}
                  </td>
                  <td className="guide-status-cell">{renderStatusButton(guide)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="guide-photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div className="guide-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="guide-photo-modal-close" onClick={() => setShowPhotoModal(false)}>
              &times;
            </span>
            <img
              src={modalPhoto}
              alt="NTA ID Card"
              className="guide-modal-photo"
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

export default TourGuides;
