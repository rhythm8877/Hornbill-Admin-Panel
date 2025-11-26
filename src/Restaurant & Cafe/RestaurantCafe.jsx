"use client";

import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import "./RestaurantCafe.css";
import { db } from "../firebaseConfig";

const RestaurantCafe = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisineType, setSelectedCuisineType] = useState({ value: "All", label: "All" });
  const [selectedDistrict, setSelectedDistrict] = useState({ value: "All", label: "All" });
  const [selectedStatus, setSelectedStatus] = useState({ value: "All", label: "All" });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [modalMenuImages, setModalMenuImages] = useState([]);
  const [restaurantData, setRestaurantData] = useState([]);

  const cafeCollection = useMemo(() => collection(db, "cafes"), []);

  useEffect(() => {
    const cafeQuery = query(cafeCollection, orderBy("cafeName", "asc"));
    const unsubscribe = onSnapshot(
      cafeQuery,
      (snapshot) => {
        const records = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};

          // Derive cuisines from boolean flags
          const cuisines = [
            data.isNagaDishes && "Naga Cuisines",
            data.isVegetarian && "Vegetarian Only",
            data.isFastFood && "Fast Food",
            data.isNorthIndian && "North Indian",
            data.isSouthIndian && "South Indian",
            data.isChinese && "Chinese/Korean Cuisines",
            data.isContinental && "Continental"
          ].filter(Boolean);

          return {
            docId: docSnap.id,
            id: typeof data.id === "number" ? data.id : Date.now(),
            bannerPhoto: data.photo || "",
            name: data.cafeName || "—",
            address: data.address || "—",
            phoneNumber: data.phoneNumber || "",
            district: data.district || "—",
            googleMapsLink: data.gmaps || "",
            menuImages: Array.isArray(data.menu) ? data.menu : [],
            cuisines,
            isActive: Boolean(data.isActive)
          };
        });
        setRestaurantData(records);
      },
      (error) => {
        console.error("Error fetching cafes:", error);
      }
    );

    return () => unsubscribe();
  }, [cafeCollection]);

  // Cuisine type options
  const cuisineTypeOptions = [
    { value: "All", label: "All" },
    { value: "Naga Cuisines", label: "Naga Cuisines" },
    { value: "Vegetarian Only", label: "Vegetarian Only" },
    { value: "Fast Food", label: "Fast Food" },
    { value: "North Indian", label: "North Indian" },
    { value: "South Indian", label: "South Indian" },
    { value: "Chinese/Korean Cuisines", label: "Chinese/Korean Cuisines" },
    { value: "Continental", label: "Continental" }
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

  // Filter restaurants based on search term, cuisine type and district
  const filteredRestaurants = restaurantData.filter(restaurant => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.phoneNumber.includes(searchTerm);

    const matchesCuisineType = selectedCuisineType.value === "All" ||
      restaurant.cuisines.includes(selectedCuisineType.value);

    const matchesDistrict = selectedDistrict.value === "All" ||
      restaurant.district === selectedDistrict.value;

    const matchesStatus = selectedStatus.value === "All"
      ? true
      : selectedStatus.value === "Active"
        ? restaurant.isActive
        : !restaurant.isActive;

    return matchesSearch && matchesCuisineType && matchesDistrict && matchesStatus;
  });

  // Handle photo modal
  const handlePhotoClick = (photoUrl) => {
    setModalPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  // Handle menu images modal
  const handleMenuClick = (menuImages) => {
    setModalMenuImages(menuImages);
    setShowMenuModal(true);
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

  // Render cuisines with tags
  const renderCuisines = (cuisines) => {
    return (
      <div className="restaurant-cuisines">
        {cuisines.map((cuisine, index) => (
          <span key={index} className="restaurant-cuisine-tag">
            {cuisine}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="restaurant-container">
      <header>
        <div className="restaurant-logo-text">Restaurants & Cafes</div>
      </header>

      <div className="restaurant-data-container">
        {/* Search and Filters */}
        <div className="restaurant-control-panel-filters">
          {/* Search Bar */}
          <div className="restaurant-search-container">
            <div className="restaurant-search-input-wrapper">
              <svg className="restaurant-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="restaurant-search-input"
                placeholder="Search by Restaurant/Cafe Name or Phone Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="restaurant-dropdown-container">
            <div className="restaurant-dropdown-group">
              <span className="restaurant-label-text">Cuisines/Dishes:</span>
              <div className="restaurant-select-container">
                <Select
                  value={selectedCuisineType}
                  onChange={(option) => setSelectedCuisineType(option)}
                  options={cuisineTypeOptions}
                  styles={customSelectStyles}
                  isSearchable
                  placeholder="Select Cuisine Type"
                />
              </div>
            </div>

            <div className="restaurant-dropdown-group">
              <span className="restaurant-label-text">District:</span>
              <div className="restaurant-select-container">
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

            <div className="restaurant-dropdown-group">
              <span className="restaurant-label-text">Status:</span>
              <div className="restaurant-select-container">
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

        {/* Restaurants Table */}
        <div className="restaurant-table-container">
          <table className="restaurant-table">
            <thead>
              <tr>
                <th className="restaurant-sl-no-header">Sl No.</th>
                <th>Banner/Cover Photo</th>
                <th>Restaurant/Cafe Name</th>
                <th>Address</th>
                <th>Phone Number</th>
                <th>District</th>
                <th>Google Maps Link</th>
                <th>Menu Images</th>
                <th>Cuisines/Dishes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRestaurants.map((restaurant, index) => (
                <tr key={restaurant.docId || restaurant.id}>
                  <td className="restaurant-sl-no-cell">{index + 1}</td>
                  <td>
                    <div
                      className="restaurant-photo-container"
                      onClick={() => handlePhotoClick(restaurant.bannerPhoto)}
                    >
                      <img
                        src={restaurant.bannerPhoto}
                        alt={restaurant.name}
                        className="restaurant-photo"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          if (e.target.parentNode) {
                            e.target.parentNode.innerHTML = '<div class="restaurant-photo-placeholder">No Image</div>';
                          }
                        }}
                      />
                    </div>
                  </td>
                  <td>{restaurant.name}</td>
                  <td>{restaurant.address}</td>
                  <td>+91-{restaurant.phoneNumber}</td>
                  <td>{restaurant.district}</td>
                  <td>
                    <a
                      href={restaurant.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="restaurant-map-link"
                    >
                      View on Map
                    </a>
                  </td>
                  <td>
                    <div
                      className="restaurant-menu-container"
                      onClick={() => handleMenuClick(restaurant.menuImages)}
                    >
                      <span className="restaurant-menu-count">
                        {restaurant.menuImages.length} Menu{restaurant.menuImages.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td>{renderCuisines(restaurant.cuisines)}</td>
                  <td className="restaurant-status-cell">
                    <button
                      className={`restaurant-status-toggle ${restaurant.isActive ? "active" : "inactive"}`}
                      onClick={async () => {
                        try {
                          const docRef = doc(db, "cafes", restaurant.docId);
                          await updateDoc(docRef, { isActive: !restaurant.isActive });
                        } catch (error) {
                          console.error("Error updating cafe status:", error);
                          alert("Unable to update status. Please try again.");
                        }
                      }}
                    >
                      {restaurant.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="restaurant-photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div className="restaurant-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="restaurant-photo-modal-close" onClick={() => setShowPhotoModal(false)}>&times;</span>
            <img 
              src={modalPhoto} 
              alt="Restaurant" 
              className="restaurant-modal-photo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image Available%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      )}

      {/* Menu Images Modal */}
      {showMenuModal && (
        <div className="restaurant-menu-modal" onClick={() => setShowMenuModal(false)}>
          <div className="restaurant-menu-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="restaurant-menu-modal-close" onClick={() => setShowMenuModal(false)}>&times;</span>
            <div className="restaurant-menu-images-grid">
              {modalMenuImages.map((menuImage, index) => (
                <img 
                  key={index} 
                  src={menuImage} 
                  alt={`Menu ${index + 1}`} 
                  className="restaurant-modal-menu-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect width="200" height="150" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantCafe;