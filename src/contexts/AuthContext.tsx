import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Notification } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  triggerDailyLogin: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("ch_token"));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper for requests
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Request failed");
    }
    return response.json();
  };

  const fetchProfile = async (currentToken: string) => {
    try {
      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (response.ok) {
        const profile = await response.json();
        setUser(profile);
      } else {
        // Token expired/invalid
        logout();
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  // Periodically fetch notifications if logged in
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // 15 seconds poll
      return () => clearInterval(interval);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await authFetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("ch_token", res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (userData: any) => {
    const res = await authFetch("/api/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    localStorage.setItem("ch_token", res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("ch_token");
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const updateProfile = async (data: Partial<User>) => {
    const updatedUser = await authFetch("/api/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    setUser(updatedUser);
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const list = await authFetch("/api/notifications");
      setNotifications(list);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const markNotificationsRead = async () => {
    if (!token) return;
    try {
      await authFetch("/api/notifications/read", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking notifications as read", err);
    }
  };

  const triggerDailyLogin = async () => {
    if (!token) return;
    try {
      const res = await authFetch("/api/daily-login", { method: "POST" });
      if (user) {
        setUser({ ...user, points: res.points });
      }
    } catch (err) {
      console.error("Daily login points already claimed today.", err);
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        notifications,
        unreadCount,
        loading,
        login,
        register,
        logout,
        updateProfile,
        fetchNotifications,
        markNotificationsRead,
        triggerDailyLogin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
