import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      roles: [
        "superadmin",
        "admin",
        "investigator",
        "forensic_analyst",
        "viewer",
      ],
    },

    {
      name: "Cases",
      path: "/cases",
      roles: [
        "superadmin",
        "admin",
        "investigator",
        "forensic_analyst",
        "viewer",
      ],
    },

    {
      name: "Evidence",
      path: "/evidence",
      roles: [
        "superadmin",
        "admin",
        "investigator",
        "forensic_analyst",
        "viewer",
      ],
    },

    {
      name: "Reports",
      path: "/reports",
      roles: [
        "superadmin",
        "admin",
        "investigator",
        "forensic_analyst",
        "viewer",
      ],
    },

    {
      name: "Users",
      path: "/users",
      roles: [
        "superadmin",
        "admin",
      ],
    },

    {
      name: "Audit Logs",
      path: "/audit-logs",
      roles: [
        "superadmin",
        "admin",
      ],
    },

    {
      name: "Notifications",
      path: "/notifications",
      roles: [
        "superadmin",
        "admin",
        "investigator",
        "forensic_analyst",
        "viewer",
      ],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>Digital Evidence</h2>
        <p>Investigation System</p>
      </div>

      <nav className="sidebar-menu">

        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            {item.name}
          </NavLink>
        ))}

      </nav>

      <div className="sidebar-role">
        <p>Logged in as</p>

        <strong>
          {user?.role}
        </strong>
      </div>

    </aside>
  );
};

export default Sidebar;