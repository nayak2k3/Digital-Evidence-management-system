import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Cases = () => {
  const { user } = useAuth();
  const canUpdateCaseStatus = [
    "admin",
    "superadmin",
    "investigator",
  ].includes(user?.role);

  const [cases, setCases] = useState([]);
  const [investigators, setInvestigators] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    caseNumber: "",
    title: "",
    description: "",
    caseType: "",
    priority: "medium",
  });

  const [selectedInvestigator, setSelectedInvestigator] =
    useState({});

  const [actionLoading, setActionLoading] = useState(false);

  // ==========================================
  // FETCH CASES
  // ==========================================

  const fetchCases = async () => {
    try {
      setLoading(true);

      const response = await api.get("/cases");

      setCases(response.data.cases);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch cases"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH INVESTIGATORS
  // ==========================================

  const fetchInvestigators = async () => {
    try {
      const response = await api.get(
        "/users?role=investigator"
      );

      setInvestigators(
        response.data.users || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch investigators:",
        error
      );
    }
  };

  useEffect(() => {
    fetchCases();

    if (
      user?.role === "admin" ||
      user?.role === "superadmin"
    ) {
      fetchInvestigators();
    }
  }, [user]);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // CREATE CASE
  // ==========================================

  const handleCreateCase = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      setError("");

      await api.post("/cases", formData);

      setFormData({
        caseNumber: "",
        title: "",
        description: "",
        caseType: "",
        priority: "medium",
      });

      setShowForm(false);

      await fetchCases();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create case"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // ASSIGN INVESTIGATOR
  // ==========================================

  const handleAssignInvestigator = async (
    caseId
  ) => {
    const investigatorId =
      selectedInvestigator[caseId];

    if (!investigatorId) {
      alert("Please select an investigator");
      return;
    }

    try {
      setActionLoading(true);

      await api.put(
        `/cases/${caseId}/assign`,
        {
          investigatorId,
        }
      );

      await fetchCases();

      alert("Investigator assigned successfully");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to assign investigator"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleStatusChange = async (
    caseId,
    status
  ) => {
    try {
      setActionLoading(true);

      await api.put(
        `/cases/${caseId}/status`,
        {
          status,
        }
      );

      await fetchCases();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update case status"
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
        Loading cases...
      </div>
    );
  }

  return (
    <div className="cases-page">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="page-header">

        <div>
          <h2>Cases</h2>

          <p>
            Manage investigation cases
          </p>
        </div>

        {(user?.role === "admin" ||
          user?.role === "superadmin") && (
          <button
            className="primary-button"
            onClick={() =>
              setShowForm(!showForm)
            }
          >
            {showForm
              ? "Close"
              : "+ Create Case"}
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
          CREATE CASE FORM
      ====================================== */}

      {showForm && (
        <div className="form-card">

          <h3>Create New Case</h3>

          <form
            className="case-form"
            onSubmit={handleCreateCase}
          >

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Case Number
                </label>

                <input
                  type="text"
                  name="caseNumber"
                  value={formData.caseNumber}
                  onChange={handleChange}
                  placeholder="CASE-001"
                  required
                />
              </div>


              <div className="form-group">
                <label>
                  Case Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter case title"
                  required
                />
              </div>


              <div className="form-group">
                <label>
                  Case Type
                </label>

                <select
                  name="caseType"
                  value={formData.caseType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select case type</option>
                  <option value="cybercrime">Cybercrime</option>
                  <option value="fraud">Fraud</option>
                  <option value="theft">Theft</option>
                  <option value="missing_person">Missing person</option>
                  <option value="financial_crime">Financial crime</option>
                  <option value="other">Other</option>
                </select>
              </div>


              <div className="form-group">
                <label>
                  Priority
                </label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="critical">
                    Critical
                  </option>
                </select>
              </div>

            </div>


            <div className="form-group">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the case"
                rows="4"
                required
              />

            </div>


            <button
              type="submit"
              className="primary-button"
              disabled={actionLoading}
            >
              {actionLoading
                ? "Creating..."
                : "Create Case"}
            </button>

          </form>

        </div>
      )}


      {/* =====================================
          CASE TABLE
      ====================================== */}

      <div className="table-card">

        <div className="table-header">

          <h3>
            All Cases
          </h3>

          <span>
            {cases.length} case(s)
          </span>

        </div>


        {cases.length === 0 ? (

          <div className="empty-state">
            No cases found.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>Case Number</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Investigator</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {cases.map((caseItem) => (

                  <tr key={caseItem._id}>

                    <td>
                      <strong>
                        {caseItem.caseNumber}
                      </strong>
                    </td>

                    <td>
                      {caseItem.title}
                    </td>

                    <td>
                      {caseItem.caseType}
                    </td>

                    <td>
                      <span
                        className={`status-badge priority-${caseItem.priority}`}
                      >
                        {caseItem.priority}
                      </span>
                    </td>

                    <td>

                      {canUpdateCaseStatus ? (
                        <select
                          value={caseItem.status}
                          disabled={actionLoading}
                          onChange={(e) =>
                            handleStatusChange(
                              caseItem._id,
                              e.target.value
                            )
                          }
                        >
                          <option value="open">
                            Open
                          </option>
                          <option value="under_investigation">
                            Under Investigation
                          </option>
                          <option value="closed">
                            Closed
                          </option>
                          <option value="archived">
                            Archived
                          </option>
                        </select>
                      ) : (
                        caseItem.status.replace(/_/g, " ")
                      )}

                    </td>

                    <td>

                      {caseItem.assignedInvestigator
                        ? caseItem
                            .assignedInvestigator
                            .name
                        : "Not Assigned"}

                    </td>

                    <td>

                      {(user?.role === "admin" ||
                        user?.role ===
                          "superadmin") && (

                        <div className="assign-box">

                          <select
                            value={
                              selectedInvestigator[
                                caseItem._id
                              ] || ""
                            }
                            onChange={(e) =>
                              setSelectedInvestigator({
                                ...selectedInvestigator,
                                [caseItem._id]:
                                  e.target.value,
                              })
                            }
                          >

                            <option value="">
                              Select Investigator
                            </option>

                            {investigators.map(
                              (investigator) => (
                                <option
                                  key={
                                    investigator._id
                                  }
                                  value={
                                    investigator._id
                                  }
                                >
                                  {
                                    investigator.name
                                  }
                                </option>
                              )
                            )}

                          </select>

                          <button
                            className="small-button"
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              handleAssignInvestigator(
                                caseItem._id
                              )
                            }
                          >
                            Assign
                          </button>

                        </div>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default Cases;