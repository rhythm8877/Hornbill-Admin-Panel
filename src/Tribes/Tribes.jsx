"use client";

import { useState } from "react";
import "./Tribes.css";

const Tribes = () => {
  const [isFormView, setIsFormView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTribe, setEditingTribe] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    tribe: "",
    description: "",
    bannerPhoto: null,
    bannerPhotoPreview: ""
  });

  // Dummy tribe data
  const [tribeData, setTribeData] = useState([
    {
      id: 1,
      tribe: "Angami",
      description: "The Angami tribe is one of the major Naga tribes in Nagaland, primarily inhabiting the Kohima district. They are known for their rich cultural heritage, traditional festivals like Sekrenyi, and their expertise in terrace cultivation. The Angami people have a strong warrior tradition and are renowned for their beautiful traditional attire and intricate handwoven textiles.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Angami+Tribe"
    },
    {
      id: 2,
      tribe: "Ao",
      description: "The Ao tribe is one of the principal tribes of Nagaland, mainly residing in the Mokokchung district. They are known for their vibrant festivals, particularly Moatsü, and their strong educational background. The Ao people have contributed significantly to the modern development of Nagaland and are known for their progressive outlook while maintaining their traditional values.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Ao+Tribe"
    },
    {
      id: 3,
      tribe: "Chakhesang",
      description: "The Chakhesang tribe is formed by the amalgamation of three tribes: Chakri, Kheza, and Sangtam. They primarily inhabit the Phek district of Nagaland. Known for their agricultural practices and traditional festivals like Thuni, the Chakhesang people maintain a rich cultural heritage with distinctive customs, traditional dances, and colorful festivals.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Chakhesang+Tribe"
    },
    {
      id: 4,
      tribe: "Chang",
      description: "The Chang tribe primarily inhabits the Tuensang district of Nagaland. They are known for their traditional festival Naknyulüm and their skilled craftsmanship in wood carving and metalwork. The Chang people have a strong oral tradition and are known for their folk songs, traditional dances, and their unique cultural practices that have been passed down through generations.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Chang+Tribe"
    },
    {
      id: 5,
      tribe: "Garo",
      description: "The Garo tribe is primarily found in Meghalaya, Assam, and parts of Nagaland. They are known for their matrilineal society and their famous Wangala festival, also called the '100 Drums Festival'. The Garo people are skilled in traditional crafts, agriculture, and are known for their vibrant cultural traditions including traditional music and dance forms.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Garo+Tribe"
    },
    {
      id: 6,
      tribe: "Kachari",
      description: "The Kachari tribe, also known as Dimasa, primarily inhabits parts of Assam and has presence in neighboring states. They celebrate festivals like Bishu Dima and are known for their agricultural practices and traditional weaving. The Kachari people have a rich cultural heritage with unique customs, traditional attire, and folk traditions.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Kachari+Tribe"
    },
    {
      id: 7,
      tribe: "Khiamniungan",
      description: "The Khiamniungan tribe primarily inhabits the Noklak district of Nagaland and parts of Myanmar. They are known for their traditional festival Tsokum and their unique cultural practices. The Khiamniungan people maintain strong traditional values and are known for their craftsmanship, traditional attire, and their distinctive cultural identity.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Khiamniungan+Tribe"
    },
    {
      id: 8,
      tribe: "Konyak",
      description: "The Konyak tribe is the largest tribe in Nagaland, primarily inhabiting the Mon district. They are known for their traditional festival Aoleang and their historical warrior culture. The Konyak people are famous for their traditional tattoos, headhunting history, and their skilled craftsmanship in wood carving and traditional weapons.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Konyak+Tribe"
    },
    {
      id: 9,
      tribe: "Kuki",
      description: "The Kuki tribe is found across several northeastern states including Manipur, Mizoram, and parts of Nagaland. They celebrate festivals like Mim Kut and Chavang Kut and are known for their traditional music and dance. The Kuki people have a rich oral tradition and are known for their traditional handicrafts and agricultural practices.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Kuki+Tribe"
    },
    {
      id: 10,
      tribe: "Lotha",
      description: "The Lotha tribe primarily inhabits the Wokha district of Nagaland. They are known for their traditional festival Tokhü Emong and their agricultural expertise. The Lotha people maintain strong cultural traditions and are known for their traditional crafts, folk songs, and their distinctive cultural practices that reflect their deep connection with nature.",
      bannerPhoto: "https://via.placeholder.com/800x400/24B295/ffffff?text=Lotha+Tribe"
    }
  ]);

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

  // Filter tribes based on search term
  const filteredTribes = tribeData.filter(tribe => {
    return tribe.tribe.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.tribe.trim()) {
      alert("Please enter tribe name");
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

    if (editingTribe) {
      // Update existing tribe
      setTribeData(prev => prev.map(tribe =>
        tribe.id === editingTribe.id
          ? {
              ...tribe,
              tribe: formData.tribe,
              description: formData.description,
              bannerPhoto: formData.bannerPhotoPreview || tribe.bannerPhoto
            }
          : tribe
      ));
      alert("Tribe updated successfully!");
      setEditingTribe(null);
    } else {
      // Add new tribe
      const newTribe = {
        id: Date.now(),
        tribe: formData.tribe,
        description: formData.description,
        bannerPhoto: formData.bannerPhotoPreview
      };
      setTribeData(prev => [...prev, newTribe]);
      alert("Tribe added successfully!");
    }

    // Reset form
    resetForm();
    setIsFormView(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      tribe: "",
      description: "",
      bannerPhoto: null,
      bannerPhotoPreview: ""
    });
    setEditingTribe(null);
  };

  // Handle inline edit
  const handleInlineEdit = (tribe) => {
    setEditingRowId(tribe.id);
    setEditingTribe({ ...tribe });
  };

  // Handle save inline edit
  const handleSaveInlineEdit = () => {
    if (!editingTribe.tribe.trim()) {
      alert("Please enter tribe name");
      return;
    }
    if (!editingTribe.description.trim()) {
      alert("Please enter description");
      return;
    }

    setTribeData(prev => prev.map(tribe =>
      tribe.id === editingTribe.id ? editingTribe : tribe
    ));
    setEditingRowId(null);
    setEditingTribe(null);
    alert("Tribe updated successfully!");
  };

  // Handle cancel inline edit
  const handleCancelInlineEdit = () => {
    setEditingRowId(null);
    setEditingTribe(null);
  };

  // Handle inline field change
  const handleInlineFieldChange = (field, value) => {
    setEditingTribe(prev => ({ ...prev, [field]: value }));
  };

  // Handle delete tribe
  const handleDelete = (tribeId) => {
    if (window.confirm("Are you sure you want to delete this tribe?")) {
      setTribeData(prev => prev.filter(tribe => tribe.id !== tribeId));
      alert("Tribe deleted successfully!");
    }
  };

  // Handle photo modal
  const handlePhotoClick = (photoUrl) => {
    setModalPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  return (
    <div className="tribes-container">
      <header>
        <div className="tribes-logo-text">Tribes</div>
      </header>

      {/* Add Tribe Button - Outside Card */}
      {!isFormView && (
        <div className="tribes-add-button-container">
          <button
            className="tribes-add-button"
            onClick={() => {
              resetForm();
              setIsFormView(true);
            }}
          >
            Add Tribe
          </button>
        </div>
      )}

      <div className="tribes-data-container">
        {!isFormView ? (
          <>
            {/* Search */}
            <div className="tribes-control-panel-filters">
              <div className="tribes-search-container">
                <div className="tribes-search-input-wrapper">
                  <svg className="tribes-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    className="tribes-search-input"
                    placeholder="Search by Tribe Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tribes Table */}
            <div className="tribes-table-container">
              <table className="tribes-table">
                <thead>
                  <tr>
                    <th className="tribes-sl-no-header">Sl No.</th>
                    <th>Banner/Cover Photo</th>
                    <th>Tribe</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTribes.map((tribe, index) => (
                    <tr key={tribe.id}>
                      <td className="tribes-sl-no-cell">{index + 1}</td>
                      <td>
                        <div 
                          className="tribes-photo-container"
                          onClick={() => handlePhotoClick(tribe.bannerPhoto)}
                        >
                          <img 
                            src={tribe.bannerPhoto} 
                            alt={tribe.tribe} 
                            className="tribes-photo"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.parentNode.innerHTML = `<div class="tribes-photo-placeholder">No Image</div>`;
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        {editingRowId === tribe.id ? (
                          <input
                            type="text"
                            className="tribes-inline-input"
                            value={editingTribe.tribe}
                            onChange={(e) => handleInlineFieldChange('tribe', e.target.value)}
                          />
                        ) : (
                          tribe.tribe
                        )}
                      </td>
                      <td className="tribes-description-cell">
                        {editingRowId === tribe.id ? (
                          <textarea
                            className="tribes-inline-textarea"
                            value={editingTribe.description}
                            onChange={(e) => handleInlineFieldChange('description', e.target.value)}
                            rows={3}
                          />
                        ) : (
                          tribe.description
                        )}
                      </td>
                      <td>
                        <div className="tribes-action-buttons">
                          {editingRowId === tribe.id ? (
                            <>
                              <button
                                className="tribes-save-button"
                                onClick={handleSaveInlineEdit}
                                title="Save"
                              >
                                Save
                              </button>
                              <button
                                className="tribes-cancel-button"
                                onClick={handleCancelInlineEdit}
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="tribes-edit-button"
                                onClick={() => handleInlineEdit(tribe)}
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button
                                className="tribes-delete-button"
                                onClick={() => handleDelete(tribe.id)}
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
          /* Tribe Form */
          <div className="tribes-form-container">
            <div className="tribes-form-header">
              <h3>{editingTribe ? 'Edit Tribe' : 'Add New Tribe'}</h3>
              <button
                className="tribes-back-button"
                onClick={() => {
                  resetForm();
                  setIsFormView(false);
                }}
              >
                Back
              </button>
            </div>

            <form className="tribes-form" onSubmit={handleSubmit}>
              <div className="tribes-form-row">
                <div className="tribes-form-group tribes-form-group-full-width">
                  <label className="tribes-form-label" htmlFor="tribe">Tribe:</label>
                  <input
                    id="tribe"
                    type="text"
                    className="tribes-form-text-input"
                    value={formData.tribe}
                    onChange={(e) => setFormData(prev => ({ ...prev, tribe: e.target.value }))}
                    placeholder="Enter tribe name"
                  />
                </div>
              </div>

              <div className="tribes-form-row">
                <div className="tribes-form-group tribes-form-group-full-width">
                  <label className="tribes-form-label" htmlFor="description">
                    Description: <span className="tribes-word-count">
                      ({formData.description.split(/\s+/).filter(Boolean).length}/200 words)
                    </span>
                  </label>
                  <textarea
                    id="description"
                    className="tribes-form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description (max 200 words)"
                    rows={6}
                  />
                </div>
              </div>

              <div className="tribes-form-row">
                <div className="tribes-form-group tribes-form-group-full-width">
                  <label className="tribes-form-label" htmlFor="bannerPhoto">Banner/Cover Photo:</label>
                  <div className="tribes-file-upload-container">
                    <input
                      id="bannerPhoto"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImageUpload}
                      className="tribes-file-input"
                    />
                    {formData.bannerPhotoPreview && (
                      <div className="tribes-image-preview">
                        <img 
                          src={formData.bannerPhotoPreview} 
                          alt="Preview" 
                          className="tribes-preview-img"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="tribes-form-row tribes-form-submit-row">
                <button type="submit" className="tribes-form-submit-button">
                  {editingTribe ? 'Update Tribe' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="tribes-photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div className="tribes-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="tribes-photo-modal-close" onClick={() => setShowPhotoModal(false)}>&times;</span>
            <img src={modalPhoto} alt="Tribe Banner" className="tribes-modal-photo" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tribes;
