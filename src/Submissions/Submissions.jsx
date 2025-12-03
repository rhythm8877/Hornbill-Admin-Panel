"use client";

import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { deleteObject, ref as storageRef } from "firebase/storage";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { db, storage } from "../firebaseConfig";
import "./Submissions.css";

const Submissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateSort, setSelectedDateSort] = useState({
    value: "newest",
    label: "Newest First"
  });
  const [selectedVoteSort, setSelectedVoteSort] = useState({
    value: "none",
    label: "Votes (Default)"
  });
  const [submissionsData, setSubmissionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const ITEMS_PER_PAGE = 100;
  const [currentPage, setCurrentPage] = useState(1);

  const submissionsCollection = useMemo(() => collection(db, "submissions"), []);

  useEffect(() => {
    const submissionsQuery = query(submissionsCollection, orderBy("localDateString", "desc"));
    setIsLoading(true);

    const unsubscribe = onSnapshot(
      submissionsQuery,
      (snapshot) => {
        const records = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          return {
            docId: docSnap.id,
            photoUrl: data.photoUrl || "",
            fullName: data.fullName || "—",
            votes: typeof data.votes === "number" ? data.votes : data.votes ? Number(data.votes) : 0,
            localDateString: data.localDateString || "—"
          };
        });
        setSubmissionsData(records);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching submissions:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [submissionsCollection]);

  // Date sort options
  const dateSortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" }
  ];

  // Vote sort options
  const voteSortOptions = [
    { value: "none", label: "Votes (Default)" },
    { value: "votesDesc", label: "Most Votes" },
    { value: "votesAsc", label: "Least Votes" }
  ];

  // Filter and sort submissions
  const filteredSubmissions = submissionsData
    .filter((submission) => {
      const matchesSearch =
        submission.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.localDateString.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      // Primary sort by votes if vote sort is selected
      if (selectedVoteSort.value === "votesDesc") {
        const diff = (b.votes || 0) - (a.votes || 0);
        if (diff !== 0) return diff;
      } else if (selectedVoteSort.value === "votesAsc") {
        const diff = (a.votes || 0) - (b.votes || 0);
        if (diff !== 0) return diff;
      }

      // Secondary sort by date
      if (selectedDateSort.value === "newest") {
        // Newest first
        return (b.localDateString || "").localeCompare(a.localDateString || "");
      } else {
        // Oldest first
        return (a.localDateString || "").localeCompare(b.localDateString || "");
      }
    });

  // Pagination: compute total pages and visible submissions
  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const visibleSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  // Reset to first page when filters or data length change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDateSort.value, selectedVoteSort.value, submissionsData.length]);

  // Handle photo modal
  const handlePhotoClick = (photoUrl) => {
    setModalPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  // Handle checkbox selection
  const handleSelectItem = (docId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(new Set(filteredSubmissions.map((item) => item.docId)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Check if all items are selected
  const isAllSelected = filteredSubmissions.length > 0 && selectedItems.size === filteredSubmissions.length;
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < filteredSubmissions.length;

  // Extract filename from photoUrl for storage deletion
  const extractFileName = (photoUrl) => {
    try {
      // Firebase Storage URLs typically have the format:
      // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media&token=...
      const url = new URL(photoUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
      if (pathMatch) {
        // Decode the path (it's URL encoded)
        const decodedPath = decodeURIComponent(pathMatch[1]);
        // Ensure it starts with submissions/ if it doesn't already
        if (decodedPath.startsWith("submissions/")) {
          return decodedPath;
        } else {
          return `submissions/${decodedPath}`;
        }
      }
      // Fallback: try to extract from submissions/ path in URL
      if (photoUrl.includes("submissions/")) {
        const parts = photoUrl.split("submissions/");
        if (parts.length > 1) {
          const fileName = parts[1].split("?")[0].split("&")[0];
          return `submissions/${fileName}`;
        }
      }
      // If we can't extract, try to get the last part of the URL
      const urlParts = photoUrl.split("/");
      const lastPart = urlParts[urlParts.length - 1].split("?")[0];
      if (lastPart) {
        return `submissions/${lastPart}`;
      }
      return null;
    } catch (error) {
      console.error("Error extracting filename:", error);
      // Last resort: try to extract filename from URL string
      if (photoUrl.includes("submissions/")) {
        const match = photoUrl.match(/submissions\/([^?&]+)/);
        if (match) {
          return `submissions/${match[1]}`;
        }
      }
      return null;
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      alert("Please select at least one item to delete.");
      return;
    }

    const count = selectedItems.size;
    if (!window.confirm(`Are you sure you want to delete ${count} submission${count > 1 ? "s" : ""}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const itemsToDelete = filteredSubmissions.filter((item) => selectedItems.has(item.docId));
      const deletePromises = itemsToDelete.map(async (item) => {
        // Delete document from Firestore
        const docRef = doc(db, "submissions", item.docId);
        await deleteDoc(docRef);

        // Delete photo from Storage if photoUrl exists
        if (item.photoUrl) {
          const fileName = extractFileName(item.photoUrl);
          if (fileName) {
            try {
              const photoRef = storageRef(storage, fileName);
              await deleteObject(photoRef);
            } catch (storageError) {
              // If photo doesn't exist in storage, that's okay, continue
              console.warn("Photo not found in storage or already deleted:", storageError);
            }
          }
        }
      });

      await Promise.all(deletePromises);
      setSelectedItems(new Set());
      alert(`Successfully deleted ${count} submission${count > 1 ? "s" : ""}.`);
    } catch (error) {
      console.error("Error deleting submissions:", error);
      alert("Unable to delete some submissions. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete via icon
  const handleDeleteSingle = async (item) => {
    // If multiple items are selected and the clicked row is part of the selection,
    // treat this as a bulk delete for all selected items.
    if (selectedItems.size > 1 && selectedItems.has(item.docId)) {
      await handleBulkDelete();
      return;
    }

    // Otherwise delete only this single item
    if (!window.confirm(`Are you sure you want to delete the submission by ${item.fullName}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete document from Firestore
      const docRef = doc(db, "submissions", item.docId);
      await deleteDoc(docRef);

      // Delete photo from Storage if photoUrl exists
      if (item.photoUrl) {
        const fileName = extractFileName(item.photoUrl);
        if (fileName) {
          try {
            const photoRef = storageRef(storage, fileName);
            await deleteObject(photoRef);
          } catch (storageError) {
            // If photo doesn't exist in storage, that's okay, continue
            console.warn("Photo not found in storage or already deleted:", storageError);
          }
        }
      }

      // Remove from selected items if it was selected
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.docId);
        return newSet;
      });
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Unable to delete submission. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Custom select styles
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: "200px",
      border: "1px solid var(--submission-border-color)",
      borderRadius: "6px",
      fontSize: "14px",
      "&:hover": {
        borderColor: "var(--submission-primary-color)"
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "var(--submission-primary-color)" : "white",
      color: state.isSelected ? "white" : "#333",
      "&:hover": {
        backgroundColor: state.isSelected ? "var(--submission-primary-color)" : "var(--submission-primary-light)"
      }
    })
  };

  return (
    <div className="submission-container">
      <header>
        <div className="submission-logo-text">Submissions</div>
      </header>

      <div className="submission-data-container">
        {/* Search and Filters */}
        <div className="submission-control-panel-filters">
          {/* Search Bar */}
          <div className="submission-search-container">
            <div className="submission-search-input-wrapper">
              <svg
                className="submission-search-icon"
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
                className="submission-search-input"
                placeholder="Search by Name or Date"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="submission-dropdown-container">
            <div className="submission-dropdown-group">
              <span className="submission-label-text">Sort by Date:</span>
              <div className="submission-select-container">
                <Select
                  value={selectedDateSort}
                  onChange={(option) => setSelectedDateSort(option)}
                  options={dateSortOptions}
                  styles={customSelectStyles}
                  isSearchable={false}
                  placeholder="Sort by Date"
                />
              </div>
            </div>
            <div className="submission-dropdown-group">
              <span className="submission-label-text">Sort by Votes:</span>
              <div className="submission-select-container">
                <Select
                  value={selectedVoteSort}
                  onChange={(option) => setSelectedVoteSort(option)}
                  options={voteSortOptions}
                  styles={customSelectStyles}
                  isSearchable={false}
                  placeholder="Sort by Votes"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="submission-table-container">
          <table className="submission-table">
            <thead>
              <tr>
                <th className="submission-sl-no-header">
                  <div className="submission-slno-header-content">
                    <input
                      type="checkbox"
                      className="submission-checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <span>Sl No.</span>
                  </div>
                </th>
                <th>Photo</th>
                <th>Name</th>
                <th>Votes</th>
                <th>Date</th>
                <th className="submission-action-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="submission-empty-state">
                    Loading submissions...
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="submission-empty-state">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                visibleSubmissions.map((submission, index) => (
                  <tr key={submission.docId}>
                    <td className="submission-sl-no-cell">
                      <div className="submission-slno-cell-content">
                        <input
                          type="checkbox"
                          className="submission-checkbox"
                          checked={selectedItems.has(submission.docId)}
                          onChange={() => handleSelectItem(submission.docId)}
                        />
                        <span>{startIndex + index + 1}</span>
                      </div>
                    </td>
                    <td className="submission-action-cell">
                      {submission.photoUrl ? (
                        <div
                          className="submission-photo-container"
                          onClick={() => handlePhotoClick(submission.photoUrl)}
                        >
                          <img
                            src={submission.photoUrl}
                            alt={submission.fullName}
                            className="submission-photo"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              if (e.target.parentNode) {
                                e.target.parentNode.innerHTML =
                                  '<div class="submission-photo-placeholder">No Image</div>';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <span className="submission-muted-text">No photo</span>
                      )}
                    </td>
                    <td>{submission.fullName}</td>
                    <td>{submission.votes}</td>
                    <td>{submission.localDateString}</td>
                    <td>
                      <button
                        className="submission-delete-button"
                        onClick={() => handleDeleteSingle(submission)}
                        disabled={isDeleting}
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {!isLoading && filteredSubmissions.length > 0 && (
            <div className="submission-pagination">
              <div className="submission-page-numbers">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`submission-page-button ${
                      page === safeCurrentPage ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="submission-photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div className="submission-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="submission-photo-modal-close" onClick={() => setShowPhotoModal(false)}>
              &times;
            </span>
            <img
              src={modalPhoto}
              alt="Submission"
              className="submission-modal-photo"
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

export default Submissions;

