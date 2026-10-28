import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="main-section">

        <Header />

        <main className="main-content">
          {children}
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;