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
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useEffect, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import Select from "react-select";
import { db, storage } from "../firebaseConfig";
import "./ServicesCarousel.css";

const TYPE_OPTIONS = [
  { value: "thumbnail", label: "Thumbnail" },
  { value: "banner", label: "Banner" }
];

const SORT_OPTIONS = [
  { value: "asc", label: "Sort by Title (A-Z)" },
  { value: "desc", label: "Sort by Title (Z-A)" }
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_DIMENSION = 1400;
const IMAGE_QUALITY = 0.75;

const getInitialFormState = () => ({
  type: TYPE_OPTIONS[0].value,
  title: "",
  description: "",
  thumbnailImage: "",
  bannerImage: ""
});

const ServicesCarousel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSlide, setEditingSlide] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [formData, setFormData] = useState(getInitialFormState);
  const [carouselData, setCarouselData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataError, setDataError] = useState("");
  const navigate = useNavigate();
  const isAddSlideRoute = Boolean(useMatch("/services/carousel/addslides"));
  const carouselCollection = collection(db, "carousel");

  useEffect(() => {
    const slidesQuery = query(collection(db, "carousel"), orderBy("id", "asc"));
    const unsubscribe = onSnapshot(
      slidesQuery,
      (snapshot) => {
        const slides = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          return {
            docId: docSnap.id,
            id: typeof data.id === "number" ? data.id : Date.now(),
            type: data.type || "N/A",
            title: data.title || "N/A",
            description: data.description || "N/A",
            thumbnailImage: data.thumbnailImg || "N/A",
            bannerImage: data.bannerImg || "N/A"
          };
        });
        setCarouselData(slides);
        setDataError("");
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching carousel:", error);
        setDataError("Failed to load carousel slides. Please try again.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setFormData(getInitialFormState());
    setEditingSlide(null);
    setEditingRowId(null);
  };

  const validateSlide = (data) => {
    if (!data.thumbnailImage) {
      return "Please upload a thumbnail image.";
    }
    if (data.type === "banner") {
      if (!data.bannerImage) {
        return "Please upload a banner image.";
      }
      if (!data.title.trim()) {
        return "Please enter a banner title.";
      }
      if (!data.description.trim()) {
        return "Please enter a banner description.";
      }
    }
    return "";
  };

  const compressImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          const maxSize = MAX_IMAGE_DIMENSION;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
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

  const isDataUrl = (value) =>
    typeof value === "string" && value.startsWith("data:");

  const uploadImageToStorage = async (imageValue, storagePath) => {
    if (!imageValue || imageValue === "N/A") {
      return "N/A";
    }

    if (!isDataUrl(imageValue)) {
      return imageValue;
    }

    const storageRef = ref(storage, storagePath);
    await uploadString(storageRef, imageValue, "data_url");
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedPreview = await processImageUpload(file);
      setFormData((prev) => ({
        ...prev,
        [field]: compressedPreview
      }));
    } catch (error) {
      console.error(error);
      alert(error.message || "Error processing image. Please try again.");
    } finally {
      e.target.value = "";
    }
  };

  const handleInlineImageChange = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedPreview = await processImageUpload(file);
      setEditingSlide((prev) =>
        prev ? { ...prev, [field]: compressedPreview } : prev
      );
    } catch (error) {
      console.error(error);
      alert(error.message || "Error processing image. Please try again.");
    } finally {
      e.target.value = "";
    }
  };

  const filteredCarouselData = carouselData.filter((slide) => {
    const query = searchTerm.toLowerCase();
    return (
      slide.type.toLowerCase().includes(query) ||
      (slide.title || "").toLowerCase().includes(query) ||
      (slide.description || "").toLowerCase().includes(query)
    );
  });

  const sortedCarouselData = [...filteredCarouselData].sort((a, b) => {
    const titleA = (a.title || "").toLowerCase();
    const titleB = (b.title || "").toLowerCase();

    if (sortOrder === "asc") {
      return titleA.localeCompare(titleB);
    }
    return titleB.localeCompare(titleA);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMessage = validateSlide(formData);
    if (errorMessage) {
      alert(errorMessage);
      return;
    }
    setIsSubmitting(true);

    try {
      const nextId = carouselData.reduce(
        (maxId, slide) => (slide.id > maxId ? slide.id : maxId),
        0
      ) + 1;
      const slideId = nextId;
      const basePath = `carousel/${slideId}`;
      const thumbnailUrl = await uploadImageToStorage(
        formData.thumbnailImage,
        `${basePath}/thumbnail_${slideId}.jpg`
      );
      const bannerUrl =
        formData.type === "banner"
          ? await uploadImageToStorage(
              formData.bannerImage,
              `${basePath}/banner_${slideId}.jpg`
            )
          : "N/A";

      await addDoc(carouselCollection, {
        id: slideId,
        type: formData.type || "N/A",
        thumbnailImg: thumbnailUrl || "N/A",
        bannerImg: formData.type === "banner" ? bannerUrl || "N/A" : "N/A",
        title:
          formData.type === "banner"
            ? formData.title.trim() || "N/A"
            : "N/A",
        description:
          formData.type === "banner"
            ? formData.description.trim() || "N/A"
            : "N/A"
      });

      alert("Slide added successfully!");
      resetForm();
      navigate("/services/carousel");
    } catch (error) {
      console.error("Error adding slide:", error);
      alert("Unable to add slide. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInlineEdit = (slide) => {
    setEditingRowId(slide.docId);
    setEditingSlide({ ...slide });
  };

  const handleSaveInlineEdit = async () => {
    if (!editingSlide) return;

    const errorMessage = validateSlide(editingSlide);
    if (errorMessage) {
      alert(errorMessage);
      return;
    }
    if (!editingSlide.docId) {
      alert("Unable to update slide. Missing document reference.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const slideId = editingSlide.id || Date.now();
      const docRef = doc(db, "carousel", editingSlide.docId);
      const basePath = `carousel/${slideId}`;
      const thumbnailUrl = await uploadImageToStorage(
        editingSlide.thumbnailImage,
        `${basePath}/thumbnail_${slideId}.jpg`
      );
      const bannerUrl =
        editingSlide.type === "banner"
          ? await uploadImageToStorage(
              editingSlide.bannerImage,
              `${basePath}/banner_${slideId}.jpg`
            )
          : "N/A";

      await updateDoc(docRef, {
        id: slideId,
        type: editingSlide.type || "N/A",
        thumbnailImg: thumbnailUrl || "N/A",
        bannerImg:
          editingSlide.type === "banner" ? bannerUrl || "N/A" : "N/A",
        title:
          editingSlide.type === "banner"
            ? editingSlide.title?.trim() || "N/A"
            : "N/A",
        description:
          editingSlide.type === "banner"
            ? editingSlide.description?.trim() || "N/A"
            : "N/A"
      });

      alert("Slide updated successfully!");
    setEditingRowId(null);
    setEditingSlide(null);
    } catch (error) {
      console.error("Error updating slide:", error);
      alert("Unable to update slide. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInlineEdit = () => {
    setEditingRowId(null);
    setEditingSlide(null);
  };

  const handleInlineFieldChange = (field, value) => {
    setEditingSlide((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleDelete = async (slide) => {
    if (!slide?.docId) return;
    if (!window.confirm("Are you sure you want to delete this slide?")) return;

    try {
      await deleteDoc(doc(db, "carousel", slide.docId));
      alert("Slide deleted successfully!");
    } catch (error) {
      console.error("Error deleting slide:", error);
      alert("Unable to delete slide. Please try again.");
    }
  };

  const handleImageClick = (imageUrl) => {
    if (!imageUrl) return;
    setModalImage(imageUrl);
    setShowImageModal(true);
  };

  return (
    <div className="carousel-container">
      <header>
        <div className="carousel-logo-text">Services Carousel</div>
      </header>

      {!isAddSlideRoute && (
        <div className="carousel-add-button-container">
          <button
            className="carousel-add-button"
            onClick={() => {
              resetForm();
              navigate("/services/carousel/addslides");
            }}
          >
            Add Slide
          </button>
        </div>
      )}

      <div className="carousel-data-container">
        {!isAddSlideRoute ? (
          <>
            <div className="carousel-control-panel-filters">
              <div className="carousel-search-container">
                <div className="carousel-search-input-wrapper">
                  <svg
                    className="carousel-search-icon"
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
                    className="carousel-search-input"
                    placeholder="Search by Type/Title/Description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="carousel-sort-container">
                <Select
                  className="carousel-react-select"
                  classNamePrefix="carousel-react-select"
                  options={SORT_OPTIONS}
                  defaultValue={SORT_OPTIONS[0]}
                  onChange={(option) => setSortOrder(option?.value || "asc")}
                  isSearchable={false}
                />
              </div>
            </div>

            {dataError && (
              <div className="carousel-error-message">{dataError}</div>
            )}
            {isLoading ? (
              <div className="carousel-status-message">Loading slides...</div>
            ) : sortedCarouselData.length === 0 ? (
              <div className="carousel-status-message">
                No slides have been added yet.
              </div>
            ) : (
            <div className="carousel-table-container">
              <table className="carousel-table">
                <thead>
                  <tr>
                    <th className="carousel-sl-no-header">Sl No.</th>
                      <th>Type</th>
                      <th>Thumbnail Image</th>
                      <th>Banner Image</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCarouselData.map((slide, index) => (
                      <tr key={slide.docId || slide.id}>
                      <td className="carousel-sl-no-cell">{index + 1}</td>
                        <td className="carousel-type-cell">
                          {slide.type === "banner" ? "Banner" : "Thumbnail"}
                        </td>
                      <td className="carousel-image-cell">
                          {editingRowId === slide.docId ? (
                          <div className="carousel-edit-image-container">
                              {editingSlide?.thumbnailImage ? (
                                <img
                                  src={editingSlide.thumbnailImage}
                                  alt={`${slide.type} thumbnail`}
                                  className="carousel-table-image"
                                  onDoubleClick={() =>
                                    document
                                      .getElementById(`thumb-upload-${slide.id}`)
                                      ?.click()
                                  }
                                />
                              ) : (
                                <span className="carousel-empty-state">
                                  Add thumbnail
                                </span>
                              )}
                              <input
                                id={`thumb-upload-${slide.id}`}
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                  handleInlineImageChange(
                                    event,
                                    "thumbnailImage"
                                  )
                                }
                                style={{ display: "none" }}
                              />
                              <div className="carousel-image-edit-hint">
                                Double-click to change
                              </div>
                            </div>
                          ) : slide.thumbnailImage ? (
                            <img
                              src={slide.thumbnailImage}
                              alt={`${slide.type} thumbnail`}
                              className="carousel-table-image"
                              onClick={() =>
                                handleImageClick(slide.thumbnailImage)
                              }
                            />
                          ) : (
                            <span className="carousel-empty-state">No image</span>
                          )}
                        </td>
                        <td className="carousel-image-cell">
                          {slide.type === "banner" ? (
                            editingRowId === slide.docId ? (
                              <div className="carousel-edit-image-container">
                                {editingSlide?.bannerImage ? (
                                  <img
                                    src={editingSlide.bannerImage}
                                    alt="banner"
                                    className="carousel-table-image"
                                    onDoubleClick={() =>
                                      document
                                        .getElementById(
                                          `banner-upload-${slide.id}`
                                        )
                                        ?.click()
                                    }
                                  />
                                ) : (
                                  <span className="carousel-empty-state">
                                    Add banner
                                  </span>
                                )}
                            <input
                                  id={`banner-upload-${slide.id}`}
                              type="file"
                                  accept="image/*"
                                  onChange={(event) =>
                                    handleInlineImageChange(
                                      event,
                                      "bannerImage"
                                    )
                                  }
                                  style={{ display: "none" }}
                                />
                                <div className="carousel-image-edit-hint">
                                  Double-click to change
                                </div>
                          </div>
                            ) : slide.bannerImage ? (
                          <img
                                src={slide.bannerImage}
                                alt="banner"
                            className="carousel-table-image"
                                onClick={() =>
                                  handleImageClick(slide.bannerImage)
                                }
                              />
                            ) : (
                              <span className="carousel-empty-state">No image</span>
                            )
                          ) : (
                            <span className="carousel-muted-text">
                              Not required
                            </span>
                        )}
                      </td>
                      <td>
                          {slide.type === "banner" ? (
                            editingRowId === slide.docId ? (
                          <input
                            type="text"
                            className="carousel-inline-input"
                                value={editingSlide?.title || ""}
                                onChange={(e) =>
                                  handleInlineFieldChange("title", e.target.value)
                                }
                                placeholder="Enter title"
                          />
                        ) : (
                              slide.title || "—"
                            )
                          ) : (
                            <span className="carousel-muted-text">
                              Not applicable
                            </span>
                        )}
                      </td>
                      <td className="carousel-description-cell">
                          {slide.type === "banner" ? (
                            editingRowId === slide.docId ? (
                          <textarea
                            className="carousel-inline-textarea"
                                value={editingSlide?.description || ""}
                                onChange={(e) =>
                                  handleInlineFieldChange(
                                    "description",
                                    e.target.value
                                  )
                                }
                            rows="3"
                                placeholder="Enter description"
                          />
                        ) : (
                              <div className="carousel-description-text">
                                {slide.description || "—"}
                              </div>
                            )
                          ) : (
                            <span className="carousel-muted-text">
                              Not applicable
                            </span>
                        )}
                      </td>
                      <td>
                        <div className="carousel-action-buttons">
                            {editingRowId === slide.docId ? (
                            <>
                              <button
                                className="carousel-save-button"
                                onClick={handleSaveInlineEdit}
                                title="Save"
                                  disabled={isSubmitting}
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
                                className="carousel-delete-button"
                                  onClick={() => handleDelete(slide)}
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
          </>
        ) : (
          <div className="carousel-form-container">
            <div className="carousel-form-header">
              <h3>Add New Slide</h3>
              <button
                className="carousel-back-button"
                onClick={() => {
                  resetForm();
                  navigate("/services/carousel");
                }}
              >
                Back
              </button>
            </div>

            <form className="carousel-form" onSubmit={handleSubmit}>
              <div className="carousel-form-row">
                <div className="carousel-form-group">
                  <label className="carousel-form-label" htmlFor="slideType">
                    Type
                  </label>
                  <Select
                    inputId="slideType"
                    className="carousel-type-select"
                    classNamePrefix="carousel-type-select"
                    options={TYPE_OPTIONS}
                    value={TYPE_OPTIONS.find(
                      (option) => option.value === formData.type
                    )}
                    defaultValue={TYPE_OPTIONS[0]}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: option?.value || TYPE_OPTIONS[0].value,
                        ...(option?.value === "thumbnail"
                          ? { title: "", description: "", bannerImage: "" }
                          : {})
                      }))
                    }
                    isSearchable={false}
                  />
                </div>
                </div>

              {formData.type === "banner" && (
                <>
                  <div className="carousel-form-row">
                <div className="carousel-form-group">
                      <label className="carousel-form-label" htmlFor="bannerTitle">
                        Title
                      </label>
                  <input
                        id="bannerTitle"
                    type="text"
                    className="carousel-form-text-input"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value
                          }))
                        }
                        placeholder="Enter banner title"
                  />
                </div>
              </div>

              <div className="carousel-form-row">
                <div className="carousel-form-group carousel-form-group-full-width">
                      <label className="carousel-form-label" htmlFor="bannerDescription">
                        Description
                      </label>
                  <textarea
                        id="bannerDescription"
                    className="carousel-form-textarea"
                    value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value
                          }))
                        }
                        placeholder="Enter banner description"
                    rows="4"
                  />
                </div>
              </div>
                </>
              )}

              <div className="carousel-form-row">
                <div className="carousel-form-group carousel-form-group-full-width">
                  <label className="carousel-form-label" htmlFor="thumbnailImage">
                    Thumbnail Image
                  </label>
                  <div className="carousel-file-upload-container">
                    <input
                      id="thumbnailImage"
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageUpload(event, "thumbnailImage")}
                      className="carousel-file-input"
                    />
                    {formData.thumbnailImage && (
                      <div className="carousel-image-preview">
                        <img 
                          src={formData.thumbnailImage}
                          alt="Thumbnail preview"
                          className="carousel-preview-image" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {formData.type === "banner" && (
                <div className="carousel-form-row">
                  <div className="carousel-form-group carousel-form-group-full-width">
                    <label className="carousel-form-label" htmlFor="bannerImage">
                      Banner Image
                    </label>
                    <div className="carousel-file-upload-container">
                      <input
                        id="bannerImage"
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleImageUpload(event, "bannerImage")}
                        className="carousel-file-input"
                      />
                      {formData.bannerImage && (
                        <div className="carousel-image-preview">
                          <img
                            src={formData.bannerImage}
                            alt="Banner preview"
                            className="carousel-preview-image"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="carousel-form-row carousel-form-submit-row">
                <button
                  type="submit"
                  className="carousel-form-submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {showImageModal && (
        <div className="carousel-image-modal" onClick={() => setShowImageModal(false)}>
          <div
            className="carousel-image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="carousel-image-modal-close"
              onClick={() => setShowImageModal(false)}
            >
              &times;
            </span>
            <img src={modalImage} alt="Carousel slide" className="carousel-modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesCarousel;
