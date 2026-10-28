import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/dashboard");

        setStats(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="dashboard-page-header">

        <div>
          <h2>Dashboard</h2>

          <p>
            Welcome back, {user?.name}
          </p>
        </div>

        <div className="role-badge">
          {user?.role}
        </div>

      </div>


      {/* =====================================
          CASE CARDS
      ====================================== */}

      <h3 className="section-title">
        Cases
      </h3>

      <div className="stats-grid">

        <div className="stat-card">
          <p>Total Cases</p>
          <h2>{stats?.cases?.total || 0}</h2>
        </div>

        <div className="stat-card">
          <p>Open Cases</p>
          <h2>{stats?.cases?.open || 0}</h2>
        </div>

        <div className="stat-card">
          <p>Under Investigation</p>
          <h2>
            {stats?.cases?.underInvestigation || 0}
          </h2>
        </div>

        <div className="stat-card">
          <p>Closed Cases</p>
          <h2>{stats?.cases?.closed || 0}</h2>
        </div>

      </div>


      {/* =====================================
          EVIDENCE CARDS
      ====================================== */}

      <h3 className="section-title">
        Evidence
      </h3>

      <div className="stats-grid">

        <div className="stat-card">
          <p>Total Evidence</p>
          <h2>
            {stats?.evidence?.total || 0}
          </h2>
        </div>

        <div className="stat-card">
          <p>Collected</p>
          <h2>
            {stats?.evidence?.collected || 0}
          </h2>
        </div>

        <div className="stat-card">
          <p>Verified</p>
          <h2>
            {stats?.evidence?.verified || 0}
          </h2>
        </div>

        <div className="stat-card">
          <p>Under Analysis</p>
          <h2>
            {stats?.evidence?.underAnalysis || 0}
          </h2>
        </div>

      </div>


      {/* =====================================
          REPORT CARDS
      ====================================== */}

      <h3 className="section-title">
        Investigation Reports
      </h3>

      <div className="stats-grid">

        <div className="stat-card">
          <p>Total Reports</p>
          <h2>
            {stats?.reports?.total || 0}
          </h2>
        </div>

        <div className="stat-card">
          <p>Draft Reports</p>
          <h2>
            {stats?.reports?.draft || 0}
          </h2>
        </div>

        <div className="stat-card">
          <p>Submitted</p>
          <h2>
            {stats?.reports?.submitted || 0}
          </h2>
        </div>

        <div className="stat-card">
          <p>Approved</p>
          <h2>
            {stats?.reports?.approved || 0}
          </h2>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;