import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Bell, LogOut, Award, Shield, User as UserIcon, Moon, Sun, Menu, X, CheckSquare, Settings } from "lucide-react";

export default function Navbar({ onNavigate, currentPage }: { onNavigate: (page: string) => void; currentPage: string }) {
  const { user, logout, notifications, unreadCount, markNotificationsRead } = useAuth();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleNotifClick = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown && unreadCount > 0) {
      markNotificationsRead();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-rose-500/10 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      case "Authority":
        return "bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      default:
        return "bg-blue-500/10 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("landing")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <Shield className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Community Hero
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                AI Civic Solver
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          {user && (
            <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
              {[
                { id: "dashboard", label: "Dashboard" },
                { id: "report", label: "Report Issue" },
                { id: "leaderboard", label: "Leaderboard" },
                { id: "analytics", label: "Analytics" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onNavigate(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    currentPage === tab.id
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Right actions: HUD and Profile Dropdown */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Gamification Indicator */}
            {user && user.role === "Citizen" && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onNavigate("profile")}
                title="Your citizen contribution points"
              >
                <Award className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">
                  {user.points} <span className="font-semibold text-[10px] text-amber-600/80">pts</span>
                </span>
              </div>
            )}

            {/* Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Notification Tray */}
            {user && (
              <div className="relative">
                <button
                  onClick={handleNotifClick}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-600 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-1 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400 font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-400">
                          All quiet. No notifications yet!
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                              !notif.read ? "bg-blue-50/50 dark:bg-blue-950/10" : ""
                            }`}
                          >
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {notif.title}
                            </h5>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <div
                      className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                      onClick={() => {
                        onNavigate("notifications");
                        setShowNotifDropdown(false);
                      }}
                    >
                      View all notifications
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown or Auth Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate("profile")}
                  className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="hidden lg:block text-left pl-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{user.name}</p>
                    <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded border uppercase mt-0.5 ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    logout();
                    onNavigate("landing");
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate("auth-login")}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate("auth-register")}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 md:hidden rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1.5">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "report", label: "Report Issue" },
            { id: "leaderboard", label: "Leaderboard" },
            { id: "analytics", label: "Analytics" },
            { id: "profile", label: "My Profile" },
            { id: "notifications", label: "Notifications" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onNavigate(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                currentPage === tab.id
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-55"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => {
              logout();
              onNavigate("landing");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}
