import { useEffect, useState } from "react";

import api from "../services/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/notifications"
      );

      setNotifications(
        response.data.notifications || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ==========================================
  // MARK ONE AS READ
  // ==========================================

  const handleMarkAsRead = async (
    notificationId
  ) => {
    try {
      await api.put(
        `/notifications/${notificationId}/read`
      );

      await fetchNotifications();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to mark notification as read"
      );
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const handleMarkAllAsRead = async () => {
    try {
      await api.put(
        "/notifications/read-all"
      );

      await fetchNotifications();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to mark notifications as read"
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="page-loading">
        Loading notifications...
      </div>
    );
  }

  // ==========================================
  // UNREAD COUNT
  // ==========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  return (
    <div className="notifications-page">

      {/* ======================================
          PAGE HEADER
      ======================================= */}

      <div className="page-header">

        <div>
          <h2>Notifications</h2>

          <p>
            Stay updated with system activities
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="secondary-button"
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read
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
          NOTIFICATION SUMMARY
      ======================================= */}

      <div className="notification-summary">

        <div className="notification-count-card">

          <span>
            Total Notifications
          </span>

          <strong>
            {notifications.length}
          </strong>

        </div>


        <div className="notification-count-card">

          <span>
            Unread Notifications
          </span>

          <strong>
            {unreadCount}
          </strong>

        </div>

      </div>


      {/* ======================================
          NOTIFICATION LIST
      ======================================= */}

      <div className="notification-list">

        {notifications.length === 0 ? (

          <div className="empty-state">
            No notifications found.
          </div>

        ) : (

          notifications.map(
            (notification) => (

              <div
                key={notification._id}
                className={`notification-item ${
                  notification.isRead
                    ? "notification-read"
                    : "notification-unread"
                }`}
              >

                {/* ICON */}

                <div className="notification-icon">
                  🔔
                </div>


                {/* CONTENT */}

                <div className="notification-content">

                  <div className="notification-top">

                    <h3>
                      {notification.title}
                    </h3>

                    {!notification.isRead && (
                      <span className="unread-dot">
                        New
                      </span>
                    )}

                  </div>


                  <p>
                    {notification.message}
                  </p>


                  <div className="notification-meta">

                    <span>
                      {notification.type
                        ?.replaceAll(
                          "_",
                          " "
                        )}
                    </span>

                    <span>
                      {notification.createdAt
                        ? new Date(
                            notification.createdAt
                          ).toLocaleString()
                        : ""}
                    </span>

                  </div>

                </div>


                {/* ACTION */}

                {!notification.isRead && (

                  <button
                    className="small-button"
                    onClick={() =>
                      handleMarkAsRead(
                        notification._id
                      )
                    }
                  >
                    Mark as Read
                  </button>

                )}

              </div>

            )
          )

        )}

      </div>

    </div>
  );
};

export default Notifications;