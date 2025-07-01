"use client";

import { useState } from "react";
import Select from "react-select";
import "./RestaurantCafe.css";

const RestaurantCafe = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisineType, setSelectedCuisineType] = useState({ value: "All", label: "All" });
  const [selectedDistrict, setSelectedDistrict] = useState({ value: "All", label: "All" });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [modalMenuImages, setModalMenuImages] = useState([]);

  // Dummy restaurant data
  const restaurantData = [
    {
      id: 1,
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Restaurant+Banner+1",
      name: "Naga Kitchen",
      address: "123 Main Road, City Center",
      phoneNumber: "9876543210",
      district: "Kohima",
      googleMapsLink: "https://maps.google.com/?q=Kohima",
      menuImages: [
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+1",
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+2"
      ],
      cuisines: ["Naga Cuisines", "North Indian"]
    },
    {
      id: 2,
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Restaurant+Banner+2",
      name: "Spice Garden",
      address: "456 Hill View, Market Area",
      phoneNumber: "8765432109",
      district: "Dimapur",
      googleMapsLink: "https://maps.google.com/?q=Dimapur",
      menuImages: [
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+3"
      ],
      cuisines: ["Vegetarian Only", "South Indian"]
    },
    {
      id: 3,
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Restaurant+Banner+3",
      name: "Fast Bite Corner",
      address: "789 East Road, Commercial Complex",
      phoneNumber: "7654321098",
      district: "Mokokchung",
      googleMapsLink: "https://maps.google.com/?q=Mokokchung",
      menuImages: [
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+4",
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+5",
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+6"
      ],
      cuisines: ["Fast Food", "Continental"]
    },
    {
      id: 4,
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Restaurant+Banner+4",
      name: "Mountain View Cafe",
      address: "101 Ridge Road, Hilltop",
      phoneNumber: "6543210987",
      district: "Wokha",
      googleMapsLink: "https://maps.google.com/?q=Wokha",
      menuImages: [
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+7"
      ],
      cuisines: ["Continental", "Chinese/Korean Cuisines"]
    },
    {
      id: 5,
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Restaurant+Banner+5",
      name: "Valley Delights",
      address: "202 Valley Road, Green Valley",
      phoneNumber: "5432109876",
      district: "Phek",
      googleMapsLink: "https://maps.google.com/?q=Phek",
      menuImages: [
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+8",
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+9"
      ],
      cuisines: ["North Indian", "Naga Cuisines", "Vegetarian Only"]
    },
    {
      id: 6,
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Restaurant+Banner+6",
      name: "Pine Tree Cafe",
      address: "303 Forest Lane, Pine Forest",
      phoneNumber: "4321098765",
      district: "Tuensang",
      googleMapsLink: "https://maps.google.com/?q=Tuensang",
      menuImages: [
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+10"
      ],
      cuisines: ["Chinese/Korean Cuisines", "Fast Food"]
    },
    {
      id: 7,
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Restaurant+Banner+7",
      name: "Riverside Restaurant",
      address: "404 River Road, River Bank",
      phoneNumber: "3210987654",
      district: "Mon",
      googleMapsLink: "https://maps.google.com/?q=Mon",
      menuImages: [
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+11",
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+12"
      ],
      cuisines: ["Naga Cuisines", "North Indian", "Continental"]
    },
    {
      id: 8,
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Restaurant+Banner+8",
      name: "Highland Eatery",
      address: "505 Mountain Pass, Mountain Top",
      phoneNumber: "2109876543",
      district: "Zunheboto",
      googleMapsLink: "https://maps.google.com/?q=Zunheboto",
      menuImages: [
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+13"
      ],
      cuisines: ["Vegetarian Only", "South Indian"]
    },
    {
      id: 9,
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Restaurant+Banner+9",
      name: "Sunset Diner",
      address: "606 West Road, Sunset Hills",
      phoneNumber: "1098765432",
      district: "Kiphire",
      googleMapsLink: "https://maps.google.com/?q=Kiphire",
      menuImages: [
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+14",
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+15"
      ],
      cuisines: ["Fast Food", "Chinese/Korean Cuisines"]
    },
    {
      id: 10,
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Restaurant+Banner+10",
      name: "Forest Edge Bistro",
      address: "707 Forest Edge, Forest View",
      phoneNumber: "9087654321",
      district: "Peren",
      googleMapsLink: "https://maps.google.com/?q=Peren",
      menuImages: [
        "https://via.placeholder.com/600x400/24B295/ffffff?text=Menu+16"
      ],
      cuisines: ["Continental", "North Indian"]
    }
  ];

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

    return matchesSearch && matchesCuisineType && matchesDistrict;
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
              </tr>
            </thead>
            <tbody>
              {filteredRestaurants.map((restaurant, index) => (
                <tr key={restaurant.id}>
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
            <img src={modalPhoto} alt="Restaurant" className="restaurant-modal-photo" />
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
                <img key={index} src={menuImage} alt={`Menu ${index + 1}`} className="restaurant-modal-menu-image" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantCafe;