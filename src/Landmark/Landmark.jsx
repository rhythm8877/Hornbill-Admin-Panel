"use client";

import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import "./Landmark.css";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_DIMENSION = 1400;
const IMAGE_QUALITY = 0.75;

// Helper function to generate data URI placeholder
const generatePlaceholder = (text) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-size="16" font-family="Arial, sans-serif">${text}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Dummy data
const DUMMY_LANDMARKS = [
  {
    docId: "1",
    id: 1,
    photo: generatePlaceholder("Kohima War Cemetery"),
    title: "Kohima War Cemetery",
    category: "Historical",
    longitude: "94.1083",
    latitude: "25.6747"
  },
  {
    docId: "2",
    id: 2,
    photo: generatePlaceholder("Dzukou Valley"),
    title: "Dzukou Valley",
    category: "Natural",
    longitude: "94.1234",
    latitude: "25.5678"
  },
  {
    docId: "3",
    id: 3,
    photo: generatePlaceholder("Kisama Heritage Village"),
    title: "Kisama Heritage Village",
    category: "Cultural",
    longitude: "94.0987",
    latitude: "25.7123"
  },
  {
    docId: "4",
    id: 4,
    photo: generatePlaceholder("Shilloi Lake"),
    title: "Shilloi Lake",
    category: "Natural",
    longitude: "94.4567",
    latitude: "26.2345"
  },
  {
    docId: "5",
    id: 5,
    photo: generatePlaceholder("Dimapur Ruins"),
    title: "Dimapur Ruins",
    category: "Historical",
    longitude: "93.7234",
    latitude: "25.9123"
  },
  {
    docId: "6",
    id: 6,
    photo: generatePlaceholder("Mokokchung Church"),
    title: "Mokokchung Church",
    category: "Religious",
    longitude: "94.5123",
    latitude: "26.3456"
  }
];

