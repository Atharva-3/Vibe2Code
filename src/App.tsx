import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import IssueDetail from "./pages/IssueDetail";
import { Issue } from "./types";

function AppContent() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>("landing");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Sync route selection based on Auth State
  useEffect(() => {
    if (user && (currentPage === "landing" || currentPage.startsWith("auth-"))) {
      setCurrentPage("dashboard");
    } else if (!user && (currentPage === "dashboard" || currentPage === "report" || currentPage === "detail")) {
      setCurrentPage("landing");
    }
  }, [user]);

  // Route router switcher
  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onNavigate={setCurrentPage} />;
      case "auth-login":
        return <AuthPage defaultTab="login" onNavigate={setCurrentPage} />;
      case "auth-register":
        return <AuthPage defaultTab="register" onNavigate={setCurrentPage} />;
      case "dashboard":
        return (
          <Dashboard
            onNavigate={setCurrentPage}
            onSelectIssue={(issue) => {
              setSelectedIssue(issue);
              setCurrentPage("detail");
            }}
          />
        );
      case "report":
        return <ReportIssue onNavigate={setCurrentPage} />;
      case "detail":
        return selectedIssue ? (
          <IssueDetail
            issueId={selectedIssue._id}
            onNavigate={setCurrentPage}
          />
        ) : (
          <Dashboard
            onNavigate={setCurrentPage}
            onSelectIssue={(issue) => {
              setSelectedIssue(issue);
              setCurrentPage("detail");
            }}
          />
        );
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-250 flex flex-col">
      {/* Top Navigation HUD */}
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />

      {/* Main viewport */}
      <main className="flex-1">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
