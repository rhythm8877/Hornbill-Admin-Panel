"use client";

import imageCompression from "browser-image-compression";
import { useState } from "react";
import Select from "react-select";
import "./StudentRegistration.css";

const StudentRegistration = () => {
  const [isFormView, setIsFormView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    photo: null,
    photoPreview: "",
    name: "",
    dob: "",
    phoneNumber: "",
    email: "",
    address: "",
    course: "",
    fatherName: "",
    motherName: ""
  });

  // Dummy student data
  const [studentData, setStudentData] = useState([
    {
      id: 1,
      photo: "https://via.placeholder.com/50x50/28a745/ffffff?text=AS",
      name: "Aarav Sharma",
      course: "BSW",
      fatherName: "Rajesh Sharma",
      motherName: "Priya Sharma",
      dob: "15/03/02",
      email: "aarav.sharma@student.edu",
      phoneNumber: "9123456789",
      address: "123 MG Road, Delhi"
    },
    {
      id: 2,
      photo: "https://via.placeholder.com/50x50/28a745/ffffff?text=SP",
      name: "Sneha Patel",
      course: "MSW",
      fatherName: "Amit Patel",
      motherName: "Kavita Patel",
      dob: "22/07/01",
      email: "sneha.patel@student.edu",
      phoneNumber: "9234567890",
      address: "456 Park Street, Mumbai"
    },
    {
      id: 3,
      photo: "https://via.placeholder.com/50x50/28a745/ffffff?text=RK",
      name: "Rahul Kumar",
      course: "BSW",
      fatherName: "Suresh Kumar",
      motherName: "Sunita Kumar",
      dob: "10/11/02",
      email: "rahul.kumar@student.edu",
      phoneNumber: "9345678901",
      address: "789 Brigade Road, Bangalore"
    },
    {
      id: 4,
      photo: "https://via.placeholder.com/50x50/28a745/ffffff?text=PG",
      name: "Priya Gupta",
      course: "MSW",
      fatherName: "Vikash Gupta",
      motherName: "Meera Gupta",
      dob: "05/09/01",
      email: "priya.gupta@student.edu",
      phoneNumber: "9456789012",
      address: "321 Anna Salai, Chennai"
    },
    {
      id: 5,
      photo: "https://via.placeholder.com/50x50/28a745/ffffff?text=AS",
      name: "Arjun Singh",
      course: "BSW",
      fatherName: "Ravi Singh",
      motherName: "Pooja Singh",
      dob: "18/12/02",
      email: "arjun.singh@student.edu",
      phoneNumber: "9567890123",
      address: "654 Civil Lines, Lucknow"
    },
    {
      id: 6,
      photo: "https://via.placeholder.com/50x50/28a745/ffffff?text=NK",
      name: "Neha Kapoor",
      course: "MSW",
      fatherName: "Anil Kapoor",
      motherName: "Sushma Kapoor",
      dob: "30/04/01",
      email: "neha.kapoor@student.edu",
      phoneNumber: "9678901234",
      address: "987 Sector 17, Chandigarh"
    },
    {
      id: 7,
      photo: "https://via.placeholder.com/50x50/28a745/ffffff?text=VT",
      name: "Vikram Tiwari",
      course: "BSW",
      fatherName: "Ramesh Tiwari",
      motherName: "Geeta Tiwari",
      dob: "25/06/02",
      email: "vikram.tiwari@student.edu",
      phoneNumber: "9789012345",
      address: "147 Hazratganj, Lucknow"
    },
    {
      id: 8,
      photo: "https://via.placeholder.com/50x50/28a745/ffffff?text=AM",
      name: "Anita Mehta",
      course: "MSW",
      fatherName: "Deepak Mehta",
      motherName: "Rekha Mehta",
      dob: "12/01/01",
      email: "anita.mehta@student.edu",
      phoneNumber: "9890123456",
      address: "258 FC Road, Pune"
    },
    {
      id: 9,
      photo: "https://via.placeholder.com/50x50/28a745/ffffff?text=SJ",
      name: "Suraj Joshi",
      course: "BSW",
      fatherName: "Mahesh Joshi",
      motherName: "Lata Joshi",
      dob: "08/08/02",
      email: "suraj.joshi@student.edu",
      phoneNumber: "9901234567",
      address: "369 Law Garden, Ahmedabad"
    },
    {
      id: 10,
      photo: "https://via.placeholder.com/50x50/28a745/ffffff?text=KS",
      name: "Kavya Sinha",
      course: "MSW",
      fatherName: "Ashok Sinha",
      motherName: "Vandana Sinha",
      dob: "14/05/01",
      email: "kavya.sinha@student.edu",
      phoneNumber: "9012345678",
      address: "741 Park Circus, Kolkata"
    }
  ]);

  // Course options
  const courseOptions = [
    { value: "BSW", label: "BSW" },
    { value: "MSW", label: "MSW" }
  ];

  // Filter students based on search term and selected course
  const filteredStudents = studentData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.phoneNumber.includes(searchTerm);
    const matchesCourse = !selectedCourse || student.course === selectedCourse.value;
    return matchesSearch && matchesCourse;
  });

  // Handle photo upload and compression
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only PNG, JPEG, or JPG files.');
      return;
    }

    try {
      // Compression options
      const options = {
        maxSizeMB: 1, // Maximum file size in MB
        maxWidthOrHeight: 800, // Maximum width or height
        useWebWorker: true,
        fileType: file.type
      };

      // Compress the image
      const compressedFile = await imageCompression(file, options);

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile);

      setFormData(prev => ({
        ...prev,
        photo: compressedFile,
        photoPreview: previewUrl
      }));
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  // Handle phone number input (numbers only, max 10 digits)
  const handlePhoneChange = (value) => {
    // Remove all non-numeric characters and limit to 10 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, phoneNumber: numericValue }));
  };

  // Handle date input
  const handleDateChange = (value) => {
    setFormData(prev => ({ ...prev, dob: value }));
  };

  // Validate email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Format date for display (dd/mm/yy)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.photo) {
      alert("Please upload a photo");
      return;
    }
    if (!formData.name.trim()) {
      alert("Please enter student name");
      return;
    }
    if (!formData.dob.trim()) {
      alert("Please enter date of birth");
      return;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!formData.address.trim()) {
      alert("Please enter address");
      return;
    }
    if (!formData.course.trim()) {
      alert("Please select a course");
      return;
    }
    if (!formData.fatherName.trim()) {
      alert("Please enter father's name");
      return;
    }
    if (!formData.motherName.trim()) {
      alert("Please enter mother's name");
      return;
    }

    if (editingStudent) {
      // Update existing student
      setStudentData(prev => prev.map(student =>
        student.id === editingStudent.id
          ? {
              ...student,
              photo: formData.photoPreview || student.photo,
              name: formData.name,
              dob: formatDateForDisplay(formData.dob),
              phoneNumber: formData.phoneNumber,
              email: formData.email,
              address: formData.address,
              course: formData.course,
              fatherName: formData.fatherName,
              motherName: formData.motherName
            }
          : student
      ));
      alert("Student updated successfully!");
      setEditingStudent(null);
    } else {
      // Add new student
      const newStudent = {
        id: Date.now(),
        photo: formData.photoPreview,
        name: formData.name,
        dob: formatDateForDisplay(formData.dob),
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        course: formData.course,
        fatherName: formData.fatherName,
        motherName: formData.motherName
      };
      setStudentData(prev => [...prev, newStudent]);
      alert("Student added successfully!");
    }

    // Reset form
    resetForm();
    setIsFormView(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      photo: null,
      photoPreview: "",
      name: "",
      dob: "",
      phoneNumber: "",
      email: "",
      address: "",
      course: "",
      fatherName: "",
      motherName: ""
    });
    setEditingStudent(null);
  };

  // Handle inline edit
  const handleInlineEdit = (student) => {
    setEditingRowId(student.id);
    setEditingStudent({ ...student });
  };

  // Handle save inline edit
  const handleSaveInlineEdit = () => {
    if (!editingStudent.name.trim()) {
      alert("Please enter student name");
      return;
    }
    if (!editingStudent.phoneNumber.trim() || editingStudent.phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    if (!editingStudent.email.trim() || !isValidEmail(editingStudent.email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!editingStudent.address.trim()) {
      alert("Please enter address");
      return;
    }
    if (!editingStudent.fatherName.trim()) {
      alert("Please enter father's name");
      return;
    }
    if (!editingStudent.motherName.trim()) {
      alert("Please enter mother's name");
      return;
    }

    setStudentData(prev => prev.map(student =>
      student.id === editingStudent.id ? editingStudent : student
    ));
    setEditingRowId(null);
    setEditingStudent(null);
    alert("Student updated successfully!");
  };

  // Handle cancel inline edit
  const handleCancelInlineEdit = () => {
    setEditingRowId(null);
    setEditingStudent(null);
  };

  // Handle inline field change
  const handleInlineFieldChange = (field, value) => {
    if (field === 'phoneNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setEditingStudent(prev => ({ ...prev, [field]: value }));
  };

  // Handle delete student
  const handleDelete = (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudentData(prev => prev.filter(student => student.id !== studentId));
      alert("Student deleted successfully!");
    }
  };

  // Handle photo modal
  const handlePhotoClick = (photoUrl) => {
    setModalPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: '200px',
      border: '1px solid var(--student-border-color)',
      borderRadius: '6px',
      fontSize: '14px',
      '&:hover': {
        borderColor: 'var(--student-primary-color)'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'var(--student-primary-color)' : 'white',
      color: state.isSelected ? 'white' : '#333',
      '&:hover': {
        backgroundColor: state.isSelected ? 'var(--student-primary-color)' : 'var(--student-primary-light)'
      }
    })
  };

  return (
    <div className="student-registration-container">
      <header>
        <div className="student-logo-text">Student Registration</div>
      </header>

      {/* Add Student Button - Outside Card */}
      {!isFormView && (
        <div className="student-add-button-container">
          <button
            className="student-add-button"
            onClick={() => {
              resetForm();
              setIsFormView(true);
            }}
          >
            Add Student
          </button>
        </div>
      )}

      <div className="student-data-container">
        {!isFormView ? (
          <>
            {/* Search and Course Filter */}
            <div className="student-control-panel-filters">
              <div className="student-search-container">
                <div className="student-search-input-wrapper">
                  <svg className="student-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    className="student-search-input"
                    placeholder="Search by Name/Email/Phone Number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="student-dropdown-container">
                <div className="student-dropdown-group">
                  <span className="student-label-text">Course:</span>
                  <div className="student-select-container">
                    <Select
                      value={selectedCourse}
                      onChange={(option) => setSelectedCourse(option)}
                      options={courseOptions}
                      styles={customSelectStyles}
                      isSearchable
                      placeholder="Select Course"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Student Table */}
            <div className="student-table-container">
              <table className="student-table">
                <thead>
                  <tr>
                    <th className="student-sl-no-header">Sl No.</th>
                    <th>Photo</th>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Father's Name</th>
                    <th>Mother's Name</th>
                    <th>DOB</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td className="student-sl-no-cell">{index + 1}</td>
                      <td>
                        <div
                          className="student-photo-container"
                          onClick={() => handlePhotoClick(student.photo)}
                        >
                          <img
                            src={student.photo}
                            alt={student.name}
                            className="student-photo"
                          />
                        </div>
                      </td>
                      <td>
                        {editingRowId === student.id ? (
                          <input
                            type="text"
                            className="student-inline-input"
                            value={editingStudent.name}
                            onChange={(e) => handleInlineFieldChange('name', e.target.value)}
                          />
                        ) : (
                          student.name
                        )}
                      </td>
                      <td>
                        {editingRowId === student.id ? (
                          <select
                            className="student-inline-select"
                            value={editingStudent.course}
                            onChange={(e) => handleInlineFieldChange('course', e.target.value)}
                          >
                            <option value="">Select Course</option>
                            <option value="BSW">BSW</option>
                            <option value="MSW">MSW</option>
                          </select>
                        ) : (
                          student.course
                        )}
                      </td>
                      <td>
                        {editingRowId === student.id ? (
                          <input
                            type="text"
                            className="student-inline-input"
                            value={editingStudent.fatherName}
                            onChange={(e) => handleInlineFieldChange('fatherName', e.target.value)}
                          />
                        ) : (
                          student.fatherName
                        )}
                      </td>
                      <td>
                        {editingRowId === student.id ? (
                          <input
                            type="text"
                            className="student-inline-input"
                            value={editingStudent.motherName}
                            onChange={(e) => handleInlineFieldChange('motherName', e.target.value)}
                          />
                        ) : (
                          student.motherName
                        )}
                      </td>
                      <td>{student.dob}</td>
                      <td>
                        {editingRowId === student.id ? (
                          <input
                            type="email"
                            className="student-inline-input"
                            value={editingStudent.email}
                            onChange={(e) => handleInlineFieldChange('email', e.target.value)}
                          />
                        ) : (
                          student.email
                        )}
                      </td>
                      <td>
                        {editingRowId === student.id ? (
                          <input
                            type="text"
                            className="student-inline-input student-phone-input"
                            value={editingStudent.phoneNumber}
                            onChange={(e) => handleInlineFieldChange('phoneNumber', e.target.value)}
                            placeholder="10 digits"
                            maxLength="10"
                          />
                        ) : (
                          `+91-${student.phoneNumber}`
                        )}
                      </td>
                      <td>
                        {editingRowId === student.id ? (
                          <input
                            type="text"
                            className="student-inline-input"
                            value={editingStudent.address}
                            onChange={(e) => handleInlineFieldChange('address', e.target.value)}
                          />
                        ) : (
                          student.address
                        )}
                      </td>
                      <td>
                        <div className="student-action-buttons">
                          {editingRowId === student.id ? (
                            <>
                              <button
                                className="student-save-button"
                                onClick={handleSaveInlineEdit}
                                title="Save"
                              >
                                Save
                              </button>
                              <button
                                className="student-cancel-button"
                                onClick={handleCancelInlineEdit}
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="student-edit-button"
                                onClick={() => handleInlineEdit(student)}
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button
                                className="student-delete-button"
                                onClick={() => handleDelete(student.id)}
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
          /* Student Form */
          <div className="student-form-container">
            <div className="student-form-header">
              <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button
                className="student-back-button"
                onClick={() => {
                  resetForm();
                  setIsFormView(false);
                }}
              >
                Back
              </button>
            </div>

            <form className="student-form" onSubmit={handleSubmit}>
              <div className="student-form-row">
                <div className="student-form-group student-form-group-full-width">
                  <label className="student-form-label" htmlFor="photo">Photo:</label>
                  <div className="student-photo-upload-container">
                    <input
                      id="photo"
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={handlePhotoUpload}
                      className="student-photo-input"
                    />
                    {formData.photoPreview && (
                      <div className="student-photo-preview">
                        <img
                          src={formData.photoPreview}
                          alt="Preview"
                          className="student-preview-image"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="student-form-row">
                <div className="student-form-group">
                  <label className="student-form-label" htmlFor="name">Name:</label>
                  <input
                    id="name"
                    type="text"
                    className="student-form-text-input"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter student name"
                  />
                </div>

                <div className="student-form-group">
                  <label className="student-form-label" htmlFor="dob">Date of Birth:</label>
                  <input
                    id="dob"
                    type="date"
                    className="student-form-text-input"
                    value={formData.dob}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="student-form-row">
                <div className="student-form-group">
                  <label className="student-form-label" htmlFor="phoneNumber">Phone Number:</label>
                  <input
                    id="phoneNumber"
                    type="text"
                    className="student-form-text-input"
                    value={formData.phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter 10-digit phone number"
                    maxLength="10"
                  />
                </div>

                <div className="student-form-group">
                  <label className="student-form-label" htmlFor="email">Email:</label>
                  <input
                    id="email"
                    type="email"
                    className="student-form-text-input"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="student-form-row">
                <div className="student-form-group">
                  <label className="student-form-label" htmlFor="address">Address:</label>
                  <textarea
                    id="address"
                    className="student-form-textarea"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                    rows="3"
                  />
                </div>

                <div className="student-form-group">
                  <label className="student-form-label" htmlFor="course">Course:</label>
                  <Select
                    id="course"
                    value={courseOptions.find(option => option.value === formData.course) || null}
                    onChange={(option) => setFormData(prev => ({ ...prev, course: option ? option.value : '' }))}
                    options={courseOptions}
                    styles={customSelectStyles}
                    isSearchable
                    placeholder="Select Course"
                  />
                </div>
              </div>

              <div className="student-form-row">
                <div className="student-form-group">
                  <label className="student-form-label" htmlFor="fatherName">Father's Name:</label>
                  <input
                    id="fatherName"
                    type="text"
                    className="student-form-text-input"
                    value={formData.fatherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                    placeholder="Enter father's name"
                  />
                </div>

                <div className="student-form-group">
                  <label className="student-form-label" htmlFor="motherName">Mother's Name:</label>
                  <input
                    id="motherName"
                    type="text"
                    className="student-form-text-input"
                    value={formData.motherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                    placeholder="Enter mother's name"
                  />
                </div>
              </div>

              <div className="student-form-row student-form-submit-row">
                <button type="submit" className="student-form-submit-button">
                  {editingStudent ? 'Update Student' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="student-photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div className="student-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="student-photo-modal-close" onClick={() => setShowPhotoModal(false)}>&times;</span>
            <img src={modalPhoto} alt="Student" className="student-modal-photo" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRegistration;