"use client";

import { useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import "./TribalFestival.css";

const TribalFestival = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFestival, setEditingFestival] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    tribe: "",
    festivalName: "",
    description: "",
    bannerPhoto: null,
    bannerPhotoPreview: ""
  });

  // Dummy festival data
  const [festivalData, setFestivalData] = useState([
    {
      id: 1,
      festivalName: "Sekrenyi Festival",
      tribe: "Angami",
      description: "Sekrenyi is a purification festival celebrated by the Angami tribe in February. It is a 10-day festival that symbolizes the purification of the individual and the community. The festival is marked by various rituals, traditional songs, dances, and the preparation of special foods. It serves as a time for the community to come together and strengthen their bonds.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Sekrenyi+Festival"
    },
    {
      id: 2,
      festivalName: "Moatsü Festival",
      tribe: "Ao",
      description: "Moatsü is the most significant festival of the Ao tribe, celebrated in May after the sowing season. The festival lasts for several days and involves various traditional activities including folk songs, dances, and community feasts. It marks the beginning of the agricultural year and is a time for the community to pray for a good harvest.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Moatsü+Festival"
    },
    {
      id: 3,
      festivalName: "Thuni Festival",
      tribe: "Chakhesang",
      description: "Thuni is a harvest festival celebrated by the Chakhesang tribe in July. The festival is characterized by traditional dances, folk songs, and the sharing of the first fruits of the harvest. It is a time of thanksgiving and celebration, where the community comes together to express gratitude for the bountiful harvest.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Thuni+Festival"
    },
    {
      id: 4,
      festivalName: "Naknyulüm Festival",
      tribe: "Chang",
      description: "Naknyulüm is the main festival of the Chang tribe, celebrated in July. The festival involves various traditional rituals, including the offering of prayers for prosperity and good health. The celebration includes traditional dances, songs, and the preparation of special delicacies. It is a time for the community to come together and celebrate their cultural heritage.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Naknyulüm+Festival"
    },
    {
      id: 5,
      festivalName: "Wangala Festival",
      tribe: "Garo",
      description: "Wangala is a harvest festival celebrated by the Garo tribe in November. Also known as the '100 Drums Festival', it is characterized by traditional drum beats, dances, and songs. The festival is dedicated to Misi-A-Gilpa-Saljong-Galapa, the sun god, and marks the end of the agricultural year. It is a time of thanksgiving and celebration.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Wangala+Festival"
    },
    {
      id: 6,
      festivalName: "Bishu Dima Festival",
      tribe: "Kachari",
      description: "Bishu Dima is the New Year festival of the Kachari tribe, celebrated in April. The festival marks the beginning of the new agricultural year and is characterized by traditional dances, songs, and rituals. The celebration includes the preparation of traditional foods and drinks, and the community comes together to welcome the new year with joy and enthusiasm.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Bishu+Dima+Festival"
    },
    {
      id: 7,
      festivalName: "Tsokum Festival",
      tribe: "Khiamniungan",
      description: "Tsokum is the main festival of the Khiamniungan tribe, celebrated in October. The festival is a time for the community to come together and celebrate their cultural heritage through traditional dances, songs, and rituals. It marks the end of the harvest season and is a time of thanksgiving and celebration.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Tsokum+Festival"
    },
    {
      id: 8,
      festivalName: "Aoleang Festival",
      tribe: "Konyak",
      description: "Aoleang is the most important festival of the Konyak tribe, celebrated in April. The festival marks the beginning of spring and the new agricultural cycle. The celebration includes traditional war dances, folk songs, and the display of traditional weapons and costumes. It is a time for the community to come together and celebrate their warrior heritage.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Aoleang+Festival"
    },
    {
      id: 9,
      festivalName: "Mim Kut & Chavang Kut",
      tribe: "Kuki",
      description: "Mim Kut and Chavang Kut are important festivals of the Kuki tribe. Mim Kut is celebrated to honor the departed souls, while Chavang Kut is a harvest festival. Both festivals involve traditional dances, songs, and the preparation of special foods. They are times for the community to come together and celebrate their cultural traditions.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Mim+Kut+Chavang+Kut"
    },
    {
      id: 10,
      festivalName: "Tokhü Emong Festival",
      tribe: "Lotha",
      description: "Tokhü Emong is the most significant festival of the Lotha tribe, celebrated in November. The festival marks the end of the harvest season and the beginning of the winter season. The celebration includes traditional dances, songs, and the sharing of the harvest with the community. It is a time of thanksgiving and celebration.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Tokhü+Emong+Festival"
    }
  ]);

  const navigate = useNavigate();
  const isAddRoute = Boolean(useMatch("/festival/tribalfestival/add"));

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
              bannerPhoto: blob,
              bannerPhotoPreview: previewUrl
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

  // Filter festivals based on search term
  const filteredFestivals = festivalData.filter(festival => {
    return festival.festivalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           festival.tribe.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.tribe.trim()) {
      alert("Please enter tribe name");
      return;
    }
    if (!formData.festivalName.trim()) {
      alert("Please enter festival name");
      return;
    }
    if (!formData.description.trim()) {
      alert("Please enter description");
      return;
    }
    if (formData.description.split(/\s+/).length > 200) {
      alert("Description should not exceed 200 words");
      return;
    }
    if (!formData.bannerPhoto) {
      alert("Please upload a banner photo");
      return;
    }

    if (editingFestival) {
      // Update existing festival
      setFestivalData(prev => prev.map(festival =>
        festival.id === editingFestival.id
          ? {
              ...festival,
              tribe: formData.tribe,
              festivalName: formData.festivalName,
              description: formData.description,
              bannerPhoto: formData.bannerPhotoPreview || festival.bannerPhoto
            }
          : festival
      ));
      alert("Festival updated successfully!");
      setEditingFestival(null);
    } else {
      // Add new festival
      const newFestival = {
        id: Date.now(),
        tribe: formData.tribe,
        festivalName: formData.festivalName,
        description: formData.description,
        bannerPhoto: formData.bannerPhotoPreview
      };
      setFestivalData(prev => [...prev, newFestival]);
      alert("Festival added successfully!");
    }

    // Reset form
    resetForm();
    navigate("/festival/tribalfestival");
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      tribe: "",
      festivalName: "",
      description: "",
      bannerPhoto: null,
      bannerPhotoPreview: ""
    });
    setEditingFestival(null);
  };

  // Handle inline edit
  const handleInlineEdit = (festival) => {
    setEditingRowId(festival.id);
    setEditingFestival({ ...festival });
  };

  // Handle save inline edit
  const handleSaveInlineEdit = () => {
    if (!editingFestival.tribe.trim()) {
      alert("Please enter tribe name");
      return;
    }
    if (!editingFestival.festivalName.trim()) {
      alert("Please enter festival name");
      return;
    }
    if (!editingFestival.description.trim()) {
      alert("Please enter description");
      return;
    }

    setFestivalData(prev => prev.map(festival =>
      festival.id === editingFestival.id ? editingFestival : festival
    ));
    setEditingRowId(null);
    setEditingFestival(null);
    alert("Festival updated successfully!");
  };

  // Handle cancel inline edit
  const handleCancelInlineEdit = () => {
    setEditingRowId(null);
    setEditingFestival(null);
  };

  // Handle inline field change
  const handleInlineFieldChange = (field, value) => {
    setEditingFestival(prev => ({ ...prev, [field]: value }));
  };

  // Handle delete festival
  const handleDelete = (festivalId) => {
    if (window.confirm("Are you sure you want to delete this festival?")) {
      setFestivalData(prev => prev.filter(festival => festival.id !== festivalId));
      alert("Festival deleted successfully!");
    }
  };

  // Handle photo modal
  const handlePhotoClick = (photoUrl) => {
    setModalPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  return (
    <div className="tribal-festival-container">
      <header>
        <div className="tribal-festival-logo-text">Tribal Festival</div>
      </header>

      {/* Add Festival Button - Outside Card */}
      {!isAddRoute && (
        <div className="tribal-festival-add-button-container">
          <button
            className="tribal-festival-add-button"
            onClick={() => {
              resetForm();
              navigate("/festival/tribalfestival/add");
            }}
          >
            Add Festival
          </button>
        </div>
      )}

      <div className="tribal-festival-data-container">
        {!isAddRoute ? (
          <>
            {/* Search */}
            <div className="tribal-festival-control-panel-filters">
              <div className="tribal-festival-search-container">
                <div className="tribal-festival-search-input-wrapper">
                  <svg className="tribal-festival-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    className="tribal-festival-search-input"
                    placeholder="Search by Festival Name or Tribe Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Festivals Table */}
            <div className="tribal-festival-table-container">
              <table className="tribal-festival-table">
                <thead>
                  <tr>
                    <th className="tribal-festival-sl-no-header">Sl No.</th>
                    <th>Banner/Cover Photo</th>
                    <th>Festival Name</th>
                    <th>Tribe</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFestivals.map((festival, index) => (
                    <tr key={festival.id}>
                      <td className="tribal-festival-sl-no-cell">{index + 1}</td>
                      <td>
                        <div 
                          className="tribal-festival-photo-container"
                          onClick={() => handlePhotoClick(festival.bannerPhoto)}
                        >
                          <img 
                            src={festival.bannerPhoto} 
                            alt={festival.festivalName} 
                            className="tribal-festival-photo"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.parentNode.innerHTML = `<div class="tribal-festival-photo-placeholder">No Image</div>`;
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        {editingRowId === festival.id ? (
                          <input
                            type="text"
                            className="tribal-festival-inline-input"
                            value={editingFestival.festivalName}
                            onChange={(e) => handleInlineFieldChange('festivalName', e.target.value)}
                          />
                        ) : (
                          festival.festivalName
                        )}
                      </td>
                      <td>
                        {editingRowId === festival.id ? (
                          <input
                            type="text"
                            className="tribal-festival-inline-input"
                            value={editingFestival.tribe}
                            onChange={(e) => handleInlineFieldChange('tribe', e.target.value)}
                          />
                        ) : (
                          festival.tribe
                        )}
                      </td>
                      <td className="tribal-festival-description-cell">
                        {editingRowId === festival.id ? (
                          <textarea
                            className="tribal-festival-inline-textarea"
                            value={editingFestival.description}
                            onChange={(e) => handleInlineFieldChange('description', e.target.value)}
                            rows={3}
                          />
                        ) : (
                          festival.description
                        )}
                      </td>
                      <td>
                        <div className="tribal-festival-action-buttons">
                          {editingRowId === festival.id ? (
                            <>
                              <button
                                className="tribal-festival-save-button"
                                onClick={handleSaveInlineEdit}
                                title="Save"
                              >
                                Save
                              </button>
                              <button
                                className="tribal-festival-cancel-button"
                                onClick={handleCancelInlineEdit}
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="tribal-festival-edit-button"
                                onClick={() => handleInlineEdit(festival)}
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button
                                className="tribal-festival-delete-button"
                                onClick={() => handleDelete(festival.id)}
                                title="Delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Festival Form */
          <div className="tribal-festival-form-container">
            <div className="tribal-festival-form-header">
              <h3>{editingFestival ? 'Edit Festival' : 'Add New Festival'}</h3>
              <button
                className="tribal-festival-back-button"
                onClick={() => {
                  resetForm();
                  navigate("/festival/tribalfestival");
                }}
              >
                Back
              </button>
            </div>

            <form className="tribal-festival-form" onSubmit={handleSubmit}>
              <div className="tribal-festival-form-row">
                <div className="tribal-festival-form-group">
                  <label className="tribal-festival-form-label" htmlFor="tribe">Tribe:</label>
                  <input
                    id="tribe"
                    type="text"
                    className="tribal-festival-form-text-input"
                    value={formData.tribe}
                    onChange={(e) => setFormData(prev => ({ ...prev, tribe: e.target.value }))}
                    placeholder="Enter tribe name"
                  />
                </div>

                <div className="tribal-festival-form-group">
                  <label className="tribal-festival-form-label" htmlFor="festivalName">Festival:</label>
                  <input
                    id="festivalName"
                    type="text"
                    className="tribal-festival-form-text-input"
                    value={formData.festivalName}
                    onChange={(e) => setFormData(prev => ({ ...prev, festivalName: e.target.value }))}
                    placeholder="Enter festival name"
                  />
                </div>
              </div>

              <div className="tribal-festival-form-row">
                <div className="tribal-festival-form-group tribal-festival-form-group-full-width">
                  <label className="tribal-festival-form-label" htmlFor="description">
                    Description: <span className="tribal-festival-word-count">
                      ({formData.description.split(/\s+/).filter(Boolean).length}/200 words)
                    </span>
                  </label>
                  <textarea
                    id="description"
                    className="tribal-festival-form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description (max 200 words)"
                    rows={6}
                  />
                </div>
              </div>

              <div className="tribal-festival-form-row">
                <div className="tribal-festival-form-group tribal-festival-form-group-full-width">
                  <label className="tribal-festival-form-label" htmlFor="bannerPhoto">Banner/Cover Photo:</label>
                  <div className="tribal-festival-file-upload-container">
                    <input
                      id="bannerPhoto"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImageUpload}
                      className="tribal-festival-file-input"
                    />
                    {formData.bannerPhotoPreview && (
                      <div className="tribal-festival-image-preview">
                        <img 
                          src={formData.bannerPhotoPreview} 
                          alt="Preview" 
                          className="tribal-festival-preview-img"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="tribal-festival-form-row tribal-festival-form-submit-row">
                <button type="submit" className="tribal-festival-form-submit-button">
                  {editingFestival ? 'Update Festival' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="tribal-festival-photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div className="tribal-festival-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="tribal-festival-photo-modal-close" onClick={() => setShowPhotoModal(false)}>&times;</span>
            <img src={modalPhoto} alt="Festival Banner" className="tribal-festival-modal-photo" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TribalFestival;
