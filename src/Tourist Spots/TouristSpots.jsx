"use client";

import { useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import Select from "react-select";
import "./TouristSpots.css";

const TouristSpots = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState({ value: "All", label: "All" });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    spotName: "",
    description: "",
    visitingHours: {
      openTime: "09:00",
      openPeriod: "AM",
      closeTime: "06:00",
      closePeriod: "PM"
    },
    closedDays: [],
    district: "",
    googleMapsLink: "",
    spotImage: null,
    spotImagePreview: ""
  });

  // District options
  const districtOptions = [
    { value: "All", label: "All" },
    { value: "Chumoukedima", label: "Chumoukedima" },
    { value: "Dimapur", label: "Dimapur" },
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

  // Form district options (without "All")
  const formDistrictOptions = districtOptions.filter(option => option.value !== "All");

  // Time options
  const timeOptions = [
    { value: "12:00", label: "12:00" },
    { value: "01:00", label: "1:00" },
    { value: "02:00", label: "2:00" },
    { value: "03:00", label: "3:00" },
    { value: "04:00", label: "4:00" },
    { value: "05:00", label: "5:00" },
    { value: "06:00", label: "6:00" },
    { value: "07:00", label: "7:00" },
    { value: "08:00", label: "8:00" },
    { value: "09:00", label: "9:00" },
    { value: "10:00", label: "10:00" },
    { value: "11:00", label: "11:00" }
  ];

  // Period options
  const periodOptions = [
    { value: "AM", label: "AM" },
    { value: "PM", label: "PM" }
  ];

  // Days of the week for closed days selection
  const daysOfWeek = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" }
  ];

  // Dummy tourist spots data
  const [spotsData, setSpotsData] = useState([
    {
      id: 1,
      spotName: "Dzükou Valley",
      description: "Famous for its seasonal flowers and lush green hills, Dzükou Valley is a paradise for trekkers and nature lovers. The valley is known for its vibrant biodiversity and the rare Dzükou lily that blooms in summer.",
      visitingHours: "6:00 AM to 4:00 PM",
      closedDays: [],
      district: "Kohima",
      googleMapsLink: "https://maps.google.com/?q=Dzükou+Valley",
      spotImage: "https://via.placeholder.com/800x400/24B295/ffffff?text=Dzükou+Valley"
    },
    {
      id: 2,
      spotName: "Naga Heritage Village",
      description: "A living museum that showcases the rich cultural heritage of the 16 major Naga tribes. The village features traditional morung houses, artifacts, and hosts the famous Hornbill Festival.",
      visitingHours: "9:00 AM to 5:00 PM",
      closedDays: ["Monday"],
      district: "Kohima",
      googleMapsLink: "https://maps.google.com/?q=Naga+Heritage+Village+Kisama",
      spotImage: "https://via.placeholder.com/800x400/24B295/ffffff?text=Naga+Heritage+Village"
    },
    {
      id: 3,
      spotName: "Triple Falls",
      description: "A spectacular three-tiered waterfall surrounded by lush forests. It's a popular picnic spot and offers breathtaking views especially during the monsoon season.",
      visitingHours: "8:00 AM to 6:00 PM",
      closedDays: [],
      district: "Dimapur",
      googleMapsLink: "https://maps.google.com/?q=Triple+Falls+Seithekima",
      spotImage: "https://via.placeholder.com/800x400/24B295/ffffff?text=Triple+Falls"
    },
    {
      id: 4,
      spotName: "Shilloi Lake",
      description: "A natural high-altitude lake surrounded by rhododendron forests. The lake is heart-shaped and is considered sacred by the local Pochury tribe.",
      visitingHours: "7:00 AM to 5:00 PM",
      closedDays: [],
      district: "Phek",
      googleMapsLink: "https://maps.google.com/?q=Shilloi+Lake+Phek",
      spotImage: "https://via.placeholder.com/800x400/24B295/ffffff?text=Shilloi+Lake"
    },
    {
      id: 5,
      spotName: "Intangki National Park",
      description: "The only national park in Nagaland, home to diverse flora and fauna including elephants, tigers, hoolock gibbons, and numerous bird species.",
      visitingHours: "8:00 AM to 4:00 PM",
      closedDays: ["Tuesday"],
      district: "Peren",
      googleMapsLink: "https://maps.google.com/?q=Intangki+National+Park",
      spotImage: "https://via.placeholder.com/800x400/24B295/ffffff?text=Intangki+National+Park"
    }
  ]);

  const navigate = useNavigate();
  const isAddRoute = Boolean(useMatch("/festival/touristspots/add"));

  // Handle image upload and compression
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only JPG, JPEG or PNG files.');
      return;
    }

    try {
      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 800px width/height while maintaining aspect ratio)
          let width = img.width;
          let height = img.height;
          const maxSize = 800;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          // Resize image
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with reduced quality
          canvas.toBlob((blob) => {
            // Create a preview URL
            const previewUrl = URL.createObjectURL(blob);

      setFormData(prev => ({
        ...prev,
              spotImage: blob,
              spotImagePreview: previewUrl
      }));
          }, file.type, 0.7); // 0.7 quality (70%)
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  // Handle closed days selection
  const handleClosedDaysChange = (day) => {
    setFormData(prev => {
      if (prev.closedDays.includes(day)) {
        return { ...prev, closedDays: prev.closedDays.filter(d => d !== day) };
      } else {
        return { ...prev, closedDays: [...prev.closedDays, day] };
      }
    });
  };

  // Handle time change
  const handleTimeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      visitingHours: {
        ...prev.visitingHours,
        [field]: value
      }
    }));
  };

  // Filter spots based on search term and selected district
  const filteredSpots = spotsData.filter(spot => {
    const matchesSearch = spot.spotName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict.value === "All" || spot.district === selectedDistrict.value;
    return matchesSearch && matchesDistrict;
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.spotName.trim()) {
      alert("Please enter tourist spot name");
      return;
    }
    if (!formData.description.trim()) {
      alert("Please enter description");
      return;
    }
    if (formData.description.split(/\s+/).length > 100) {
      alert("Description should not exceed 100 words");
      return;
    }
    if (!formData.district) {
      alert("Please select a district");
      return;
    }
    if (!formData.googleMapsLink.trim()) {
      alert("Please enter Google Maps link");
      return;
    }
    if (!formData.spotImage) {
      alert("Please upload a spot image");
      return;
    }

    // Format visiting hours
    const visitingHours = `${formData.visitingHours.openTime} ${formData.visitingHours.openPeriod} to ${formData.visitingHours.closeTime} ${formData.visitingHours.closePeriod}`;

    // Add new tourist spot
    const newSpot = {
        id: Date.now(),
      spotName: formData.spotName,
      description: formData.description,
      visitingHours: visitingHours,
      closedDays: formData.closedDays,
      district: formData.district,
      googleMapsLink: formData.googleMapsLink,
      spotImage: formData.spotImagePreview
    };
    setSpotsData(prev => [...prev, newSpot]);
    alert("Tourist spot added successfully!");

    // Reset form
    resetForm();
    navigate("/festival/touristspots");
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      spotName: "",
      description: "",
      visitingHours: {
        openTime: "09:00",
        openPeriod: "AM",
        closeTime: "06:00",
        closePeriod: "PM"
      },
      closedDays: [],
      district: "",
      googleMapsLink: "",
      spotImage: null,
      spotImagePreview: ""
    });
  };

  // Format closed days for display
  const formatClosedDays = (closedDays) => {
    if (!closedDays || closedDays.length === 0) {
      return "-";
    }
    return closedDays.join(", ");
  };

  // Handle photo modal
  const handlePhotoClick = (photoUrl) => {
    setModalPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  // Custom select styles to match theme
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      border: '1px solid var(--spots-border-color)',
      borderRadius: '6px',
      fontSize: '14px',
      '&:hover': {
        borderColor: 'var(--spots-primary-color)'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'var(--spots-primary-color)' : 'white',
      color: state.isSelected ? 'white' : '#333',
      '&:hover': {
        backgroundColor: state.isSelected ? 'var(--spots-primary-color)' : 'var(--spots-primary-light)'
      }
    })
  };

  // Custom styles for district select
  const districtSelectStyles = {
    ...customSelectStyles,
    control: (provided) => ({
      ...provided,
      minWidth: '200px',
      border: '1px solid var(--spots-border-color)',
      borderRadius: '6px',
      fontSize: '14px',
      '&:hover': {
        borderColor: 'var(--spots-primary-color)'
      }
    })
  };

  return (
    <div className="spots-container">
      <header>
        <div className="spots-logo-text">Tourist Spots</div>
      </header>

      {/* Add Tourist Spot Button - Outside Card */}
      {!isAddRoute && (
        <div className="spots-add-button-container">
          <button
            className="spots-add-button"
            onClick={() => {
              resetForm();
              navigate("/festival/touristspots/add");
            }}
          >
            Add Tourist Spot
          </button>
        </div>
      )}

      <div className="spots-data-container">
        {!isAddRoute ? (
          <>
            {/* Search and Filter */}
            <div className="spots-control-panel-filters">
              <div className="spots-search-container">
                <div className="spots-search-input-wrapper">
                  <svg className="spots-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    className="spots-search-input"
                    placeholder="Search by Tourist Spot Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="spots-dropdown-group">
                <span className="spots-label-text">District:</span>
                <div className="spots-select-container">
                  <Select
                    value={selectedDistrict}
                    onChange={(option) => setSelectedDistrict(option)}
                    options={districtOptions}
                    styles={districtSelectStyles}
                    isSearchable
                    placeholder="Select District"
                  />
                </div>
              </div>
            </div>

            {/* Tourist Spots Table */}
            <div className="spots-table-container">
              <table className="spots-table">
                <thead>
                  <tr>
                    <th className="spots-sl-no-header">Sl No.</th>
                    <th>Spot Image</th>
                    <th>Tourist Spot</th>
                    <th>Description</th>
                    <th>Visiting Hours</th>
                    <th>Closed Day</th>
                    <th>District</th>
                    <th>Google Maps Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSpots.map((spot, index) => (
                    <tr key={spot.id}>
                      <td className="spots-sl-no-cell">{index + 1}</td>
                      <td>
                        <div 
                          className="spots-photo-container"
                          onClick={() => handlePhotoClick(spot.spotImage)}
                        >
                          {spot.spotImage ? (
                            <img 
                              src={spot.spotImage} 
                              alt={spot.spotName} 
                              className="spots-photo"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.parentNode.innerHTML = `<div class="spots-photo-placeholder">No Image</div>`;
                              }}
                            />
                          ) : (
                            <div className="spots-photo-placeholder">No Image</div>
                          )}
                        </div>
                      </td>
                      <td>{spot.spotName}</td>
                      <td className="spots-description-cell">{spot.description}</td>
                      <td>{spot.visitingHours}</td>
                      <td>{formatClosedDays(spot.closedDays)}</td>
                      <td>{spot.district}</td>
                      <td>
                        <a 
                          href={spot.googleMapsLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="spots-maps-link"
                        >
                          View on Maps
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Tourist Spot Form */
          <div className="spots-form-container">
            <div className="spots-form-header">
              <h3>Add New Tourist Spot</h3>
              <button
                className="spots-back-button"
                onClick={() => {
                  resetForm();
                  navigate("/festival/touristspots");
                }}
              >
                Back
              </button>
            </div>

            <form className="spots-form" onSubmit={handleSubmit}>
              <div className="spots-form-row">
                <div className="spots-form-group">
                  <label className="spots-form-label" htmlFor="district">District:</label>
                  <Select
                    id="district"
                    className="spots-form-select"
                    options={formDistrictOptions}
                    styles={districtSelectStyles}
                    isSearchable
                    placeholder="Select District"
                    onChange={(option) => setFormData(prev => ({ ...prev, district: option.value }))}
                  />
                </div>

                <div className="spots-form-group">
                  <label className="spots-form-label" htmlFor="spotName">Tourist Spot Name:</label>
                  <input
                    id="spotName"
                    type="text"
                    className="spots-form-text-input"
                    value={formData.spotName}
                    onChange={(e) => setFormData(prev => ({ ...prev, spotName: e.target.value }))}
                    placeholder="Enter tourist spot name"
                  />
                </div>
              </div>

              <div className="spots-form-row">
                <div className="spots-form-group spots-form-group-full-width">
                  <label className="spots-form-label" htmlFor="description">
                    Description: <span className="spots-word-count">
                      ({formData.description.split(/\s+/).filter(Boolean).length}/100 words)
                    </span>
                  </label>
                  <textarea
                    id="description"
                    className="spots-form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description (max 100 words)"
                    rows={4}
                  />
                </div>
              </div>

              <div className="spots-form-row">
                <div className="spots-form-group">
                  <label className="spots-form-label" htmlFor="visitingHours">Visiting Hours:</label>
                  <div className="spots-time-picker">
                    <div className="spots-time-row">
                      <div className="spots-time-container">
                        <Select
                          options={timeOptions}
                          styles={customSelectStyles}
                          value={timeOptions.find(option => option.value === formData.visitingHours.openTime)}
                          onChange={(option) => handleTimeChange('openTime', option.value)}
                          isSearchable={false}
                          className="spots-time-input"
                        />
                      </div>
                      <div className="spots-time-container">
                        <Select
                          options={periodOptions}
                          styles={customSelectStyles}
                          value={periodOptions.find(option => option.value === formData.visitingHours.openPeriod)}
                          onChange={(option) => handleTimeChange('openPeriod', option.value)}
                          isSearchable={false}
                          className="spots-period-input"
                        />
                      </div>
                    </div>
                    <span className="spots-time-separator">to</span>
                    <div className="spots-time-row">
                      <div className="spots-time-container">
                        <Select
                          options={timeOptions}
                          styles={customSelectStyles}
                          value={timeOptions.find(option => option.value === formData.visitingHours.closeTime)}
                          onChange={(option) => handleTimeChange('closeTime', option.value)}
                          isSearchable={false}
                          className="spots-time-input"
                        />
                      </div>
                      <div className="spots-time-container">
                        <Select
                          options={periodOptions}
                          styles={customSelectStyles}
                          value={periodOptions.find(option => option.value === formData.visitingHours.closePeriod)}
                          onChange={(option) => handleTimeChange('closePeriod', option.value)}
                          isSearchable={false}
                          className="spots-period-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="spots-form-group">
                  <label className="spots-form-label">Closed Days (Optional):</label>
                  <div className="spots-checkbox-group">
                    {daysOfWeek.map(day => (
                      <div key={day.value} className="spots-checkbox-item">
                  <input
                          type="checkbox"
                          id={`day-${day.value}`}
                          checked={formData.closedDays.includes(day.value)}
                          onChange={() => handleClosedDaysChange(day.value)}
                          className="spots-checkbox"
                        />
                        <label htmlFor={`day-${day.value}`} className="spots-checkbox-label">
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="spots-form-row">
                <div className="spots-form-group">
                  <label className="spots-form-label" htmlFor="spotImage">Spot Image:</label>
                  <div className="spots-file-upload-container">
                    <input
                      id="spotImage"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImageUpload}
                      className="spots-file-input"
                    />
                    {formData.spotImagePreview && (
                      <div className="spots-image-preview">
                        <img 
                          src={formData.spotImagePreview} 
                          alt="Preview" 
                          className="spots-preview-img"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="spots-form-group">
                  <label className="spots-form-label" htmlFor="googleMapsLink">Google Maps Link:</label>
                  <input
                    id="googleMapsLink"
                    type="text"
                    className="spots-form-text-input"
                    value={formData.googleMapsLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, googleMapsLink: e.target.value }))}
                    placeholder="Enter Google Maps link"
                  />
                </div>
              </div>

              <div className="spots-form-row spots-form-submit-row">
                <button type="submit" className="spots-form-submit-button">
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="spots-photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div className="spots-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="spots-photo-modal-close" onClick={() => setShowPhotoModal(false)}>&times;</span>
            <img src={modalPhoto} alt="Tourist Spot" className="spots-modal-photo" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristSpots;
