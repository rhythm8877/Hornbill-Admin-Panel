"use client";

import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { getDownloadURL, listAll, ref as storageRef } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import Select from "react-select";
import { db, storage } from "../firebaseConfig";
import "./Hornbill.css";

// Dummy data
const DUMMY_HORNBILL_DATA = [
  {
    id: 1,
    docId: "1",
    title: "Opening Ceremony",
    timeline: "10:00 AM - 12:00 PM",
    pdf: "https://example.com/pdf1.pdf",
    day: "Day 1",
    date: "2024-12-01"
  },
  {
    id: 2,
    docId: "2",
    title: "Cultural Performances",
    timeline: "2:00 PM - 5:00 PM",
    pdf: "https://example.com/pdf2.pdf",
    day: "Day 1",
    date: "2024-12-01"
  },
  {
    id: 3,
    docId: "3",
    title: "Traditional Food Festival",
    timeline: "11:00 AM - 8:00 PM",
    pdf: "",
    day: "Day 2",
    date: "2024-12-02"
  },
  {
    id: 4,
    docId: "4",
    title: "Music Concert",
    timeline: "6:00 PM - 10:00 PM",
    pdf: "https://example.com/pdf4.pdf",
    day: "Day 2",
    date: "2024-12-02"
  },
  {
    id: 5,
    docId: "5",
    title: "Art & Craft Exhibition",
    timeline: "9:00 AM - 6:00 PM",
    pdf: "https://example.com/pdf5.pdf",
    day: "Day 3",
    date: "2024-12-03"
  },
  {
    id: 6,
    docId: "6",
    title: "Closing Ceremony",
    timeline: "7:00 PM - 9:00 PM",
    pdf: "https://example.com/pdf6.pdf",
    day: "Day 10",
    date: "2024-12-10"
  }
];

const getInitialFormState = () => ({
  day: "",
  date: "",
  pdf: "",
  timeline: [
    {
      icon: "",
      time: "",
      title: "",
      description: ""
    }
  ]
});

