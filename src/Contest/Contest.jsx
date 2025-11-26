"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useEffect, useMemo, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import Select from "react-select";
import { db, storage } from "../firebaseConfig";
import "./Contest.css";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_DIMENSION = 1400;
const IMAGE_QUALITY = 0.75;

const getInitialFormState = () => ({
  type: "banner",
  title: "",
  description: "",
  location: "",
  date: "",
  time: "",
  poster: ""
});

const SORT_OPTIONS = [
  { value: "titleAsc", label: "Sort by Title (A-Z)" },
  { value: "titleDesc", label: "Sort by Title (Z-A)" },
  { value: "dateDesc", label: "Sort by Date (Newest)" },
  { value: "dateAsc", label: "Sort by Date (Oldest)" }
];

const Contest = () => {
  const [contests, setContests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("titleAsc");
  const [formData, setFormData] = useState(getInitialFormState);
  const [editingContest, setEditingContest] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataError, setDataError] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const toggleDescription = (docId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const isAddRoute = Boolean(useMatch("/contest/add"));
  const contestCollection = useMemo(() => collection(db, "contests"), []);

  useEffect(() => {
    const contestsQuery = query(contestCollection);
    const unsubscribe = onSnapshot(
      contestsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          return {
            docId: docSnap.id,
            id: typeof data.id === "number" ? data.id : Date.now(),
            type: data.type || "banner",
            title: data.title ?? "",
            description: data.description ?? "",
            location: data.location ?? "",
            date: data.date ?? "",
            time: data.time ?? "",
            poster: data.poster ?? ""
          };
        });
        setContests(items);
        setIsLoading(false);
        setDataError("");
      },
      (error) => {
        console.error("Error fetching contests:", error);
        setDataError("Failed to load contests. Please try again.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [contestCollection]);

  const validateContest = (data) => {
    if (!data.title.trim()) return "Please enter a title.";
    if (!data.description.trim()) return "Please enter a description.";
    if (!data.poster) return "Please upload a poster image.";
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
      return imageValue;
    }
    const storageRef = ref(storage, storagePath);
    await uploadString(storageRef, imageValue, "data_url");
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  };

  const handleFileChange = async (e, field = "poster") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const preview = await processImageUpload(file);
      if (field === "poster") {
        setFormData((prev) => ({ ...prev, poster: preview }));
      } else {
        setEditingContest((prev) => (prev ? { ...prev, poster: preview } : prev));
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Error processing image. Please try again.");
    } finally {
      e.target.value = "";
    }
  };

  const filteredContests = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return contests.filter((contest) => {
      return (
        contest.title.toLowerCase().includes(term) ||
        contest.description.toLowerCase().includes(term) ||
        (contest.location || "").toLowerCase().includes(term) ||
        (contest.date || "").toLowerCase().includes(term) ||
        (contest.time || "").toLowerCase().includes(term)
      );
    });
  }, [contests, searchTerm]);

  const sortedContests = useMemo(() => {
    const data = [...filteredContests];
    if (sortOption === "titleAsc") {
      return data.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortOption === "titleDesc") {
      return data.sort((a, b) => b.title.localeCompare(a.title));
    }
    if (sortOption === "dateDesc") {
      return data.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    }
    if (sortOption === "dateAsc") {
      return data.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    }
    return data;
  }, [filteredContests, sortOption]);

  const resetForm = () => {
    setFormData(getInitialFormState());
  };

  const optionalOrNull = (value) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateContest(formData);
    if (error) {
      alert(error);
      return;
    }
    setIsSubmitting(true);

    try {
      const nextId =
        contests.reduce((maxId, contest) => (contest.id > maxId ? contest.id : maxId), 0) + 1;
      const basePath = `posters`;
      const posterUrl = await uploadImageToStorage(
        formData.poster,
        `${basePath}/poster_${nextId}.jpg`
      );

      await addDoc(contestCollection, {
        id: nextId,
        type: "banner",
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: optionalOrNull(formData.location),
        date: optionalOrNull(formData.date),
        time: optionalOrNull(formData.time),
        poster: posterUrl ?? null
      });

      alert("Contest added successfully!");
      resetForm();
      navigate("/contest");
    } catch (error) {
      console.error("Error adding contest:", error);
      alert("Unable to add contest. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (contest) => {
    setEditingId(contest.docId);
    setEditingContest({ ...contest });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContest(null);
  };

  const handleSaveEdit = async () => {
    if (!editingContest || !editingContest.docId) return;
    const error = validateContest(editingContest);
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = doc(db, "contests", editingContest.docId);
      const basePath = `posters`;
      const posterUrl = await uploadImageToStorage(
        editingContest.poster,
        `${basePath}/poster_${editingContest.id}.jpg`
      );

      await updateDoc(docRef, {
        title: editingContest.title.trim(),
        description: editingContest.description.trim(),
        location: optionalOrNull(editingContest.location || ""),
        date: optionalOrNull(editingContest.date || ""),
        time: optionalOrNull(editingContest.time || ""),
        poster: posterUrl ?? null
      });

      alert("Contest updated successfully!");
      handleCancelEdit();
    } catch (error) {
      console.error("Error updating contest:", error);
      alert("Unable to update contest. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (contest) => {
    if (!contest?.docId) return;
    if (!window.confirm("Are you sure you want to delete this contest entry?")) return;

    try {
      await deleteDoc(doc(db, "contests", contest.docId));
      alert("Contest deleted successfully!");
    } catch (error) {
      console.error("Error deleting contest:", error);
      alert("Unable to delete contest. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditFieldChange = (field, value) => {
    setEditingContest((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handlePosterClick = (posterUrl) => {
    if (!posterUrl) return;
    setModalImage(posterUrl);
    setShowImageModal(true);
  };

  return (
    <div className="contest-container">
      <header>
        <div className="contest-logo-text">Contest</div>
      </header>

      {!isAddRoute && (
        <div className="contest-add-button-container">
          <button
            className="contest-add-button"
            onClick={() => {
              resetForm();
              navigate("/contest/add");
            }}
          >
            Add Slide
          </button>
        </div>
      )}

      {!isAddRoute ? (
        <div className="contest-data-container">
            <div className="contest-control-panel">
              <div className="contest-search-wrapper">
                <svg
                  className="contest-search-icon"
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
                  className="contest-search-input"
                  placeholder="Search by Title, Description, Location, Date or Time"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="contest-sort-wrapper">
                <Select
                  className="contest-react-select"
                  classNamePrefix="contest-react-select"
                  isSearchable={false}
                  value={SORT_OPTIONS.find((option) => option.value === sortOption)}
                  options={SORT_OPTIONS}
                  onChange={(option) => setSortOption(option?.value || "titleAsc")}
                />
              </div>
            </div>

            {dataError && <div className="contest-error-message">{dataError}</div>}
            {isLoading ? (
              <div className="contest-status-message">Loading contests...</div>
            ) : sortedContests.length === 0 ? (
              <div className="contest-status-message">No contests added yet.</div>
            ) : (
              <div className="contest-table-container">
                <table className="contest-table">
                  <thead>
                    <tr>
                      <th className="contest-sl-no-header">Sl No.</th>
                      <th>Type</th>
                      <th>Poster Image</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Location</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedContests.map((contest, index) => (
                      <tr key={contest.docId || contest.id}>
                        <td className="contest-sl-no-cell">{index + 1}</td>
                        <td className="contest-type-cell">Banner</td>
                        <td className="contest-image-cell">
                          {editingId === contest.docId ? (
                            <div className="contest-edit-image-container">
                              {editingContest?.poster ? (
                                <img
                                  src={editingContest.poster}
                                  alt="poster"
                                  className="contest-table-image"
                                  onDoubleClick={() =>
                                    document
                                      .getElementById(`poster-upload-${contest.id}`)
                                      ?.click()
                                  }
                                />
                              ) : (
                                <span className="contest-empty-state">Add poster</span>
                              )}
                              <input
                                id={`poster-upload-${contest.id}`}
                                type="file"
                                accept="image/*"
                                onChange={(event) => handleFileChange(event, "posterEdit")}
                                style={{ display: "none" }}
                              />
                              <div className="contest-image-edit-hint">
                                Double-click to change
                              </div>
                            </div>
                          ) : contest.poster ? (
                            <img
                              src={contest.poster}
                              alt="poster"
                              className="contest-table-image"
                              onClick={() => handlePosterClick(contest.poster)}
                            />
                          ) : (
                            <span className="contest-empty-state">No image</span>
                          )}
                        </td>
                        <td>
                          {editingId === contest.docId ? (
                            <input
                              type="text"
                              className="contest-inline-input"
                              value={editingContest?.title || ""}
                              onChange={(e) => handleEditFieldChange("title", e.target.value)}
                            />
                          ) : (
                            contest.title || "—"
                          )}
                        </td>
                        <td className="contest-description-cell">
                          {editingId === contest.docId ? (
                            <textarea
                              className="contest-inline-textarea"
                              value={editingContest?.description || ""}
                              onChange={(e) =>
                                handleEditFieldChange("description", e.target.value)
                              }
                              rows="3"
                            />
                          ) : (
                            <>
                              <div
                                className={`contest-description-text ${
                                  expandedDescriptions[contest.docId] ? "expanded" : ""
                                }`}
                              >
                                {contest.description || "—"}
                              </div>
                              {contest.description && contest.description.length > 120 && (
                                <button
                                  type="button"
                                  className="contest-description-toggle"
                                  onClick={() => toggleDescription(contest.docId)}
                                >
                                  {expandedDescriptions[contest.docId] ? "Show less" : "Show more"}
                                </button>
                              )}
                            </>
                          )}
                        </td>
                        <td>
                          {editingId === contest.docId ? (
                            <input
                              type="text"
                              className="contest-inline-input"
                              value={editingContest?.location || ""}
                              onChange={(e) => handleEditFieldChange("location", e.target.value)}
                              placeholder="Optional"
                            />
                          ) : (
                            contest.location || "—"
                          )}
                        </td>
                        <td>
                          {editingId === contest.docId ? (
                            <input
                              type="text"
                              className="contest-inline-input"
                              value={editingContest?.date || ""}
                              onChange={(e) => handleEditFieldChange("date", e.target.value)}
                              placeholder="Optional"
                            />
                          ) : (
                            contest.date || "—"
                          )}
                        </td>
                        <td>
                          {editingId === contest.docId ? (
                            <input
                              type="text"
                              className="contest-inline-input"
                              value={editingContest?.time || ""}
                              onChange={(e) => handleEditFieldChange("time", e.target.value)}
                              placeholder="Optional"
                            />
                          ) : (
                            contest.time || "—"
                          )}
                        </td>
                        <td>
                          <div className="contest-action-buttons">
                            {editingId === contest.docId ? (
                              <>
                                <button
                                  className="contest-save-button"
                                  onClick={handleSaveEdit}
                                  disabled={isSubmitting}
                                >
                                  Save
                                </button>
                                <button
                                  className="contest-cancel-button"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="contest-edit-button"
                                  onClick={() => handleEdit(contest)}
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
                                  className="contest-delete-button"
                                  onClick={() => handleDelete(contest)}
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
        <div className="contest-form-container">
          <div className="contest-form-header">
            <h3>Add New Slide</h3>
            <button
              className="contest-back-button"
              onClick={() => {
                resetForm();
                navigate("/contest");
              }}
            >
              Back
            </button>
          </div>

          <form className="contest-form" onSubmit={handleSubmit}>
            <div className="contest-form-row">
              <div className="contest-form-group">
                <label className="contest-form-label">Type</label>
                <div className="contest-type-static">Banner (auto)</div>
              </div>
            </div>

            <div className="contest-form-row">
              <div className="contest-form-group">
                <label className="contest-form-label" htmlFor="contestTitle">
                  Title
                </label>
                <input
                  id="contestTitle"
                  type="text"
                  className="contest-form-input"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter title"
                />
              </div>
              <div className="contest-form-group">
                <label className="contest-form-label" htmlFor="contestLocation">
                  Location (Optional)
                </label>
                <input
                  id="contestLocation"
                  type="text"
                  className="contest-form-input"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div className="contest-form-row">
              <div className="contest-form-group">
                <label className="contest-form-label" htmlFor="contestDate">
                  Date (Optional)
                </label>
                <input
                  id="contestDate"
                  type="text"
                  className="contest-form-input"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  placeholder="Enter date"
                />
              </div>
              <div className="contest-form-group">
                <label className="contest-form-label" htmlFor="contestTime">
                  Time (Optional)
                </label>
                <input
                  id="contestTime"
                  type="text"
                  className="contest-form-input"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  placeholder="Enter time"
                />
              </div>
            </div>

            <div className="contest-form-row">
              <div className="contest-form-group contest-form-group-full">
                <label className="contest-form-label" htmlFor="contestDescription">
                  Description
                </label>
                <textarea
                  id="contestDescription"
                  className="contest-form-textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows="4"
                  placeholder="Enter description"
                />
              </div>
            </div>

            <div className="contest-form-row">
              <div className="contest-form-group contest-form-group-full">
                <label className="contest-form-label" htmlFor="contestPoster">
                  Poster Image
                </label>
                <div className="contest-file-upload-container">
                  <input
                    id="contestPoster"
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleFileChange(event)}
                    className="contest-file-input"
                  />
                  {formData.poster && (
                    <div className="contest-image-preview">
                      <img src={formData.poster} alt="Poster preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="contest-form-row contest-form-submit-row">
              <button
                type="submit"
                className="contest-form-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showImageModal && (
        <div className="contest-image-modal" onClick={() => setShowImageModal(false)}>
          <div className="contest-image-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="contest-image-modal-close" onClick={() => setShowImageModal(false)}>
              &times;
            </span>
            <img src={modalImage} alt="Poster" className="contest-modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Contest;

