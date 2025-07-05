"use client";

import { useState } from "react";
import Select from 'react-select';
import "./ServicesCarousel.css";

const ServicesCarousel = () => {
  const [isFormView, setIsFormView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSlide, setEditingSlide] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // Default sorting order

  // Sort options for react-select
  const sortOptions = [
    { value: 'asc', label: 'Sort by Number (Ascending)' },
    { value: 'desc', label: 'Sort by Number (Descending)' }
  ];

  // Form state
  const [formData, setFormData] = useState({
    slideTitle: "",
    description: "",
    number: "",
    image: null,
    imagePreview: ""
  });

  // Dummy carousel data
  const [carouselData, setCarouselData] = useState([
    {
      id: 1,
      slideTitle: "Beautiful Landscapes",
      description: "Explore the natural beauty of Hornbill",
      number: "1",
      image: "https://via.placeholder.com/150"
    },
    {
      id: 2,
      slideTitle: "Cultural Heritage",
      description: "Discover the rich cultural heritage",
      number: "2",
      image: "https://via.placeholder.com/150"
    },
    {
      id: 3,
      slideTitle: "Local Cuisine",
      description: "Taste the authentic local flavors",
      number: "3",
      image: "https://via.placeholder.com/150"
    },
    {
      id: 4,
      slideTitle: "Adventure Activities",
      description: "Experience thrilling adventures",
      number: "4",
      image: "https://via.placeholder.com/150"
    },
    {
      id: 5,
      slideTitle: "Wildlife Safari",
      description: "Encounter exotic wildlife",
      number: "5",
      image: "https://via.placeholder.com/150"
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
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);

      // Image compression would be implemented here in a real app
      // For now, we're just using the file as is
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  // Handle number input validation (only numbers and a single decimal point)
  const handleNumberChange = (value) => {
    // Regex to allow only numbers and a single decimal point
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      // Check if there's more than one decimal point
      if ((value.match(/\./g) || []).length <= 1) {
        setFormData(prev => ({ ...prev, number: value }));
      }
    }
  };

  // Handle inline number change with validation
  const handleInlineNumberChange = (value) => {
    // Regex to allow only numbers and a single decimal point
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      // Check if there's more than one decimal point
      if ((value.match(/\./g) || []).length <= 1) {
        setEditingSlide(prev => ({ ...prev, number: value }));
      }
    }
  };

  // Filter slides based on search term
  const filteredCarouselData = carouselData.filter(slide => {
    return slide.slideTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
           slide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           slide.number.includes(searchTerm);
  });

  // Sort slides based on number
  const sortedCarouselData = [...filteredCarouselData].sort((a, b) => {
    if (sortOrder === "asc") {
      return parseFloat(a.number) - parseFloat(b.number);
    } else {
      return parseFloat(b.number) - parseFloat(a.number);
    }
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.slideTitle.trim()) {
      alert("Please enter slide title");
      return;
    }
    if (!formData.description.trim()) {
      alert("Please enter description");
      return;
    }
    if (!formData.number.trim()) {
      alert("Please enter a number");
      return;
    }
    
    // Check if number is already used
    const numberExists = carouselData.some(slide => 
      slide.number === formData.number && 
      (!editingSlide || slide.id !== editingSlide.id)
    );
    
    if (numberExists) {
      alert("This number is already used. Please choose another one.");
      return;
    }
    
    if (!formData.image && !editingSlide) {
      alert("Please upload an image");
      return;
    }

    if (editingSlide) {
      // Update existing slide
      setCarouselData(prev => prev.map(slide =>
        slide.id === editingSlide.id
          ? {
              ...slide,
              slideTitle: formData.slideTitle,
              description: formData.description,
              number: formData.number,
              image: formData.imagePreview || slide.image
            }
          : slide
      ));
      alert("Slide updated successfully!");
      setEditingSlide(null);
    } else {
      // Add new slide
      const newSlide = {
        id: Date.now(),
        slideTitle: formData.slideTitle,
        description: formData.description,
        number: formData.number,
        image: formData.imagePreview
      };
      setCarouselData(prev => [...prev, newSlide]);
      alert("Slide added successfully!");
    }

    // Reset form
    resetForm();
    setIsFormView(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      slideTitle: "",
      description: "",
      number: "",
      image: null,
      imagePreview: ""
    });
    setEditingSlide(null);
  };

  // Handle inline edit
  const handleInlineEdit = (slide) => {
    setEditingRowId(slide.id);
    setEditingSlide({ ...slide });
  };

  // Handle save inline edit
  const handleSaveInlineEdit = () => {
    if (!editingSlide.slideTitle.trim()) {
      alert("Please enter slide title");
      return;
    }
    if (!editingSlide.description.trim()) {
      alert("Please enter description");
      return;
    }
    if (!editingSlide.number.trim()) {
      alert("Please enter a number");
      return;
    }
    
    // Check if number is already used
    const numberExists = carouselData.some(slide => 
      slide.number === editingSlide.number && 
      slide.id !== editingSlide.id
    );
    
    if (numberExists) {
      alert("This number is already used. Please choose another one.");
      return;
    }

    setCarouselData(prev => prev.map(slide =>
      slide.id === editingSlide.id ? editingSlide : slide
    ));
    setEditingRowId(null);
    setEditingSlide(null);
    alert("Slide updated successfully!");
  };

  // Handle cancel inline edit
  const handleCancelInlineEdit = () => {
    setEditingRowId(null);
    setEditingSlide(null);
  };

  // Handle inline field change
  const handleInlineFieldChange = (field, value) => {
    setEditingSlide(prev => ({ ...prev, [field]: value }));
  };

  // Handle inline image change
  const handleInlineImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only JPG, JPEG or PNG files.');
      return;
    }

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingSlide(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  // Handle delete slide
  const handleDelete = (slideId) => {
    if (window.confirm("Are you sure you want to delete this slide?")) {
      setCarouselData(prev => prev.filter(slide => slide.id !== slideId));
      alert("Slide deleted successfully!");
    }
  };

  // Handle image click
  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl);
    setShowImageModal(true);
  };

  return (
    <div className="carousel-container">
      <header>
        <div className="carousel-logo-text">Services Carousel</div>
      </header>

      {/* Add Slide Button - Outside Card */}
      {!isFormView && (
        <div className="carousel-add-button-container">
          <button
            className="carousel-add-button"
            onClick={() => {
              resetForm();
              setIsFormView(true);
            }}
          >
            Add Slide
          </button>
        </div>
      )}

      <div className="carousel-data-container">
        {!isFormView ? (
          <>
            {/* Search and Filter */}
            <div className="carousel-control-panel-filters">
              <div className="carousel-search-container">
                <div className="carousel-search-input-wrapper">
                  <svg className="carousel-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    className="carousel-search-input"
                    placeholder="Search by Title/Description/Number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="carousel-sort-container">
                <Select
                  className="carousel-react-select"
                  classNamePrefix="carousel-react-select"
                  options={sortOptions}
                  defaultValue={sortOptions[0]}
                  onChange={(option) => setSortOrder(option.value)}
                  isSearchable={false}
                />
              </div>
            </div>

            {/* Carousel Table */}
            <div className="carousel-table-container">
              <table className="carousel-table">
                <thead>
                  <tr>
                    <th className="carousel-sl-no-header">Sl No.</th>
                    <th>Carousel Image</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Number</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCarouselData.map((slide, index) => (
                    <tr key={slide.id}>
                      <td className="carousel-sl-no-cell">{index + 1}</td>
                      <td className="carousel-image-cell">
                        {editingRowId === slide.id ? (
                          <div className="carousel-edit-image-container">
                            <img
                              src={editingSlide.image}
                              alt={editingSlide.slideTitle}
                              className="carousel-table-image"
                              onDoubleClick={() => document.getElementById(`image-upload-${slide.id}`).click()}
                            />
                            <input
                              id={`image-upload-${slide.id}`}
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              onChange={handleInlineImageChange}
                              style={{ display: 'none' }}
                            />
                            <div className="carousel-image-edit-hint">Double-click to change</div>
                          </div>
                        ) : (
                          <img
                            src={slide.image}
                            alt={slide.slideTitle}
                            className="carousel-table-image"
                            onClick={() => handleImageClick(slide.image)}
                          />
                        )}
                      </td>
                      <td>
                        {editingRowId === slide.id ? (
                          <input
                            type="text"
                            className="carousel-inline-input"
                            value={editingSlide.slideTitle}
                            onChange={(e) => handleInlineFieldChange('slideTitle', e.target.value)}
                          />
                        ) : (
                          slide.slideTitle
                        )}
                      </td>
                      <td className="carousel-description-cell">
                        {editingRowId === slide.id ? (
                          <textarea
                            className="carousel-inline-textarea"
                            value={editingSlide.description}
                            onChange={(e) => handleInlineFieldChange('description', e.target.value)}
                            rows="3"
                          />
                        ) : (
                          <div className="carousel-description-text">{slide.description}</div>
                        )}
                      </td>
                      <td>
                        {editingRowId === slide.id ? (
                          <input
                            type="text"
                            className="carousel-inline-input carousel-number-input"
                            value={editingSlide.number}
                            onChange={(e) => handleInlineNumberChange(e.target.value)}
                          />
                        ) : (
                          slide.number
                        )}
                      </td>
                      <td>
                        <div className="carousel-action-buttons">
                          {editingRowId === slide.id ? (
                            <>
                              <button
                                className="carousel-save-button"
                                onClick={handleSaveInlineEdit}
                                title="Save"
                              >
                                Save
                              </button>
                              <button
                                className="carousel-cancel-button"
                                onClick={handleCancelInlineEdit}
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="carousel-edit-button"
                                onClick={() => handleInlineEdit(slide)}
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button
                                className="carousel-delete-button"
                                onClick={() => handleDelete(slide.id)}
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
          /* Carousel Form */
          <div className="carousel-form-container">
            <div className="carousel-form-header">
              <h3>{editingSlide ? 'Edit Slide' : 'Add New Slide'}</h3>
              <button
                className="carousel-back-button"
                onClick={() => {
                  resetForm();
                  setIsFormView(false);
                }}
              >
                Back
              </button>
            </div>

            <form className="carousel-form" onSubmit={handleSubmit}>
              <div className="carousel-form-row">
                <div className="carousel-form-group">
                  <label className="carousel-form-label" htmlFor="slideTitle">Slide Title:</label>
                  <input
                    id="slideTitle"
                    type="text"
                    className="carousel-form-text-input"
                    value={formData.slideTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, slideTitle: e.target.value }))}
                    placeholder="Enter slide title"
                  />
                </div>

                <div className="carousel-form-group">
                  <label className="carousel-form-label" htmlFor="number">Number:</label>
                  <input
                    id="number"
                    type="text"
                    className="carousel-form-text-input"
                    value={formData.number}
                    onChange={(e) => handleNumberChange(e.target.value)}
                    placeholder="Enter slide number"
                  />
                </div>
              </div>

              <div className="carousel-form-row">
                <div className="carousel-form-group carousel-form-group-full-width">
                  <label className="carousel-form-label" htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    className="carousel-form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter slide description"
                    rows="4"
                  />
                </div>
              </div>

              <div className="carousel-form-row">
                <div className="carousel-form-group carousel-form-group-full-width">
                  <label className="carousel-form-label" htmlFor="image">Slide Image:</label>
                  <div className="carousel-file-upload-container">
                    <input
                      id="image"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImageUpload}
                      className="carousel-file-input"
                    />
                    {formData.imagePreview && (
                      <div className="carousel-image-preview">
                        <img 
                          src={formData.imagePreview} 
                          alt="Preview" 
                          className="carousel-preview-image" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="carousel-form-row carousel-form-submit-row">
                <button type="submit" className="carousel-form-submit-button">
                  {editingSlide ? 'Update Slide' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="carousel-image-modal" onClick={() => setShowImageModal(false)}>
          <div className="carousel-image-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="carousel-image-modal-close" onClick={() => setShowImageModal(false)}>&times;</span>
            <img src={modalImage} alt="Carousel slide" className="carousel-modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesCarousel;