const Hornbill = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hornbillData, setHornbillData] = useState([]);
  const [editingHornbill, setEditingHornbill] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataError, setDataError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(getInitialFormState);
  const [availableIcons, setAvailableIcons] = useState([]);
  const [isLoadingIcons, setIsLoadingIcons] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  const navigate = useNavigate();
  const isAddRoute = Boolean(useMatch("/festival/hornbill/add"));
  const hornbillDocRef = doc(db, "hornbill", "latest");

  // Fetch available icons from Firebase Storage
  useEffect(() => {
    if (isAddRoute) {
      const fetchIcons = async () => {
        setIsLoadingIcons(true);
        try {
          const iconsRef = storageRef(storage, "icons/");
          const result = await listAll(iconsRef);
          
          const iconPromises = result.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            const name = itemRef.name;
            return {
              value: url,
              label: name.replace(/\.[^/.]+$/, ""), // Remove file extension
              url: url,
              name: name
            };
          });
          
          const icons = await Promise.all(iconPromises);
          setAvailableIcons(icons);
        } catch (error) {
          console.error("Error fetching icons:", error);
          setAvailableIcons([]);
        } finally {
          setIsLoadingIcons(false);
        }
      };
      
      fetchIcons();
    }
  }, [isAddRoute]);

  // Fetch hornbill data from Firebase
  useEffect(() => {
    if (!isAddRoute) {
      const unsubscribe = onSnapshot(
        hornbillDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const dataArray = data.data || [];
            
            // Transform Firebase data to table format - one row per day
            const transformedData = [];
            dataArray.forEach((item, index) => {
              if (item && (item.timeline || item.date || item.pdf)) {
                const day = index + 1;
                transformedData.push({
                  docId: `day-${day}`,
                  id: day,
                  day: `Day ${day}`,
                  dayNumber: day,
                  date: item.date || "—",
                  pdf: item.pdf || "",
                  timeline: item.timeline || [], // Store full timeline array
                  timelineCount: item.timeline ? item.timeline.length : 0
                });
              }
            });
            
            setHornbillData(transformedData);
          } else {
            setHornbillData([]);
          }
          setIsLoading(false);
          setDataError("");
        },
        (error) => {
          console.error("Error fetching hornbill data:", error);
          setDataError("Failed to load hornbill data. Please try again.");
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [isAddRoute, hornbillDocRef]);

  // Filter hornbill data based on search term
  const filteredHornbill = hornbillData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const dayMatch = (item.day || "").toLowerCase().includes(searchLower);
    const dateMatch = (item.date || "").toLowerCase().includes(searchLower);
    const timelineMatch = item.timeline && item.timeline.some((entry) => 
      (entry.title || "").toLowerCase().includes(searchLower) ||
      (entry.time || "").toLowerCase().includes(searchLower)
    );
    return dayMatch || dateMatch || timelineMatch;
  });

  // Handle timeline view
  const handleViewTimeline = (item) => {
    setSelectedTimeline(item);
    setIsTimelineModalOpen(true);
  };

  const handleCloseTimelineModal = () => {
    setIsTimelineModalOpen(false);
    setSelectedTimeline(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.docId || item.id);
    setEditingHornbill({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingHornbill(null);
  };

  const handleSaveEdit = async () => {
    if (!editingHornbill) return;
    
    setIsSubmitting(true);
    try {
      // Get current document
      const docSnap = await getDoc(hornbillDocRef);
      if (!docSnap.exists()) {
        alert("Document not found. Please try again.");
        return;
      }

      const currentData = docSnap.data();
      const dataArray = currentData.data || [];
      const dayIndex = editingHornbill.dayNumber - 1;

      if (dayIndex < 0 || dayIndex >= dataArray.length) {
        alert("Invalid day index. Please try again.");
        return;
      }

      // Update the specific day's data
      const updatedItem = {
        date: editingHornbill.date || "",
        day: editingHornbill.dayNumber.toString(),
        timeline: editingHornbill.timeline || []
      };

      if (editingHornbill.pdf) {
        updatedItem.pdf = editingHornbill.pdf;
      }

      dataArray[dayIndex] = updatedItem;

      // Update Firebase
      await updateDoc(hornbillDocRef, {
        data: dataArray
      });

      alert("Hornbill data updated successfully!");
      handleCancelEdit();
    } catch (error) {
      console.error("Error updating hornbill data:", error);
      alert("Unable to update hornbill data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!item?.dayNumber) return;
    if (!window.confirm(`Are you sure you want to delete ${item.day}? This will remove all timeline entries for this day.`)) return;

    try {
      // Get current document
      const docSnap = await getDoc(hornbillDocRef);
      if (!docSnap.exists()) {
        alert("Document not found. Please try again.");
        return;
      }

      const currentData = docSnap.data();
      const dataArray = currentData.data || [];
      const dayIndex = item.dayNumber - 1;

      if (dayIndex < 0 || dayIndex >= dataArray.length) {
        alert("Invalid day index. Please try again.");
        return;
      }

      // Set the day's data to null or remove it
      dataArray[dayIndex] = null;

      // Update Firebase
      await updateDoc(hornbillDocRef, {
        data: dataArray
      });

      alert("Hornbill data deleted successfully!");
    } catch (error) {
      console.error("Error deleting hornbill data:", error);
      alert("Unable to delete hornbill data. Please try again.");
    }
  };

  const handleEditFieldChange = (field, value) => {
    setEditingHornbill((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handlePDFClick = (pdfUrl) => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  };

  // Form handlers
  const resetForm = () => {
    setFormData(getInitialFormState());
  };

  const handleFormFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTimelineChange = (index, field, value) => {
    setFormData((prev) => {
      const newTimeline = [...prev.timeline];
      newTimeline[index] = {
        ...newTimeline[index],
        [field]: value
      };
      return { ...prev, timeline: newTimeline };
    });
  };

  const addTimelineEntry = () => {
    setFormData((prev) => ({
      ...prev,
      timeline: [
        ...prev.timeline,
        {
          icon: "",
          time: "",
          title: "",
          description: ""
        }
      ]
    }));
  };

  const removeTimelineEntry = (index) => {
    if (formData.timeline.length > 1) {
      setFormData((prev) => ({
        ...prev,
        timeline: prev.timeline.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    if (!formData.day || !formData.day.trim()) {
      return "Please select a day.";
    }
    if (!formData.date || !formData.date.trim()) {
      return "Please enter a date.";
    }
    if (formData.timeline.length === 0) {
      return "Please add at least one timeline entry.";
    }
    for (let i = 0; i < formData.timeline.length; i++) {
      const entry = formData.timeline[i];
      if (!entry.time || !entry.time.trim()) {
        return `Please enter time for timeline entry ${i + 1}.`;
      }
      if (!entry.title || !entry.title.trim()) {
        return `Please enter title for timeline entry ${i + 1}.`;
      }
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the current document
      const docSnap = await getDoc(hornbillDocRef);
      const currentData = docSnap.exists() ? docSnap.data() : { data: [] };
      const dataArray = currentData.data || [];

      // Calculate the index (day - 1)
      const dayNumber = parseInt(formData.day);
      const index = dayNumber - 1;

      // Prepare the data object
      const dataObject = {
        date: formData.date.trim(),
        day: formData.day.trim()
      };

      // Add PDF only if provided
      if (formData.pdf && formData.pdf.trim()) {
        dataObject.pdf = formData.pdf.trim();
      }

      // Prepare timeline array (remove empty descriptions)
      const timelineArray = formData.timeline.map((entry) => {
        const timelineItem = {
          icon: entry.icon || "",
          time: entry.time.trim(),
          title: entry.title.trim()
        };
        // Add description only if provided
        if (entry.description && entry.description.trim()) {
          timelineItem.description = entry.description.trim();
        }
        return timelineItem;
      });

      dataObject.timeline = timelineArray;

      // Ensure the array is large enough
      while (dataArray.length <= index) {
        dataArray.push(null);
      }

      // Update the specific index
      dataArray[index] = dataObject;

      // Update the document
      if (docSnap.exists()) {
        await updateDoc(hornbillDocRef, {
          data: dataArray
        });
      } else {
        await setDoc(hornbillDocRef, {
          data: dataArray
        });
      }

      alert("Hornbill data added successfully!");
      resetForm();
      navigate("/festival/hornbill");
    } catch (error) {
      console.error("Error adding hornbill data:", error);
      alert("Unable to add hornbill data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom select styles for icon dropdown
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: state.isFocused
        ? "1px solid var(--hornbill-primary-color)"
        : "1px solid var(--hornbill-border-color)",
      borderRadius: "6px",
      fontSize: "14px",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(36, 178, 149, 0.1)"
        : "none",
      "&:hover": {
        borderColor: "var(--hornbill-primary-color)"
      }
    }),
    option: (provided, state) => {
      // Let CSS handle all background colors with !important to override inline styles
      return {
        ...provided,
        color: state.isSelected ? "white" : "#333",
        cursor: "pointer",
        padding: "8px 12px"
      };
    },
    menu: (provided) => ({
      ...provided,
      zIndex: 9999
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "4px"
    })
  };

  // Format icon options for react-select with images
  const iconOptions = availableIcons.map((icon) => ({
    value: icon.url,
    label: icon.label,
    iconUrl: icon.url
  }));

  // Format option label to display image - simple approach like other dropdowns
  const formatOptionLabel = ({ label, iconUrl }) => (
    <div 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "8px",
        pointerEvents: "none"
      }}
    >
      {iconUrl && (
        <img
          src={iconUrl}
          alt={label || ""}
          style={{ 
            width: "24px", 
            height: "24px", 
            objectFit: "contain", 
            flexShrink: 0,
            pointerEvents: "none"
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}
      <span style={{ pointerEvents: "none" }}>{label}</span>
    </div>
  );

  return (
    <div className="hornbill-container">
      <header>
        <div className="hornbill-logo-text">Hornbill</div>
      </header>

      {!isAddRoute && (
        <div className="hornbill-add-button-container">
          <button
            className="hornbill-add-button"
            onClick={() => {
              resetForm();
              navigate("/festival/hornbill/add");
            }}
          >
            Add Data
          </button>
        </div>
      )}

      {!isAddRoute ? (
        <div className="hornbill-data-container">
          {/* Search */}
          <div className="hornbill-control-panel-filters">
            <div className="hornbill-search-container">
              <div className="hornbill-search-input-wrapper">
                <svg
                  className="hornbill-search-icon"
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
                  className="hornbill-search-input"
                  placeholder="Search by Title, Timeline, Day or Date"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Hornbill Table */}
          {dataError && <div className="hornbill-error-message">{dataError}</div>}
          {isLoading ? (
            <div className="hornbill-status-message">Loading hornbill data...</div>
          ) : filteredHornbill.length === 0 ? (
            <div className="hornbill-status-message">No hornbill data found.</div>
          ) : (
            <div className="hornbill-table-container">
              <table className="hornbill-table">
                <thead>
                  <tr>
                    <th className="hornbill-sl-no-header">Sl No.</th>
                    <th>Day</th>
                    <th>Date</th>
                    <th>Timeline</th>
                    <th>PDF</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHornbill.map((item, index) => (
                    <tr key={item.docId || item.id}>
                      <td className="hornbill-sl-no-cell">{index + 1}</td>
                      <td>
                        {editingId === (item.docId || item.id) ? (
                          <input
                            type="text"
                            className="hornbill-inline-input"
                            value={editingHornbill?.day || ""}
                            onChange={(e) => handleEditFieldChange("day", e.target.value)}
                          />
                        ) : (
                          item.day || "—"
                        )}
                      </td>
                      <td>
                        {editingId === (item.docId || item.id) ? (
                          <input
                            type="text"
                            className="hornbill-inline-input"
                            value={editingHornbill?.date || ""}
                            onChange={(e) => handleEditFieldChange("date", e.target.value)}
                          />
                        ) : (
                          item.date || "—"
                        )}
                      </td>
                      <td>
                        {editingId === (item.docId || item.id) ? (
                          <span className="hornbill-empty-state">Edit timeline via form</span>
                        ) : item.timeline && item.timeline.length > 0 ? (
                          <button
                            className="hornbill-timeline-button"
                            onClick={() => handleViewTimeline(item)}
                            title="View Timeline"
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
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            View Timeline ({item.timelineCount})
                          </button>
                        ) : (
                          <span className="hornbill-empty-state">No Timeline</span>
                        )}
                      </td>
                      <td>
                        {editingId === (item.docId || item.id) ? (
                          <input
                            type="text"
                            className="hornbill-inline-input"
                            value={editingHornbill?.pdf || ""}
                            onChange={(e) => handleEditFieldChange("pdf", e.target.value)}
                            placeholder="PDF URL"
                          />
                        ) : item.pdf ? (
                          <button
                            className="hornbill-pdf-button"
                            onClick={() => handlePDFClick(item.pdf)}
                            title="View PDF"
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
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            View PDF
                          </button>
                        ) : (
                          <span className="hornbill-empty-state">No PDF</span>
                        )}
                      </td>
                      <td>
                        <div className="hornbill-action-buttons">
                          {editingId === (item.docId || item.id) ? (
                            <>
                              <button
                                className="hornbill-save-button"
                                onClick={handleSaveEdit}
                                disabled={isSubmitting}
                              >
                                Save
                              </button>
                              <button
                                className="hornbill-cancel-button"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="hornbill-edit-button"
                                onClick={() => handleEdit(item)}
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
                                className="hornbill-delete-button"
                                onClick={() => handleDelete(item)}
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
        <div className="hornbill-form-container">
          <div className="hornbill-form-header">
            <h3>Add New Hornbill Data</h3>
            <button
              className="hornbill-back-button"
              onClick={() => {
                resetForm();
                navigate("/festival/hornbill");
              }}
            >
              Back
            </button>
          </div>

          <form className="hornbill-form" onSubmit={handleSubmit}>
            {/* Day Selection */}
            <div className="hornbill-form-row">
              <div className="hornbill-form-group">
                <label className="hornbill-form-label" htmlFor="day">
                  Day *
                </label>
                <input
                  id="day"
                  type="number"
                  className="hornbill-form-input"
                  value={formData.day}
                  onChange={(e) => handleFormFieldChange("day", e.target.value)}
                  placeholder="Enter day number"
                  min="1"
                  required
                />
              </div>
              <div className="hornbill-form-group">
                <label className="hornbill-form-label" htmlFor="date">
                  Date *
                </label>
                <input
                  id="date"
                  type="text"
                  className="hornbill-form-input"
                  value={formData.date}
                  onChange={(e) => handleFormFieldChange("date", e.target.value)}
                  placeholder="Enter date"
                  required
                />
              </div>
            </div>

            {/* PDF URL (Optional) */}
            <div className="hornbill-form-row">
              <div className="hornbill-form-group hornbill-form-group-full">
                <label className="hornbill-form-label" htmlFor="pdf">
                  PDF URL (Optional)
                </label>
                <input
                  id="pdf"
                  type="url"
                  className="hornbill-form-input"
                  value={formData.pdf}
                  onChange={(e) => handleFormFieldChange("pdf", e.target.value)}
                  placeholder="Enter PDF URL"
                />
              </div>
            </div>

            {/* Timeline Section */}
            <div className="hornbill-form-row">
              <div className="hornbill-form-group hornbill-form-group-full">
                <div className="hornbill-timeline-header">
                  <label className="hornbill-form-label">Timeline *</label>
                  <button
                    type="button"
                    className="hornbill-add-timeline-button"
                    onClick={addTimelineEntry}
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
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Timeline Entry
                  </button>
                </div>

                {formData.timeline.map((entry, index) => (
                  <div key={index} className="hornbill-timeline-entry">
                    <div className="hornbill-timeline-entry-header">
                      <h4>Timeline Entry {index + 1}</h4>
                      {formData.timeline.length > 1 && (
                        <button
                          type="button"
                          className="hornbill-remove-timeline-button"
                          onClick={() => removeTimelineEntry(index)}
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
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="hornbill-form-row">
                      <div className="hornbill-form-group">
                        <label className="hornbill-form-label">
                          Icon *
                        </label>
                        {isLoadingIcons ? (
                          <div className="hornbill-loading-icons">Loading icons...</div>
                        ) : (
                          <Select
                            value={
                              entry.icon
                                ? iconOptions.find((opt) => opt.value === entry.icon) || null
                                : null
                            }
                            onChange={(option) =>
                              handleTimelineChange(index, "icon", option?.value || "")
                            }
                            options={iconOptions}
                            formatOptionLabel={formatOptionLabel}
                            styles={customSelectStyles}
                            isSearchable
                            placeholder="Select an icon"
                            classNamePrefix="hornbill-icon-select"
                          />
                        )}
                        {entry.icon && (
                          <div className="hornbill-selected-icon-preview">
                            <img
                              src={entry.icon}
                              alt="Selected icon"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="hornbill-form-group">
                        <label className="hornbill-form-label">
                          Time *
                        </label>
                        <input
                          type="text"
                          className="hornbill-form-input"
                          value={entry.time}
                          onChange={(e) =>
                            handleTimelineChange(index, "time", e.target.value)
                          }
                          placeholder="Enter time (e.g., 10:00 AM - 12:00 PM)"
                          required
                        />
                      </div>
                    </div>

                    <div className="hornbill-form-row">
                      <div className="hornbill-form-group">
                        <label className="hornbill-form-label">
                          Title *
                        </label>
                        <input
                          type="text"
                          className="hornbill-form-input"
                          value={entry.title}
                          onChange={(e) =>
                            handleTimelineChange(index, "title", e.target.value)
                          }
                          placeholder="Enter title"
                          required
                        />
                      </div>

                      <div className="hornbill-form-group">
                        <label className="hornbill-form-label">
                          Description (Optional)
                        </label>
                        <textarea
                          className="hornbill-form-textarea"
                          value={entry.description}
                          onChange={(e) =>
                            handleTimelineChange(index, "description", e.target.value)
                          }
                          placeholder="Enter description (optional)"
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hornbill-form-row hornbill-form-submit-row">
              <button
                type="submit"
                className="hornbill-form-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timeline Modal */}
      {isTimelineModalOpen && selectedTimeline && (
        <div className="hornbill-modal-overlay" onClick={handleCloseTimelineModal}>
          <div className="hornbill-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="hornbill-modal-header">
              <h3>Timeline - {selectedTimeline.day}</h3>
              <button
                className="hornbill-modal-close"
                onClick={handleCloseTimelineModal}
                title="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="hornbill-modal-body">
              <div className="hornbill-timeline-info">
                <p><strong>Date:</strong> {selectedTimeline.date}</p>
                {selectedTimeline.pdf && (
                  <p>
                    <strong>PDF:</strong>{" "}
                    <a
                      href={selectedTimeline.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hornbill-modal-pdf-link"
                    >
                      View PDF
                    </a>
                  </p>
                )}
              </div>
              {selectedTimeline.timeline && selectedTimeline.timeline.length > 0 ? (
                <div className="hornbill-timeline-list">
                  {selectedTimeline.timeline.map((entry, index) => (
                    <div key={index} className="hornbill-timeline-item">
                      <div className="hornbill-timeline-item-header">
                        {entry.icon && (
                          <img
                            src={entry.icon}
                            alt="Timeline icon"
                            className="hornbill-timeline-icon"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div className="hornbill-timeline-item-details">
                          <div className="hornbill-timeline-item-time">{entry.time || "—"}</div>
                          <div className="hornbill-timeline-item-title">{entry.title || "—"}</div>
                          {entry.description && (
                            <div className="hornbill-timeline-item-description">
                              {entry.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="hornbill-empty-timeline">No timeline entries for this day.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hornbill;
