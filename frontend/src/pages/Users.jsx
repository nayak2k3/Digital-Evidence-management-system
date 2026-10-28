import { useEffect, useState } from "react";

import api from "../services/api";

import { useAuth } from "../context/AuthContext";

const Users = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      setUsers(response.data.users || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="page-loading">
        Loading users...
      </div>
    );
  }

  return (
    <div className="users-page">

      {/* ======================================
          PAGE HEADER
      ======================================= */}

      <div className="page-header">

        <div>
          <h2>Users</h2>

          <p>
            Manage system users and roles
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
          USERS TABLE
      ======================================= */}

      <div className="table-card">

        <div className="table-header">

          <h3>
            All Users
          </h3>

          <span>
            {users.length} user(s)
          </span>

        </div>


        {users.length === 0 ? (

          <div className="empty-state">
            No users found.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Created
                  </th>

                </tr>

              </thead>


              <tbody>

                {users.map(
                  (item) => (

                    <tr
                      key={item._id}
                    >

                      {/* NAME */}

                      <td>
                        <strong>
                          {item.name}
                        </strong>
                      </td>


                      {/* EMAIL */}

                      <td>
                        {item.email}
                      </td>


                      {/* ROLE */}

                      <td>

                        <span
                          className={`user-role-badge role-${item.role}`}
                        >
                          {item.role}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            item.isActive
                              ? "user-active"
                              : "user-inactive"
                          }
                        >
                          {item.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>


                      {/* CREATED */}

                      <td>
                        {item.createdAt
                          ? new Date(
                              item.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
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

export default Users;