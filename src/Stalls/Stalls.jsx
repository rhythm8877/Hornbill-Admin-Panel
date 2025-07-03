"use client";

import { useState } from "react";
import "./Stalls.css";

const Stalls = () => {
  const [isFormView, setIsFormView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStall, setEditingStall] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [modalPermission, setModalPermission] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    stallName: "",
    ownerName: "",
    phoneNumber: "",
    stallAddress: "",
    permission: null,
    permissionPreview: ""
  });

  // Dummy stall data
  const [stallData, setStallData] = useState([
    {
      id: 1,
      stallName: "Food Corner",
      stallAddress: "Block A, Near Main Gate",
      ownerName: "Rajesh Kumar",
      phoneNumber: "9876543210",
      permission: ""
    },
    {
      id: 2,
      stallName: "Craft Gallery",
      stallAddress: "Block B, Central Area",
      ownerName: "Priya Sharma",
      phoneNumber: "9876543211",
      permission: ""
    },
    {
      id: 3,
      stallName: "Handloom Expo",
      stallAddress: "Block C, East Wing",
      ownerName: "Amit Singh",
      phoneNumber: "9876543212",
      permission: ""
    },
    {
      id: 4,
      stallName: "Art & Decor",
      stallAddress: "Block D, West Wing",
      ownerName: "Meera Patel",
      phoneNumber: "9876543213",
      permission: ""
    },
    {
      id: 5,
      stallName: "Traditional Jewelry",
      stallAddress: "Block E, South Corner",
      ownerName: "Vikram Joshi",
      phoneNumber: "9876543214",
      permission: ""
    }
  ]);

  // Handle file upload and compression
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only PDF or DOC/DOCX files.');
      return;
    }

    try {
      // For PDF/DOC files, we don't compress but we can limit the size
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB.');
        return;
      }

      // Create preview text (just the file name for documents)
      const previewText = file.name;

      setFormData(prev => ({
        ...prev,
        permission: file,
        permissionPreview: previewText
      }));
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    }
  };

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
  const handleSubmit = (e) => {
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
    if (!formData.stallAddress.trim()) {
      alert("Please enter stall address");
      return;
    }
    if (!formData.permission) {
      alert("Please upload permission document");
      return;
    }

    if (editingStall) {
      // Update existing stall
      setStallData(prev => prev.map(stall =>
        stall.id === editingStall.id
          ? {
              ...stall,
              stallName: formData.stallName,
              stallAddress: formData.stallAddress,
              ownerName: formData.ownerName,
              phoneNumber: formData.phoneNumber,
              permission: formData.permissionPreview || stall.permission
            }
          : stall
      ));
      alert("Stall updated successfully!");
      setEditingStall(null);
    } else {
      // Add new stall
      const newStall = {
        id: Date.now(),
        stallName: formData.stallName,
        stallAddress: formData.stallAddress,
        ownerName: formData.ownerName,
        phoneNumber: formData.phoneNumber,
        permission: formData.permissionPreview
      };
      setStallData(prev => [...prev, newStall]);
      alert("Stall added successfully!");
    }

    // Reset form
    resetForm();
    setIsFormView(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      stallName: "",
      ownerName: "",
      phoneNumber: "",
      stallAddress: "",
      permission: null,
      permissionPreview: ""
    });
    setEditingStall(null);
  };

  // Handle inline edit
  const handleInlineEdit = (stall) => {
    setEditingRowId(stall.id);
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
    if (!editingStall.stallAddress.trim()) {
      alert("Please enter stall address");
      return;
    }

    setStallData(prev => prev.map(stall =>
      stall.id === editingStall.id ? editingStall : stall
    ));
    setEditingRowId(null);
    setEditingStall(null);
    alert("Stall updated successfully!");
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
  const handleDelete = (stallId) => {
    if (window.confirm("Are you sure you want to delete this stall?")) {
      setStallData(prev => prev.filter(stall => stall.id !== stallId));
      alert("Stall deleted successfully!");
    }
  };

  // Handle permission modal
  const handlePermissionClick = (permissionUrl) => {
    if (permissionUrl) {
      setModalPermission(permissionUrl);
      setShowPermissionModal(true);
    } else {
      alert("No permission document uploaded yet.");
    }
  };

  return (
    <div className="stalls-container">
      <header>
        <div className="stalls-logo-text">Stalls</div>
      </header>

      {/* Add Stall Button - Outside Card */}
      {!isFormView && (
        <div className="stalls-add-button-container">
          <button
            className="stalls-add-button"
            onClick={() => {
              resetForm();
              setIsFormView(true);
            }}
          >
            Add Stall
          </button>
        </div>
      )}

      <div className="stalls-data-container">
        {!isFormView ? (
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
                    <th>Stall Address</th>
                    <th>Owner's Name</th>
                    <th>Phone Number</th>
                    <th>Permission</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStalls.map((stall, index) => (
                    <tr key={stall.id}>
                      <td className="stalls-sl-no-cell">{index + 1}</td>
                      <td>
                        {editingRowId === stall.id ? (
                          <input
                            type="text"
                            className="stalls-inline-input"
                            value={editingStall.stallName}
                            onChange={(e) => handleInlineFieldChange('stallName', e.target.value)}
                          />
                        ) : (
                          stall.stallName
                        )}
                      </td>
                      <td>
                        {editingRowId === stall.id ? (
                          <input
                            type="text"
                            className="stalls-inline-input"
                            value={editingStall.stallAddress}
                            onChange={(e) => handleInlineFieldChange('stallAddress', e.target.value)}
                          />
                        ) : (
                          stall.stallAddress
                        )}
                      </td>
                      <td>
                        {editingRowId === stall.id ? (
                          <input
                            type="text"
                            className="stalls-inline-input"
                            value={editingStall.ownerName}
                            onChange={(e) => handleInlineFieldChange('ownerName', e.target.value)}
                          />
                        ) : (
                          stall.ownerName
                        )}
                      </td>
                      <td>
                        {editingRowId === stall.id ? (
                          <input
                            type="text"
                            className="stalls-inline-input stalls-phone-input"
                            value={editingStall.phoneNumber}
                            onChange={(e) => handleInlineFieldChange('phoneNumber', e.target.value)}
                            placeholder="10 digits"
                            maxLength="10"
                          />
                        ) : (
                          `+91-${stall.phoneNumber}`
                        )}
                      </td>
                      <td>
                        {stall.permission && (
                          <button
                            className="stalls-view-permission-button"
                            onClick={() => handlePermissionClick(stall.permission)}
                          >
                            View
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="stalls-action-buttons">
                          {editingRowId === stall.id ? (
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button
                                className="stalls-delete-button"
                                onClick={() => handleDelete(stall.id)}
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
          /* Stall Form */
          <div className="stalls-form-container">
            <div className="stalls-form-header">
              <h3>{editingStall ? 'Edit Stall' : 'Add New Stall'}</h3>
              <button
                className="stalls-back-button"
                onClick={() => {
                  resetForm();
                  setIsFormView(false);
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

                <div className="stalls-form-group">
                  <label className="stalls-form-label" htmlFor="stallAddress">Stall Address:</label>
                  <input
                    id="stallAddress"
                    type="text"
                    className="stalls-form-text-input"
                    value={formData.stallAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, stallAddress: e.target.value }))}
                    placeholder="Enter stall address"
                  />
                </div>
              </div>

              <div className="stalls-form-row">
                <div className="stalls-form-group stalls-form-group-full-width">
                  <label className="stalls-form-label" htmlFor="permission">Permission Document:</label>
                  <div className="stalls-file-upload-container">
                    <input
                      id="permission"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="stalls-file-input"
                    />
                    {formData.permissionPreview && (
                      <div className="stalls-file-preview">
                        <span className="stalls-file-name">{formData.permissionPreview}</span>
                      </div>
                    )}
                  </div>
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

      {/* Permission Document Modal */}
      {showPermissionModal && (
        <div className="stalls-permission-modal" onClick={() => setShowPermissionModal(false)}>
          <div className="stalls-permission-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="stalls-permission-modal-close" onClick={() => setShowPermissionModal(false)}>&times;</span>
            <div className="stalls-permission-document">
              <p>Document: {modalPermission}</p>
              <p>Note: This is a placeholder for the document viewer. In a real implementation, this would show the actual document.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stalls;
