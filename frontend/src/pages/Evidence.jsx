import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Evidence = () => {
  const { user } = useAuth();

  const [evidence, setEvidence] = useState([]);
  const [cases, setCases] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    evidenceNumber: "",
    caseId: "",
    title: "",
    description: "",
    evidenceType: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  // ==========================================
  // FETCH EVIDENCE
  // ==========================================

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/evidence");

      setEvidence(response.data.evidence || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch evidence"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH CASES
  // ==========================================

  const fetchCases = async () => {
    try {
      const response = await api.get("/cases");

      setCases(response.data.cases || []);
    } catch (error) {
      console.error(
        "Failed to fetch cases:",
        error
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchEvidence();
    fetchCases();
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // HANDLE FILE
  // ==========================================

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // ==========================================
  // CREATE EVIDENCE
  // ==========================================

  const handleCreateEvidence = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select an evidence file");
      return;
    }

    if (!formData.caseId) {
      setError("Please select a case");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const data = new FormData();

      data.append(
        "evidenceNumber",
        formData.evidenceNumber
      );

      data.append(
        "caseId",
        formData.caseId
      );

      data.append(
        "title",
        formData.title
      );

      data.append(
        "description",
        formData.description
      );

      data.append(
        "evidenceType",
        formData.evidenceType
      );

      data.append(
        "evidenceFile",
        selectedFile
      );

      await api.post(
        "/evidence",
        data
      );

      setFormData({
        evidenceNumber: "",
        caseId: "",
        title: "",
        description: "",
        evidenceType: "",
      });

      setSelectedFile(null);

      setShowForm(false);

      await fetchEvidence();

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create evidence"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // VERIFY EVIDENCE
  // ==========================================

  const handleVerifyEvidence = async (
    evidenceId
  ) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await api.get(
        `/evidence/${evidenceId}/verify`
      );

      if (response.data.verified) {
        alert(
          "Evidence integrity verified successfully."
        );
      } else {
        alert(
          "Evidence integrity verification failed."
        );
      }

      await fetchEvidence();

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to verify evidence"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="page-loading">
        Loading evidence...
      </div>
    );
  }

  return (
    <div className="evidence-page">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="page-header">

        <div>
          <h2>Evidence</h2>

          <p>
            Manage and verify digital evidence
          </p>
        </div>

        {(user?.role === "admin" ||
          user?.role === "superadmin" ||
          user?.role === "investigator") && (

          <button
            className="primary-button"
            onClick={() =>
              setShowForm(!showForm)
            }
          >
            {showForm
              ? "Close"
              : "+ Add Evidence"}
          </button>

        )}

      </div>


      {/* =====================================
          ERROR
      ====================================== */}

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}


      {/* =====================================
          CREATE EVIDENCE FORM
      ====================================== */}

      {showForm && (

        <div className="form-card">

          <h3>
            Add New Evidence
          </h3>

          <form
            className="evidence-form"
            onSubmit={handleCreateEvidence}
          >

            <div className="form-grid">

              {/* Evidence Number */}

              <div className="form-group">

                <label>
                  Evidence Number
                </label>

                <input
                  type="text"
                  name="evidenceNumber"
                  value={
                    formData.evidenceNumber
                  }
                  onChange={handleChange}
                  placeholder="EVD-001"
                  required
                />

              </div>


              {/* Case */}

              <div className="form-group">

                <label>
                  Case
                </label>

                <select
                  name="caseId"
                  value={formData.caseId}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Case
                  </option>

                  {cases.map((caseItem) => (

                    <option
                      key={caseItem._id}
                      value={caseItem._id}
                    >
                      {caseItem.caseNumber} -{" "}
                      {caseItem.title}
                    </option>

                  ))}

                </select>

              </div>


              {/* Title */}

              <div className="form-group">

                <label>
                  Evidence Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Laptop Hard Disk"
                  required
                />

              </div>


              {/* Evidence Type */}

              <div className="form-group">

                <label>
                  Evidence Type
                </label>

                <select
                  name="evidenceType"
                  value={
                    formData.evidenceType
                  }
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Type
                  </option>

                  <option value="document">
                    Document
                  </option>

                  <option value="image">
                    Image
                  </option>

                  <option value="video">
                    Video
                  </option>

                  <option value="audio">
                    Audio
                  </option>

                  <option value="device">
                    Device
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>

            </div>


            {/* Description */}

            <div className="form-group">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                placeholder="Describe the evidence"
                rows="4"
                required
              />

            </div>


            {/* File */}

            <div className="form-group">

              <label>
                Evidence File
              </label>

              <input
                type="file"
                onChange={handleFileChange}
                required
              />

              {selectedFile && (
                <small className="selected-file">
                  Selected:{" "}
                  {selectedFile.name}
                </small>
              )}

              <small className="file-help">
                Maximum file size: 10 MB
              </small>

            </div>


            <button
              type="submit"
              className="primary-button"
              disabled={actionLoading}
            >
              {actionLoading
                ? "Uploading..."
                : "Upload Evidence"}
            </button>

          </form>

        </div>

      )}


      {/* =====================================
          EVIDENCE TABLE
      ====================================== */}

      <div className="table-card">

        <div className="table-header">

          <h3>
            All Evidence
          </h3>

          <span>
            {evidence.length} item(s)
          </span>

        </div>


        {evidence.length === 0 ? (

          <div className="empty-state">
            No evidence found.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Evidence Number
                  </th>

                  <th>
                    Title
                  </th>

                  <th>
                    Case
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Collected By
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {evidence.map(
                  (item) => (

                    <tr
                      key={item._id}
                    >

                      <td>
                        <strong>
                          {
                            item.evidenceNumber
                          }
                        </strong>
                      </td>


                      <td>
                        {item.title}
                      </td>


                      <td>
                        {item.caseId
                          ?.caseNumber ||
                          "N/A"}
                      </td>


                      <td>
                        {item.evidenceType}
                      </td>


                      <td>

                        <span
                          className={`status-badge evidence-status-${item.status}`}
                        >
                          {item.status}
                        </span>

                      </td>


                      <td>
                        {item.collectedBy
                          ?.name ||
                          "N/A"}
                      </td>


                      <td>

                        {(user?.role ===
                          "admin" ||
                          user?.role ===
                            "superadmin" ||
                          user?.role ===
                            "investigator" ||
                          user?.role ===
                            "forensic_analyst") && (

                          <button
                            className="small-button"
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              handleVerifyEvidence(
                                item._id
                              )
                            }
                          >
                            Verify
                          </button>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default Evidence;