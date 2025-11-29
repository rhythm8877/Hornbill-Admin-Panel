"use client";

import { useEffect, useMemo, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
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
import "./Stalls.css";
import { db } from "../firebaseConfig";

const Stalls = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStall, setEditingStall] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [formData, setFormData] = useState({
    stallName: "",
    ownerName: "",
    phoneNumber: ""
  });
  const [stallData, setStallData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const isAddRoute = Boolean(useMatch("/festival/stalls/add"));

  const stallsCollection = useMemo(() => collection(db, "stalls"), []);

  useEffect(() => {
    const stallsQuery = query(stallsCollection, orderBy("stallName", "asc"));
    const unsubscribe = onSnapshot(
      stallsQuery,
      (snapshot) => {
        const records = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          return {
            docId: docSnap.id,
            stallName: data.stallName || "—",
            ownerName: data.owner || "—",
            phoneNumber: data.phone || ""
          };
        });
        setStallData(records);
      },
      (error) => {
        console.error("Error fetching stalls:", error);
        alert("Failed to load stalls. Please try again.");
      }
    );

    return () => unsubscribe();
  }, [stallsCollection]);

  // Handle phone number input (numbers only, max 10 digits)
  const handlePhoneChange = (value) => {
    // Remove all non-numeric characters and limit to 10 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, phoneNumber: numericValue }));
  };

  // Filter stalls based on search term
  const filteredStalls = stallData.filter(stall => {
    return stall.stallName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           stall.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           stall.phoneNumber.includes(searchTerm);
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.stallName.trim()) {
      alert("Please enter stall name");
      return;
    }
    if (!formData.ownerName.trim()) {
      alert("Please enter owner's name");
      return;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingStall && editingStall.docId) {
        const stallRef = doc(db, "stalls", editingStall.docId);
        await updateDoc(stallRef, {
          stallName: formData.stallName.trim(),
          owner: formData.ownerName.trim(),
          phone: formData.phoneNumber.trim()
        });
        alert("Stall updated successfully!");
      } else {
        await addDoc(stallsCollection, {
          stallName: formData.stallName.trim(),
          owner: formData.ownerName.trim(),
          phone: formData.phoneNumber.trim()
        });
        alert("Stall added successfully!");
      }

      // Reset form
      resetForm();
      navigate("/festival/stalls");
    } catch (error) {
      console.error("Error saving stall:", error);
      alert("Unable to save stall. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      stallName: "",
      ownerName: "",
      phoneNumber: ""
    });
    setEditingStall(null);
  };

  // Handle inline edit
  const handleInlineEdit = (stall) => {
    setEditingRowId(stall.docId);
    setEditingStall({ ...stall });
  };

  // Handle save inline edit
  const handleSaveInlineEdit = () => {
    if (!editingStall.stallName.trim()) {
      alert("Please enter stall name");
      return;
    }
    if (!editingStall.ownerName.trim()) {
      alert("Please enter owner's name");
      return;
    }
    if (!editingStall.phoneNumber.trim() || editingStall.phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    const saveChanges = async () => {
      try {
        const stallRef = doc(db, "stalls", editingStall.docId);
        await updateDoc(stallRef, {
          stallName: editingStall.stallName.trim(),
          owner: editingStall.ownerName.trim(),
          phone: editingStall.phoneNumber.trim()
        });
        setEditingRowId(null);
        setEditingStall(null);
        alert("Stall updated successfully!");
      } catch (error) {
        console.error("Error updating stall:", error);
        alert("Unable to update stall. Please try again.");
      }
    };

    void saveChanges();
  };

  // Handle cancel inline edit
  const handleCancelInlineEdit = () => {
    setEditingRowId(null);
    setEditingStall(null);
  };

  // Handle inline field change
  const handleInlineFieldChange = (field, value) => {
    if (field === 'phoneNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setEditingStall(prev => ({ ...prev, [field]: value }));
  };

  // Handle delete stall
  const handleDelete = (stall) => {
    if (!stall?.docId) return;
    if (!window.confirm("Are you sure you want to delete this stall?")) return;

    const deleteStall = async () => {
      try {
        await deleteDoc(doc(db, "stalls", stall.docId));
        alert("Stall deleted successfully!");
      } catch (error) {
        console.error("Error deleting stall:", error);
        alert("Unable to delete stall. Please try again.");
      }
    };

    void deleteStall();
  };

  return (
    <div className="stalls-container">
      <header>
        <div className="stalls-logo-text">Stalls</div>
      </header>

      {/* Add Stall Button - Outside Card */}
      {!isAddRoute && (
        <div className="stalls-add-button-container">
          <button
            className="stalls-add-button"
            onClick={() => {
              resetForm();
              navigate("/festival/stalls/add");
            }}
          >
            Add Stall
          </button>
        </div>
      )}

      <div className="stalls-data-container">
        {!isAddRoute ? (
          <>
            {/* Search */}
            <div className="stalls-control-panel-filters">
              <div className="stalls-search-container">
                <div className="stalls-search-input-wrapper">
                  <svg className="stalls-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    className="stalls-search-input"
                    placeholder="Search by Stall Name/Owner's Name/Phone Number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Stalls Table */}
            <div className="stalls-table-container">
              <table className="stalls-table">
                <thead>
                  <tr>
                    <th className="stalls-sl-no-header">Sl No.</th>
                    <th>Stall Name</th>
                    <th>Owner's Name</th>
                    <th>Phone Number</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStalls.map((stall, index) => (
                    <tr key={stall.docId || index}>
                      <td className="stalls-sl-no-cell">{index + 1}</td>
                      <td>
                        {editingRowId === stall.docId ? (
                          <input
                            type="text"
                            className="stalls-inline-input"
                            value={editingStall.stallName}
                            onChange={(e) => handleInlineFieldChange("stallName", e.target.value)}
                          />
                        ) : (
                          stall.stallName
                        )}
                      </td>
                      <td>
                        {editingRowId === stall.docId ? (
                          <input
                            type="text"
                            className="stalls-inline-input"
                            value={editingStall.ownerName}
                            onChange={(e) => handleInlineFieldChange("ownerName", e.target.value)}
                          />
                        ) : (
                          stall.ownerName
                        )}
                      </td>
                      <td>
                        {editingRowId === stall.docId ? (
                          <input
                            type="text"
                            className="stalls-inline-input stalls-phone-input"
                            value={editingStall.phoneNumber}
                            onChange={(e) =>
                              handleInlineFieldChange("phoneNumber", e.target.value)
                            }
                            placeholder="10 digits"
                            maxLength="10"
                          />
                        ) : (
                          `+91-${stall.phoneNumber}`
                        )}
                      </td>
                      <td>
                        <div className="stalls-action-buttons">
                          {editingRowId === stall.docId ? (
                            <>
                              <button
                                className="stalls-save-button"
                                onClick={handleSaveInlineEdit}
                                title="Save"
                              >
                                Save
                              </button>
                              <button
                                className="stalls-cancel-button"
                                onClick={handleCancelInlineEdit}
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="stalls-edit-button"
                                onClick={() => handleInlineEdit(stall)}
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
                                className="stalls-delete-button"
                                onClick={() => handleDelete(stall)}
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
          </>
        ) : (
          /* Stall Form */
          <div className="stalls-form-container">
            <div className="stalls-form-header">
              <h3>{editingStall ? 'Edit Stall' : 'Add New Stall'}</h3>
              <button
                className="stalls-back-button"
                onClick={() => {
                  resetForm();
                  navigate("/festival/stalls");
                }}
              >
                Back
              </button>
            </div>

            <form className="stalls-form" onSubmit={handleSubmit}>
              <div className="stalls-form-row">
                <div className="stalls-form-group">
                  <label className="stalls-form-label" htmlFor="stallName">Stall Name:</label>
                  <input
                    id="stallName"
                    type="text"
                    className="stalls-form-text-input"
                    value={formData.stallName}
                    onChange={(e) => setFormData(prev => ({ ...prev, stallName: e.target.value }))}
                    placeholder="Enter stall name"
                  />
                </div>

                <div className="stalls-form-group">
                  <label className="stalls-form-label" htmlFor="ownerName">Owner's Name:</label>
                  <input
                    id="ownerName"
                    type="text"
                    className="stalls-form-text-input"
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="Enter owner's name"
                  />
                </div>
              </div>

              <div className="stalls-form-row">
                <div className="stalls-form-group">
                  <label className="stalls-form-label" htmlFor="phoneNumber">Phone Number:</label>
                  <input
                    id="phoneNumber"
                    type="text"
                    className="stalls-form-text-input"
                    value={formData.phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter 10-digit phone number"
                    maxLength="10"
                  />
                </div>

              </div>

              <div className="stalls-form-row stalls-form-submit-row">
                <button type="submit" className="stalls-form-submit-button">
                  {editingStall ? 'Update Stall' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};

export default Stalls;
