import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">

      <div className="header-title">
        <h1>Digital Evidence System</h1>
      </div>

      <div className="header-user">

        <div className="user-info">
          <strong>
            {user?.name}
          </strong>

          <span>
            {user?.role}
          </span>
        </div>

        <button
          onClick={logout}
          className="logout-button"
        >
          Logout
        </button>

      </div>

    </header>
  );
};

export default Header;