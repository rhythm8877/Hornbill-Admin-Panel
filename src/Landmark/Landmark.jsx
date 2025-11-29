"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadString } from "firebase/storage";
import { useEffect, useMemo, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import Select from "react-select";
import { db, storage } from "../firebaseConfig";
import "./Landmark.css";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_DIMENSION = 1400;
const IMAGE_QUALITY = 0.75;

const getInitialFormState = () => ({
  title: "",
  category: "",
  latitude: "",
  longitude: "",
  photo: ""
});

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
  const [formData, setFormData] = useState(getInitialFormState);

  const navigate = useNavigate();
  const isAddRoute = Boolean(useMatch("/services/landmark/add"));
  const landmarkCollection = useMemo(() => collection(db, "landmark"), []);

  useEffect(() => {
    const landmarkQuery = query(landmarkCollection, orderBy("title", "asc"));
    const unsubscribe = onSnapshot(
      landmarkQuery,
      (snapshot) => {
        const records = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          return {
            docId: docSnap.id,
            title: data.title || "—",
            category: data.category || "—",
            longitude: typeof data.longitude === "number" ? data.longitude.toString() : data.longitude || "",
            latitude: typeof data.latitude === "number" ? data.latitude.toString() : data.latitude || "",
            photo: data.photo || ""
          };
        });
        setLandmarkData(records);
        setIsLoading(false);
        setDataError("");
      },
      (error) => {
        console.error("Error fetching landmarks:", error);
        setDataError("Failed to load landmarks. Please try again.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [landmarkCollection]);

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

  const isDataUrl = (value) => typeof value === "string" && value.startsWith("data:");

  const uploadImageToStorage = async (imageValue, storagePath) => {
    if (!imageValue) return null;
    if (!isDataUrl(imageValue)) {
      return imageValue; // Already a URL, return as is
    }
    const storageRef = ref(storage, storagePath);
    await uploadString(storageRef, imageValue, "data_url");
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const preview = await processImageUpload(file);
      // If we're in edit mode (editingId is set), update editingLandmark
      // Otherwise, update formData (for the add form)
      if (editingId) {
        setEditingLandmark((prev) => (prev ? { ...prev, photo: preview } : prev));
      } else {
        setFormData((prev) => ({ ...prev, photo: preview }));
      }
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

  const resetForm = () => {
    setFormData(getInitialFormState());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateLandmark(formData);
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload photo to Firebase Storage and get URL string
      let photoUrl = "";
      if (formData.photo) {
        const basePath = `landmark`;
        const uploadedUrl = await uploadImageToStorage(
          formData.photo,
          `${basePath}/photo_${Date.now()}.jpg`
        );
        photoUrl = uploadedUrl || ""; // Ensure it's always a string
      }

      // Convert longitude and latitude to numbers
      const longitude = parseFloat(formData.longitude) || 0;
      const latitude = parseFloat(formData.latitude) || 0;

      // Submit to Firebase with correct data types
      await addDoc(landmarkCollection, {
        title: String(formData.title.trim()), // string
        category: String(formData.category.trim()), // string
        longitude: Number(longitude), // number
        latitude: Number(latitude), // number
        photo: String(photoUrl) // string (URL from Firebase Storage)
      });

      alert("Landmark added successfully!");
      resetForm();
      navigate("/services/landmark");
    } catch (error) {
      console.error("Error adding landmark:", error);
      alert("Unable to add landmark. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
      const docRef = doc(db, "landmark", editingLandmark.docId);
      
      // Get the original landmark data to find the old image URL
      const originalLandmark = landmarkData.find(l => l.docId === editingLandmark.docId);
      const oldImageUrl = originalLandmark?.photo;
      
      // Upload photo if it's a new data URL, otherwise keep existing URL
      let photoUrl = editingLandmark.photo || "";
      if (editingLandmark.photo && isDataUrl(editingLandmark.photo)) {
        // If a new image is being uploaded, delete the old image first
        if (oldImageUrl) {
          await deleteImageFromStorage(oldImageUrl);
        }
        
        const basePath = `landmark`;
        const uploadedUrl = await uploadImageToStorage(
          editingLandmark.photo,
          `${basePath}/photo_${editingLandmark.docId}.jpg`
        );
        photoUrl = uploadedUrl || ""; // Ensure it's always a string
      }

      // Convert longitude and latitude to numbers
      const longitude = parseFloat(editingLandmark.longitude) || 0;
      const latitude = parseFloat(editingLandmark.latitude) || 0;

      // Update in Firebase with correct data types
      await updateDoc(docRef, {
        title: String(editingLandmark.title.trim()), // string
        category: String(editingLandmark.category.trim()), // string
        longitude: Number(longitude), // number
        latitude: Number(latitude), // number
        photo: String(photoUrl) // string (URL from Firebase Storage)
      });

      alert("Landmark updated successfully!");
      handleCancelEdit();
    } catch (error) {
      console.error("Error updating landmark:", error);
      alert("Unable to update landmark. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteImageFromStorage = async (imageUrl) => {
    if (!imageUrl || imageUrl.trim() === "") return;
    
    try {
      // Handle Firebase Storage URL format
      // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media&token={token}
      if (imageUrl.includes("firebasestorage.googleapis.com")) {
        const url = new URL(imageUrl);
        // Extract the encoded path from the URL
        const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);
        if (pathMatch) {
          let encodedPath = pathMatch[1];
          // Decode the path (may need double decoding)
          let decodedPath = decodeURIComponent(encodedPath);
          // Try double decoding in case it's double-encoded
          try {
            decodedPath = decodeURIComponent(decodedPath);
          } catch {
            // Already decoded, use as is
          }
          
          const storageRef = ref(storage, decodedPath);
          await deleteObject(storageRef);
          console.log("Successfully deleted image from storage:", decodedPath);
        } else {
          console.warn("Could not extract path from Firebase Storage URL:", imageUrl);
        }
      } else {
        // If it's not a Firebase Storage URL, try to use it as a direct path
        const storageRef = ref(storage, imageUrl);
        await deleteObject(storageRef);
        console.log("Successfully deleted image from storage using direct path:", imageUrl);
      }
    } catch (error) {
      console.error("Error deleting image from storage:", error);
      console.error("Image URL was:", imageUrl);
      // Don't throw - continue with document deletion even if image deletion fails
    }
  };

  const handleDelete = async (landmark) => {
    if (!landmark?.docId) return;
    if (!window.confirm("Are you sure you want to delete this landmark?")) return;

    try {
      // Delete image from Storage first
      if (landmark.photo) {
        await deleteImageFromStorage(landmark.photo);
      }
      
      // Then delete the document
      await deleteDoc(doc(db, "landmark", landmark.docId));
      alert("Landmark deleted successfully!");
    } catch (error) {
      console.error("Error deleting landmark:", error);
      alert("Unable to delete landmark. Please try again.");
    }
  };

  const handleEditFieldChange = (field, value) => {
    setEditingLandmark((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

      {!isAddRoute && (
        <div className="landmark-add-button-container">
          <button
            className="landmark-add-button"
            onClick={() => {
              resetForm();
              navigate("/services/landmark/add");
            }}
          >
            Add Landmark
          </button>
        </div>
      )}

      {!isAddRoute ? (
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
                    <tr key={landmark.docId}>
                      <td className="landmark-sl-no-cell">{index + 1}</td>
                      <td className="landmark-image-cell">
                        {editingId === landmark.docId ? (
                          <div 
                            className="landmark-edit-image-container"
                            onClick={() =>
                              document
                                .getElementById(`photo-upload-${landmark.docId}`)
                                ?.click()
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {editingLandmark?.photo ? (
                              <img
                                src={editingLandmark.photo}
                                alt="landmark"
                                className="landmark-table-image"
                              />
                            ) : (
                              <div className="landmark-empty-state-clickable">
                                <span>Click to add photo</span>
                              </div>
                            )}
                            <input
                              id={`photo-upload-${landmark.docId}`}
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              style={{ display: "none" }}
                            />
                            <div className="landmark-image-edit-hint">
                              {editingLandmark?.photo ? "Click to change" : "Click to upload"}
                            </div>
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
      ) : (
        <div className="landmark-form-container">
          <div className="landmark-form-header">
            <h3>Add New Landmark</h3>
            <button
              className="landmark-back-button"
              onClick={() => {
                resetForm();
                navigate("/services/landmark");
              }}
            >
              Back
            </button>
          </div>

          <form className="landmark-form" onSubmit={handleSubmit}>
            <div className="landmark-form-row">
              <div className="landmark-form-group">
                <label className="landmark-form-label" htmlFor="landmarkTitle">
                  Title
                </label>
                <input
                  id="landmarkTitle"
                  type="text"
                  className="landmark-form-input"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter title"
                />
              </div>
              <div className="landmark-form-group">
                <label className="landmark-form-label" htmlFor="landmarkCategory">
                  Category
                </label>
                <input
                  id="landmarkCategory"
                  type="text"
                  className="landmark-form-input"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  placeholder="Enter category"
                />
              </div>
            </div>

            <div className="landmark-form-row">
              <div className="landmark-form-group">
                <label className="landmark-form-label" htmlFor="landmarkLatitude">
                  Latitude
                </label>
                <input
                  id="landmarkLatitude"
                  type="text"
                  className="landmark-form-input"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  placeholder="Enter latitude"
                />
              </div>
              <div className="landmark-form-group">
                <label className="landmark-form-label" htmlFor="landmarkLongitude">
                  Longitude
                </label>
                <input
                  id="landmarkLongitude"
                  type="text"
                  className="landmark-form-input"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  placeholder="Enter longitude"
                />
              </div>
            </div>

            <div className="landmark-form-row">
              <div className="landmark-form-group landmark-form-group-full">
                <label className="landmark-form-label" htmlFor="landmarkPhoto">
                  Photo
                </label>
                <div className="landmark-file-upload-container">
                  <input
                    id="landmarkPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleFileChange(event, "photo")}
                    className="landmark-file-input"
                  />
                  {formData.photo && (
                    <div className="landmark-image-preview">
                      <img src={formData.photo} alt="Photo preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="landmark-form-row landmark-form-submit-row">
              <button
                type="submit"
                className="landmark-form-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}

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
