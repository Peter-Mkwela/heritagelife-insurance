// components/NotificationDropdown.tsx
'use client'
import React, { useState, useEffect } from "react";

interface Notification {
  id: number;
  message: string;
  date: string;
  read: boolean;
}

const NotificationDropdown: React.FC = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      // Get email from localStorage
      const email = localStorage.getItem("policyholderEmail");
      if (!email) {
        throw new Error("Email is not available.");
      }

      const response = await fetch(`/api/notifications?email=${encodeURIComponent(email)}`);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data: Notification[] = await response.json();
      setNotifications(data);

      const unread = data.filter((notification) => !notification.read).length;
      setUnreadCount(unread);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="notification-bell-container">
      <div className="notification-bell" onClick={toggleDropdown}>
        <span className="bell-icon">&#128276;</span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>

      {isDropdownOpen && (
        <div className="notifications-dropdown">
          {loading && <p>Loading notifications...</p>}
          {error && <p className="error">{error}</p>}
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? "read" : "unread"}`}
              >
                <p>{notification.message}</p>
                <small className="notification-date">{formatDate(notification.date)}</small>
              </div>
            ))
          ) : (
            <p>No new notifications</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
