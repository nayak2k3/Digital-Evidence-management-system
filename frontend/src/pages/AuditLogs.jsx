import { useEffect, useState } from "react";

import api from "../services/api";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [action, setAction] = useState("");

  const [resourceType, setResourceType] =
    useState("");

  // ==========================================
  // FETCH AUDIT LOGS
  // ==========================================

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (action) {
        params.action = action;
      }

      if (resourceType) {
        params.resourceType = resourceType;
      }

      const response = await api.get(
        "/audit-logs",
        {
          params,
        }
      );

      setLogs(response.data.logs || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch audit logs"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // ==========================================
  // FILTER
  // ==========================================

  const handleFilter = (e) => {
    e.preventDefault();

    fetchAuditLogs();
  };

  // ==========================================
  // CLEAR FILTER
  // ==========================================

  const clearFilters = () => {
    setAction("");
    setResourceType("");

    setTimeout(() => {
      fetchAuditLogs();
    }, 0);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="page-loading">
        Loading audit logs...
      </div>
    );
  }

  return (
    <div className="audit-page">

      {/* ======================================
          PAGE HEADER
      ======================================= */}

      <div className="page-header">

        <div>
          <h2>Audit Logs</h2>

          <p>
            Track important system activities
          </p>
        </div>

      </div>


      {/* ======================================
          ERROR
      ======================================= */}

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}


      {/* ======================================
          FILTER CARD
      ======================================= */}

      <div className="filter-card">

        <form
          className="filter-form"
          onSubmit={handleFilter}
        >

          {/* ACTION */}

          <div className="filter-group">

            <label>
              Action
            </label>

            <select
              value={action}
              onChange={(e) =>
                setAction(e.target.value)
              }
            >

              <option value="">
                All Actions
              </option>

              <option value="LOGIN">
                Login
              </option>

              <option value="CREATE_CASE">
                Create Case
              </option>

              <option value="UPDATE_CASE">
                Update Case
              </option>

              <option value="ASSIGN_CASE">
                Assign Case
              </option>

              <option value="UPDATE_CASE_STATUS">
                Update Case Status
              </option>

              <option value="ARCHIVE_CASE">
                Archive Case
              </option>

              <option value="CREATE_EVIDENCE">
                Create Evidence
              </option>

              <option value="VERIFY_EVIDENCE">
                Verify Evidence
              </option>

              <option value="UPDATE_EVIDENCE">
                Update Evidence
              </option>

              <option value="CREATE_REPORT">
                Create Report
              </option>

              <option value="SUBMIT_REPORT">
                Submit Report
              </option>

              <option value="REVIEW_REPORT">
                Review Report
              </option>

              <option value="APPROVE_REPORT">
                Approve Report
              </option>

            </select>

          </div>


          {/* RESOURCE TYPE */}

          <div className="filter-group">

            <label>
              Resource
            </label>

            <select
              value={resourceType}
              onChange={(e) =>
                setResourceType(
                  e.target.value
                )
              }
            >

              <option value="">
                All Resources
              </option>

              <option value="User">
                User
              </option>

              <option value="Case">
                Case
              </option>

              <option value="Evidence">
                Evidence
              </option>

              <option value="Report">
                Report
              </option>

            </select>

          </div>


          {/* BUTTONS */}

          <button
            type="submit"
            className="primary-button"
          >
            Filter
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={clearFilters}
          >
            Clear
          </button>

        </form>

      </div>


      {/* ======================================
          LOG TABLE
      ======================================= */}

      <div className="table-card">

        <div className="table-header">

          <h3>
            System Activity
          </h3>

          <span>
            {logs.length} log(s)
          </span>

        </div>


        {logs.length === 0 ? (

          <div className="empty-state">
            No audit logs found.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Date & Time
                  </th>

                  <th>
                    User
                  </th>

                  <th>
                    Action
                  </th>

                  <th>
                    Resource
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    IP Address
                  </th>

                </tr>

              </thead>


              <tbody>

                {logs.map(
                  (log) => (

                    <tr
                      key={log._id}
                    >

                      {/* DATE */}

                      <td>
                        {log.createdAt
                          ? new Date(
                              log.createdAt
                            ).toLocaleString()
                          : "N/A"}
                      </td>


                      {/* USER */}

                      <td>

                        <strong>
                          {log.performedBy
                            ?.name ||
                            "Unknown"}
                        </strong>

                        <br />

                        <small>
                          {log.performedBy
                            ?.role ||
                            ""}
                        </small>

                      </td>


                      {/* ACTION */}

                      <td>

                        <span
                          className="audit-action"
                        >
                          {log.action}
                        </span>

                      </td>


                      {/* RESOURCE */}

                      <td>

                        <span
                          className="audit-resource"
                        >
                          {log.resourceType}
                        </span>

                      </td>


                      {/* DESCRIPTION */}

                      <td>
                        {log.description}
                      </td>


                      {/* IP */}

                      <td>
                        {log.ipAddress ||
                          "N/A"}
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

export default AuditLogs;