import { useEffect, useState } from "react";

import api from "../services/api";

import { useAuth } from "../context/AuthContext";

const Reports = () => {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [cases, setCases] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    caseId: "",
    title: "",
    summary: "",
    findings: "",
    conclusion: "",
  });

  // ==========================================
  // FETCH REPORTS
  // ==========================================

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reports");

      setReports(response.data.reports || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch reports"
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
    fetchReports();
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
  // CREATE REPORT
  // ==========================================

  const handleCreateReport = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      setError("");

      await api.post("/reports", formData);

      setFormData({
        caseId: "",
        title: "",
        summary: "",
        findings: "",
        conclusion: "",
      });

      setShowForm(false);

      await fetchReports();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create report"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // SUBMIT REPORT
  // ==========================================

  const handleSubmitReport = async (
    reportId
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await api.put(
        `/reports/${reportId}/submit`
      );

      await fetchReports();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to submit report"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // REVIEW REPORT
  // ==========================================

  const handleReviewReport = async (
    reportId
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await api.put(
        `/reports/${reportId}/review`
      );

      await fetchReports();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to review report"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // APPROVE REPORT
  // ==========================================

  const handleApproveReport = async (
    reportId
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await api.put(
        `/reports/${reportId}/approve`
      );

      await fetchReports();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to approve report"
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
        Loading reports...
      </div>
    );
  }

  return (
    <div className="reports-page">

      {/* ======================================
          PAGE HEADER
      ======================================= */}

      <div className="page-header">

        <div>
          <h2>Investigation Reports</h2>

          <p>
            Create, review and approve
            investigation reports
          </p>
        </div>

        {(user?.role === "admin" ||
          user?.role === "superadmin" ||
          user?.role === "investigator" ||
          user?.role === "forensic_analyst") && (

          <button
            className="primary-button"
            onClick={() =>
              setShowForm(!showForm)
            }
          >
            {showForm
              ? "Close"
              : "+ Create Report"}
          </button>

        )}

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
          CREATE REPORT FORM
      ======================================= */}

      {showForm && (

        <div className="form-card">

          <h3>
            Create Investigation Report
          </h3>

          <form
            className="report-form"
            onSubmit={handleCreateReport}
          >

            {/* CASE */}

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


            {/* TITLE */}

            <div className="form-group">

              <label>
                Report Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Investigation Report"
                required
              />

            </div>


            {/* SUMMARY */}

            <div className="form-group">

              <label>
                Summary
              </label>

              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="Write a summary of the investigation"
                rows="4"
                required
              />

            </div>


            {/* FINDINGS */}

            <div className="form-group">

              <label>
                Findings
              </label>

              <textarea
                name="findings"
                value={formData.findings}
                onChange={handleChange}
                placeholder="Describe the investigation findings"
                rows="5"
                required
              />

            </div>


            {/* CONCLUSION */}

            <div className="form-group">

              <label>
                Conclusion
              </label>

              <textarea
                name="conclusion"
                value={formData.conclusion}
                onChange={handleChange}
                placeholder="Write the final conclusion"
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
                : "Create Report"}
            </button>

          </form>

        </div>

      )}


      {/* ======================================
          REPORT TABLE
      ======================================= */}

      <div className="table-card">

        <div className="table-header">

          <h3>
            All Reports
          </h3>

          <span>
            {reports.length} report(s)
          </span>

        </div>


        {reports.length === 0 ? (

          <div className="empty-state">
            No reports found.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Report Title
                  </th>

                  <th>
                    Case
                  </th>

                  <th>
                    Prepared By
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {reports.map(
                  (report) => (

                    <tr
                      key={report._id}
                    >

                      <td>
                        <strong>
                          {report.title}
                        </strong>
                      </td>


                      <td>
                        {report.caseId
                          ?.caseNumber ||
                          "N/A"}
                      </td>


                      <td>
                        {report.preparedBy
                          ?.name ||
                          "N/A"}
                      </td>


                      <td>

                        <span
                          className={`status-badge report-status-${report.status}`}
                        >
                          {report.status}
                        </span>

                      </td>


                      <td>

                        <div className="report-actions">

                          {/* SUBMIT */}

                          {report.status ===
                            "draft" &&
                            report.preparedBy?._id ===
                              user?.id && (

                            <button
                              className="small-button"
                              disabled={
                                actionLoading
                              }
                              onClick={() =>
                                handleSubmitReport(
                                  report._id
                                )
                              }
                            >
                              Submit
                            </button>

                          )}


                          {/* REVIEW */}

                          {(user?.role ===
                            "admin" ||
                            user?.role ===
                              "superadmin") &&
                            report.status ===
                              "submitted" && (

                            <button
                              className="small-button"
                              disabled={
                                actionLoading
                              }
                              onClick={() =>
                                handleReviewReport(
                                  report._id
                                )
                              }
                            >
                              Review
                            </button>

                          )}


                          {/* APPROVE */}

                          {(user?.role ===
                            "admin" ||
                            user?.role ===
                              "superadmin") &&
                            report.status ===
                              "reviewed" && (

                            <button
                              className="small-button"
                              disabled={
                                actionLoading
                              }
                              onClick={() =>
                                handleApproveReport(
                                  report._id
                                )
                              }
                            >
                              Approve
                            </button>

                          )}

                        </div>

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

export default Reports;