const Landmark = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState({ value: "All", label: "All" });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");
  const [landmarkData, setLandmarkData] = useState([]);
  const [editingLandmark, setEditingLandmark] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataError, setDataError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLandmarkData([...DUMMY_LANDMARKS]);
      setIsLoading(false);
      setDataError("");
    }, 500);
  }, []);

  // Get unique categories from data
  const categoryOptions = useMemo(() => {
    const categories = new Set(landmarkData.map((landmark) => landmark.category).filter(Boolean));
    const options = [{ value: "All", label: "All" }];
    Array.from(categories)
      .sort()
      .forEach((cat) => {
        options.push({ value: cat, label: cat });
      });
    return options;
  }, [landmarkData]);

  // Filter landmarks based on search term and category
  const filteredLandmarks = landmarkData.filter((landmark) => {
    const matchesSearch =
      landmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (landmark.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (landmark.longitude || "").includes(searchTerm) ||
      (landmark.latitude || "").includes(searchTerm);

    const matchesCategory =
      selectedCategory.value === "All" || landmark.category === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });

  // Handle photo modal
  const handlePhotoClick = (photoUrl) => {
    if (!photoUrl) return;
    setModalPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  // Image compression
  const compressImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          if (width > height && width > MAX_IMAGE_DIMENSION) {
            height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
            width = MAX_IMAGE_DIMENSION;
          } else if (height > MAX_IMAGE_DIMENSION) {
            width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
            height = MAX_IMAGE_DIMENSION;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Image compression failed."));
                return;
              }
              const blobReader = new FileReader();
              blobReader.onloadend = () => resolve(blobReader.result);
              blobReader.onerror = () => reject(new Error("Unable to read compressed image."));
              blobReader.readAsDataURL(blob);
            },
            file.type === "image/png" ? "image/png" : "image/jpeg",
            IMAGE_QUALITY
          );
        };
        img.onerror = () => reject(new Error("Invalid image content."));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error("Unable to read file."));
      reader.readAsDataURL(file);
    });

  const processImageUpload = async (file) => {
    if (!file) return null;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Please upload only JPG, JPEG, PNG or WEBP files.");
    }
    return compressImage(file);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const preview = await processImageUpload(file);
      setEditingLandmark((prev) => (prev ? { ...prev, photo: preview } : prev));
    } catch (error) {
      console.error(error);
      alert(error.message || "Error processing image. Please try again.");
    } finally {
      e.target.value = "";
    }
  };

  const handleEdit = (landmark) => {
    setEditingId(landmark.docId);
    setEditingLandmark({ ...landmark });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingLandmark(null);
  };

  const validateLandmark = (data) => {
    if (!data.title || !data.title.trim()) return "Please enter a title.";
    if (!data.category || !data.category.trim()) return "Please enter a category.";
    if (!data.longitude || !data.longitude.trim()) return "Please enter longitude.";
    if (!data.latitude || !data.latitude.trim()) return "Please enter latitude.";
    return "";
  };

  const handleSaveEdit = async () => {
    if (!editingLandmark || !editingLandmark.docId) return;
    const error = validateLandmark(editingLandmark);
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state
      setLandmarkData((prevData) =>
        prevData.map((landmark) =>
          landmark.docId === editingLandmark.docId
            ? {
                ...landmark,
                title: editingLandmark.title.trim(),
                category: editingLandmark.category.trim(),
                longitude: editingLandmark.longitude.trim(),
                latitude: editingLandmark.latitude.trim(),
                photo: editingLandmark.photo || landmark.photo
              }
            : landmark
        )
      );

      alert("Landmark updated successfully!");
      handleCancelEdit();
    } catch (error) {
      console.error("Error updating landmark:", error);
      alert("Unable to update landmark. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (landmark) => {
    if (!landmark?.docId) return;
    if (!window.confirm("Are you sure you want to delete this landmark?")) return;

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Update local state
      setLandmarkData((prevData) =>
        prevData.filter((item) => item.docId !== landmark.docId)
      );

      alert("Landmark deleted successfully!");
    } catch (error) {
      console.error("Error deleting landmark:", error);
      alert("Unable to delete landmark. Please try again.");
    }
  };

  const handleEditFieldChange = (field, value) => {
    setEditingLandmark((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // Custom select styles to match theme
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minWidth: "200px",
      border: state.isFocused
        ? "1px solid var(--landmark-primary-color)"
        : "1px solid var(--landmark-border-color)",
      borderRadius: "6px",
      fontSize: "14px",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(36, 178, 149, 0.1)"
        : "none",
      "&:hover": {
        borderColor: "var(--landmark-primary-color)"
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "var(--landmark-primary-color)"
        : state.isFocused
        ? "var(--landmark-primary-light)"
        : "white",
      color: state.isSelected ? "white" : "#333",
      "&:hover": {
        backgroundColor: state.isSelected
          ? "var(--landmark-primary-color)"
          : "var(--landmark-primary-light)"
      }
    })
  };

  return (
    <div className="landmark-container">
      <header>
        <div className="landmark-logo-text">Landmarks</div>
      </header>

      <div className="landmark-data-container">
        {/* Search and Filters */}
        <div className="landmark-control-panel-filters">
          {/* Search Bar */}
          <div className="landmark-search-container">
            <div className="landmark-search-input-wrapper">
              <svg
                className="landmark-search-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="landmark-search-input"
                placeholder="Search by Title, Category, Longitude or Latitude"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Dropdown Filter */}
          <div className="landmark-dropdown-container">
            <div className="landmark-dropdown-group">
              <span className="landmark-label-text">Category:</span>
              <div className="landmark-select-container">
                <Select
                  value={selectedCategory}
                  onChange={(option) => setSelectedCategory(option)}
                  options={categoryOptions}
                  styles={customSelectStyles}
                  isSearchable
                  placeholder="Select Category"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Landmarks Table */}
        {dataError && <div className="landmark-error-message">{dataError}</div>}
        {isLoading ? (
          <div className="landmark-status-message">Loading landmarks...</div>
        ) : filteredLandmarks.length === 0 ? (
          <div className="landmark-status-message">No landmarks found.</div>
        ) : (
          <div className="landmark-table-container">
            <table className="landmark-table">
              <thead>
                <tr>
                  <th className="landmark-sl-no-header">Sl No.</th>
                  <th>Photo</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Longitude</th>
                  <th>Latitude</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLandmarks.map((landmark, index) => (
                  <tr key={landmark.docId || landmark.id}>
                    <td className="landmark-sl-no-cell">{index + 1}</td>
                    <td className="landmark-image-cell">
                      {editingId === landmark.docId ? (
                        <div className="landmark-edit-image-container">
                          {editingLandmark?.photo ? (
                            <img
                              src={editingLandmark.photo}
                              alt="landmark"
                              className="landmark-table-image"
                              onDoubleClick={() =>
                                document
                                  .getElementById(`photo-upload-${landmark.docId}`)
                                  ?.click()
                              }
                            />
                          ) : (
                            <span className="landmark-empty-state">Add photo</span>
                          )}
                          <input
                            id={`photo-upload-${landmark.docId}`}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                          />
                          <div className="landmark-image-edit-hint">Double-click to change</div>
                        </div>
                      ) : landmark.photo ? (
                        <img
                          src={landmark.photo}
                          alt={landmark.title}
                          className="landmark-table-image"
                          onClick={() => handlePhotoClick(landmark.photo)}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            if (e.target.parentNode) {
                              e.target.parentNode.innerHTML =
                                '<div class="landmark-photo-placeholder">No Image</div>';
                            }
                          }}
                        />
                      ) : (
                        <span className="landmark-empty-state">No image</span>
                      )}
                    </td>
                    <td>
                      {editingId === landmark.docId ? (
                        <input
                          type="text"
                          className="landmark-inline-input"
                          value={editingLandmark?.title || ""}
                          onChange={(e) => handleEditFieldChange("title", e.target.value)}
                        />
                      ) : (
                        landmark.title || "—"
                      )}
                    </td>
                    <td>
                      {editingId === landmark.docId ? (
                        <input
                          type="text"
                          className="landmark-inline-input"
                          value={editingLandmark?.category || ""}
                          onChange={(e) => handleEditFieldChange("category", e.target.value)}
                        />
                      ) : (
                        landmark.category || "—"
                      )}
                    </td>
                    <td>
                      {editingId === landmark.docId ? (
                        <input
                          type="text"
                          className="landmark-inline-input"
                          value={editingLandmark?.longitude || ""}
                          onChange={(e) => handleEditFieldChange("longitude", e.target.value)}
                        />
                      ) : (
                        landmark.longitude || "—"
                      )}
                    </td>
                    <td>
                      {editingId === landmark.docId ? (
                        <input
                          type="text"
                          className="landmark-inline-input"
                          value={editingLandmark?.latitude || ""}
                          onChange={(e) => handleEditFieldChange("latitude", e.target.value)}
                        />
                      ) : (
                        landmark.latitude || "—"
                      )}
                    </td>
                    <td>
                      <div className="landmark-action-buttons">
                        {editingId === landmark.docId ? (
                          <>
                            <button
                              className="landmark-save-button"
                              onClick={handleSaveEdit}
                              disabled={isSubmitting}
                            >
                              Save
                            </button>
                            <button
                              className="landmark-cancel-button"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="landmark-edit-button"
                              onClick={() => handleEdit(landmark)}
                              title="Edit"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button
                              className="landmark-delete-button"
                              onClick={() => handleDelete(landmark)}
                              title="Delete"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
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
        )}
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="landmark-photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div
            className="landmark-photo-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="landmark-photo-modal-close"
              onClick={() => setShowPhotoModal(false)}
            >
              &times;
            </span>
            <img
              src={modalPhoto}
              alt="Landmark"
              className="landmark-modal-photo"
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

export default Landmark;

