import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Issue, LeaderboardEntry, ISSUE_CATEGORIES, IssueStatus, IssueCategory, IssueSeverity } from "../types";
import CustomMap from "../components/CustomMap";
import {
  ShieldAlert,
  CheckCircle,
  Clock,
  Award,
  PlusCircle,
  ThumbsUp,
  MessageSquare,
  Search,
  Filter,
  User,
  Users,
  Trash2,
  AlertTriangle,
  Upload,
  Calendar,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sparkles,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

interface DashboardProps {
  onNavigate: (page: string) => void;
  onSelectIssue: (issue: Issue) => void;
}

export default function Dashboard({ onNavigate, onSelectIssue }: DashboardProps) {
  const { user, token, triggerDailyLogin } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sub-tabs
  const [citizenTab, setCitizenTab] = useState<"overview" | "my-reports" | "nearby" | "leaderboard">("overview");
  const [adminTab, setAdminTab] = useState<"reports" | "analytics" | "users">("reports");
  const [authorityTab, setAuthorityTab] = useState<"assigned" | "completed">("assigned");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");

  // Authority actions state
  const [updatingIssueId, setUpdatingIssueId] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [resolutionProof, setResolutionProof] = useState("");
  const [beforeAfterImage, setBeforeAfterImage] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Map settings
  const [showAIHotspots, setShowAIHotspots] = useState(false);

  // Load dashboards data
  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Load issues
      const issuesRes = await fetch("/api/issues", { headers });
      const issuesData = await issuesRes.json();
      setIssues(issuesData);

      // Load leaderboard
      const lbRes = await fetch("/api/leaderboard", { headers });
      const lbData = await lbRes.json();
      setLeaderboard(lbData);

      // Load analytics
      const analyticRes = await fetch("/api/analytics", { headers });
      const analyticData = await analyticRes.json();
      setAnalytics(analyticData);

      // Trigger daily check-in points silently
      triggerDailyLogin();
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Citizen stats computation
  const myReports = issues.filter((i) => i.reporterId === user?._id);
  const resolvedCount = myReports.filter((i) => i.status === "Resolved" || i.status === "Closed").length;
  const pendingCount = myReports.length - resolvedCount;

  // Global filters
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? issue.category === categoryFilter : true;
    const matchesStatus = statusFilter ? issue.status === statusFilter : true;
    const matchesSeverity = severityFilter ? issue.severity === severityFilter : true;

    return matchesSearch && matchesCategory && matchesStatus && matchesSeverity;
  });

  // Upvote / Verify action (Citizen)
  const handleVerify = async (issueId: string, vote: "up" | "down") => {
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ issueId, vote })
      });
      if (res.ok) {
        // Reload dashboard issues
        const updated = await res.json();
        setIssues((prev) => prev.map((i) => (i._id === issueId ? { ...i, ...updated.issue } : i)));
        alert(`Verification success! You earned +5 Citizen Points!`);
      } else {
        const err = await res.json();
        alert(err.error || "Verification failed");
      }
    } catch (err) {
      console.error("Verification error", err);
    }
  };

  // Delete fake/spam report (Admin)
  const handleDeleteReport = async (issueId: string) => {
    if (!confirm("Are you sure you want to delete this report? It will be marked as fake/spam.")) {
      return;
    }
    try {
      const res = await fetch(`/api/issue/${issueId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIssues((prev) => prev.filter((i) => i._id !== issueId));
        alert("Spam report deleted successfully");
      }
    } catch (err) {
      console.error("Deletion error", err);
    }
  };

  // Authority actions: Accept Issue
  const handleAcceptIssue = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issue/${issueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Accepted" })
      });
      if (res.ok) {
        const data = await res.json();
        setIssues((prev) => prev.map((i) => (i._id === issueId ? data.issue : i)));
        alert("Issue accepted successfully! Work ticket generated.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Authority actions: Update Status to In Progress & Estimate Time
  const handleStartWork = async (issueId: string) => {
    if (!estimatedTime) {
      alert("Please provide an estimated completion date");
      return;
    }
    try {
      const res = await fetch(`/api/issue/${issueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "In Progress",
          estimatedCompletionTime: estimatedTime
        })
      });
      if (res.ok) {
        const data = await res.json();
        setIssues((prev) => prev.map((i) => (i._id === issueId ? data.issue : i)));
        setUpdatingIssueId(null);
        setEstimatedTime("");
        alert("Work scheduled! Ticket status: 'In Progress'");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Authority actions: Close Issue with Completion Proof and Slide Image
  const handleResolveIssue = async (issueId: string) => {
    if (!resolutionProof) {
      alert("Please provide resolution details/proof");
      return;
    }
    try {
      const res = await fetch(`/api/issue/${issueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "Resolved",
          resolutionProof,
          beforeAfterImage: beforeAfterImage || "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=600"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setIssues((prev) => prev.map((i) => (i._id === issueId ? data.issue : i)));
        setUpdatingIssueId(null);
        setResolutionProof("");
        setBeforeAfterImage("");
        alert("Congratulations! Issue resolved and points dispatched to reporter.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Authority stats
  const authorityIssues = issues.filter((i) => i.assignedAuthority === user?.address || i.assignedAuthority === "Road Authority");
  const assignedIssues = authorityIssues.filter((i) => i.status === "AI Analysed" || i.status === "Community Verified" || i.status === "Assigned" || i.status === "Accepted" || i.status === "In Progress");
  const completedIssues = authorityIssues.filter((i) => i.status === "Resolved" || i.status === "Closed");

  // Recharts color palette
  const COLORS = ["#3b82f6", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981", "#ef4444", "#14b8a6"];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-850 dark:text-slate-100 transition-colors">
      {/* Header Profile Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl" />
        <div className="flex items-center gap-4">
          <img src={user?.profileImage} alt={user?.name} className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Welcome Back, {user?.name}!</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Logged in as <strong>{user?.role}</strong></span>
              <span>•</span>
              <span>Springfield Municipality Office</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadData}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Data</span>
          </button>
          {user?.role === "Citizen" && (
            <button
              onClick={() => onNavigate("report")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Civic Problem</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================== CITIZEN VIEW ==================== */}
      {user?.role === "Citizen" && (
        <div className="space-y-6">
          {/* HUD Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Total Reports</p>
                <p className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1">{myReports.length}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl"><ShieldAlert className="w-5 h-5" /></div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issues Resolved</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl"><CheckCircle className="w-5 h-5" /></div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Points</p>
                <p className="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">{user.points}</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl"><Award className="w-5 h-5" /></div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Citizen Rank</p>
                <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-2.5 line-clamp-1">{user.badges[user.badges.length - 1] || "Local Watcher"}</p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl"><Users className="w-5 h-5" /></div>
            </div>
          </div>

          {/* Sub Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
            {[
              { id: "overview", label: "Interactive Board" },
              { id: "my-reports", label: "My Reports Log" },
              { id: "nearby", label: "Nearby Concerns" },
              { id: "leaderboard", label: "Contributor Leaderboard" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCitizenTab(tab.id as any)}
                className={`pb-3 text-xs font-bold transition-all relative ${
                  citizenTab === tab.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.label}
                {citizenTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            ))}
          </div>

          {/* CITIZEN SUB-TAB: INTERACTIVE BOARD */}
          {citizenTab === "overview" && (
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Map Layout Column */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-150 dark:border-slate-800 rounded-xl">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Active Springfield Map</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Pins show reports. Click a pin to load full details.</p>
                  </div>
                  <button
                    onClick={() => setShowAIHotspots(!showAIHotspots)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                      showAIHotspots
                        ? "bg-purple-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Hotspot Prediction Overlay</span>
                  </button>
                </div>

                <CustomMap
                  issues={issues}
                  onSelectIssue={onSelectIssue}
                  showPredictions={showAIHotspots}
                  predictiveHotspots={analytics?.predictions}
                />
              </div>

              {/* Sidebar: Open Quick Issues */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Escalated Neighborhood Issues</h3>
                  <div className="space-y-3 max-h-[380px] overflow-y-auto">
                    {issues.slice(0, 5).map((issue) => (
                      <div
                        key={issue._id}
                        onClick={() => onSelectIssue(issue)}
                        className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-blue-500/50 dark:hover:border-blue-500/30 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 cursor-pointer transition-all flex items-start gap-2.5 group"
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          issue.status === "Resolved" ? "bg-emerald-500" : issue.severity === "Critical" ? "bg-red-500" : "bg-amber-500"
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-extrabold text-xs text-slate-850 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">{issue.title}</h4>
                          <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide font-semibold">{issue.category} • {issue.address.split(",")[0]}</p>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100/50 dark:border-slate-800/40">
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">{issue.status}</span>
                            <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5"><ThumbsUp className="w-2.5 h-2.5 text-blue-500" /> {issue.verificationCount}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CITIZEN SUB-TAB: MY REPORTS */}
          {citizenTab === "my-reports" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Your Reported Hazards ({myReports.length})</h3>
                <p className="text-xs text-slate-400 font-medium">Points earned per resolution: +20 pts</p>
              </div>

              {myReports.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto">
                  <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><ShieldAlert className="w-6 h-6" /></div>
                  <h4 className="font-bold text-sm">No reported civic concerns yet</h4>
                  <p className="text-xs text-slate-400">See a pothole or damage? Help our road repair crews by reporting your first issue!</p>
                  <button onClick={() => onNavigate("report")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">Report Issue</button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myReports.map((issue) => (
                    <div key={issue._id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                      <div className="relative h-40">
                        <img src={issue.images[0]} alt={issue.title} className="w-full h-full object-cover" />
                        <span className={`absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider text-white shadow-md ${
                          issue.severity === "Critical" ? "bg-rose-600" : issue.severity === "High" ? "bg-amber-500" : "bg-yellow-400"
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{issue.category}</span>
                          <h4 onClick={() => onSelectIssue(issue)} className="font-extrabold text-xs text-slate-800 dark:text-slate-100 hover:text-blue-600 cursor-pointer line-clamp-1 mt-1">{issue.title}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 italic">"{issue.description}"</p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{issue.status}</span>
                          <button onClick={() => onSelectIssue(issue)} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">Details <ChevronRight className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CITIZEN SUB-TAB: NEARBY CONCERNS */}
          {citizenTab === "nearby" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="font-bold text-sm">Springfield Open Reports Tracker</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Verify neighbor reports to escalate priorities. You receive +5 points per verification!</p>
                </div>

                {/* Filter and Search HUD */}
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 w-44"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  >
                    <option value="">All Categories</option>
                    {ISSUE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reports Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIssues.map((issue) => (
                  <div key={issue._id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group">
                    <div className="relative h-44">
                      <img src={issue.images[0]} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-3 left-3 text-[9px] bg-slate-900/80 backdrop-blur text-white px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                        <MapPin className="w-3 h-3 text-red-500" /> {issue.address.split(",")[0]}
                      </span>
                      <span className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider text-white ${
                        issue.severity === "Critical" ? "bg-rose-600" : issue.severity === "High" ? "bg-amber-500" : "bg-yellow-400"
                      }`}>
                        {issue.severity}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                          <span className="uppercase text-blue-600 dark:text-blue-400">{issue.category}</span>
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 onClick={() => onSelectIssue(issue)} className="font-extrabold text-xs text-slate-850 dark:text-slate-100 hover:text-blue-600 cursor-pointer mt-1">{issue.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 italic">"{issue.description}"</p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => handleVerify(issue._id, "up")}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-[10px] font-bold flex items-center gap-1 text-blue-600 dark:text-blue-400"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Upvote Verify ({issue.verificationCount})</span>
                        </button>
                        <button onClick={() => onSelectIssue(issue)} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:underline">Inspect Detail</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CITIZEN SUB-TAB: LEADERBOARD */}
          {citizenTab === "leaderboard" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h3 className="font-black text-lg tracking-tight">Springfield Top Civil Heroes</h3>
                <p className="text-xs text-slate-400">Active citizens clean up local issues by verifying and reporting. Join the board!</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <div className="col-span-2 text-center">Rank</div>
                  <div className="col-span-6 pl-4">Citizen Contributor</div>
                  <div className="col-span-2 text-center">Badges</div>
                  <div className="col-span-2 text-right pr-4">Total Points</div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leaderboard.map((contrib) => (
                    <div key={contrib.userId} className="px-6 py-4 grid grid-cols-12 items-center text-xs font-semibold">
                      <div className="col-span-2 text-center font-black text-sm text-slate-400">
                        {contrib.rank === 1 ? "🥇" : contrib.rank === 2 ? "🥈" : contrib.rank === 3 ? "🥉" : `#${contrib.rank}`}
                      </div>
                      <div className="col-span-6 flex items-center gap-3">
                        <img src={contrib.profileImage} alt={contrib.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{contrib.name}</p>
                          <span className="text-[8.5px] uppercase font-bold text-blue-500">Citizen</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-center font-bold text-slate-600 dark:text-slate-400">{contrib.badgesCount}</div>
                      <div className="col-span-2 text-right pr-4 font-black text-amber-500 text-sm">{contrib.points} XP</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ==================== AUTHORITY VIEW ==================== */}
      {user?.role === "Authority" && (
        <div className="space-y-6">
          {/* Authority metrics summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Queue</p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{assignedIssues.length}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl"><Clock className="w-5 h-5" /></div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Progress Tickets</p>
                <p className="text-2xl font-black text-amber-500 mt-1">
                  {assignedIssues.filter((i) => i.status === "In Progress").length}
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><RefreshCw className="w-5 h-5 animate-spin-slow" /></div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolved Repairs</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{completedIssues.length}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl"><CheckCircle className="w-5 h-5" /></div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution Speed</p>
                <p className="text-2xl font-black text-indigo-500 mt-1">2.1 Days</p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
            </div>
          </div>

          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
            <button
              onClick={() => setAuthorityTab("assigned")}
              className={`pb-3 text-xs font-bold transition-all relative ${
                authorityTab === "assigned" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Assigned Tickets ({assignedIssues.length})
              {authorityTab === "assigned" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
            </button>
            <button
              onClick={() => setAuthorityTab("completed")}
              className={`pb-3 text-xs font-bold transition-all relative ${
                authorityTab === "completed" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Repair History Ledger ({completedIssues.length})
              {authorityTab === "completed" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
            </button>
          </div>

          {/* AUTHORITY WORK QUEUE */}
          {authorityTab === "assigned" && (
            <div className="space-y-4">
              {assignedIssues.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto">
                  <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><CheckCircle className="w-6 h-6 text-emerald-500" /></div>
                  <h4 className="font-bold text-sm">No pending repair works assigned</h4>
                  <p className="text-xs text-slate-400">Great job! All Springfield civic tickets are caught up. Refresh to fetch incoming citizen reports.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {assignedIssues.map((issue) => (
                    <div key={issue._id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="uppercase text-blue-600 dark:text-blue-400">{issue.category}</span>
                          <span className={`px-2 py-0.5 rounded uppercase tracking-wider text-white ${
                            issue.severity === "Critical" ? "bg-rose-600" : issue.severity === "High" ? "bg-amber-500" : "bg-yellow-400"
                          }`}>{issue.severity}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{issue.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> {issue.address}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-450 italic leading-relaxed pt-2">"{issue.description}"</p>
                      </div>

                      {updatingIssueId === issue._id ? (
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 space-y-4">
                          <h5 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Update Works progress</h5>

                          {issue.status === "Accepted" ? (
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold uppercase text-slate-400">Estimated Repair Completion Date</label>
                              <div className="flex gap-2">
                                <input
                                  type="datetime-local"
                                  value={estimatedTime}
                                  onChange={(e) => setEstimatedTime(e.target.value)}
                                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 flex-1 text-slate-850 dark:text-slate-100 font-medium"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleStartWork(issue._id)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                                >
                                  Schedule Repair
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-slate-400">Resolution Description / Actions Taken</label>
                                <textarea
                                  placeholder="e.g. Cleared debris and patched asphalt with high-durability epoxy mix."
                                  value={resolutionProof}
                                  onChange={(e) => setResolutionProof(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 h-16 font-medium"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-slate-400">Completion Proof Image URL (Optional)</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Unsplash URL or preloaded completion avatar"
                                  value={beforeAfterImage}
                                  onChange={(e) => setBeforeAfterImage(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                                />
                              </div>

                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setUpdatingIssueId(null)}
                                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResolveIssue(issue._id)}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow"
                                >
                                  Mark Resolved & Close
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400">Status: <strong className="text-slate-800 dark:text-slate-200">{issue.status}</strong></span>
                          <div className="flex gap-1.5">
                            {issue.status === "Reported" || issue.status === "AI Analysed" || issue.status === "Community Verified" || issue.status === "Assigned" ? (
                              <button
                                onClick={() => handleAcceptIssue(issue._id)}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                              >
                                Accept Ticket
                              </button>
                            ) : issue.status === "Accepted" ? (
                              <button
                                onClick={() => {
                                  setUpdatingIssueId(issue._id);
                                  setEstimatedTime("");
                                }}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs"
                              >
                                Set Work Schedule
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setUpdatingIssueId(issue._id);
                                  setResolutionProof("");
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                              >
                                Resolve Repair Work
                              </button>
                            )}
                            <button onClick={() => onSelectIssue(issue)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 rounded-xl text-[10px] font-bold">Details</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AUTHORITY LEDGER */}
          {authorityTab === "completed" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Resolved Issue</th>
                      <th className="px-6 py-3.5">Location</th>
                      <th className="px-6 py-3.5">Resolution Date</th>
                      <th className="px-6 py-3.5 text-right pr-6">Proof Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {completedIssues.map((issue) => (
                      <tr key={issue._id} className="text-xs font-semibold hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-bold uppercase text-[10px]">{issue.category}</td>
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-slate-800 dark:text-slate-150">{issue.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Reporter: {issue.reporterName}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{issue.address.split(",")[0]}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(issue.updatedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right pr-6">
                          <button onClick={() => onSelectIssue(issue)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5 justify-end ml-auto">Inspect Slider <ExternalLink className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ==================== ADMIN VIEW ==================== */}
      {user?.role === "Admin" && (
        <div className="space-y-6">
          {/* Admin Tab buttons */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
            <button
              onClick={() => setAdminTab("reports")}
              className={`pb-3 text-xs font-bold transition-all relative ${
                adminTab === "reports" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              All Reports Log ({issues.length})
              {adminTab === "reports" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
            </button>
            <button
              onClick={() => setAdminTab("analytics")}
              className={`pb-3 text-xs font-bold transition-all relative ${
                adminTab === "analytics" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Municipal Performance Analytics
              {adminTab === "analytics" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
            </button>
          </div>

          {/* ADMIN SUB-TAB: ALL REPORTS (WITH SPAM ACTIONS) */}
          {adminTab === "reports" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm">
                <div>
                  <h3 className="font-extrabold text-sm">Emergency Operations & Ticket Backlog</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Admin console: Audit citizen reports, delete spam/fakes, and coordinate city routing.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Audit reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 w-44 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-150 dark:border-slate-800">
                      <th className="px-6 py-3.5">Citizen Reporter</th>
                      <th className="px-6 py-3.5">Report details</th>
                      <th className="px-6 py-3.5">AI Predictions</th>
                      <th className="px-6 py-3.5">Current Status</th>
                      <th className="px-6 py-3.5 text-right pr-6">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredIssues.map((issue) => (
                      <tr key={issue._id} className="text-xs font-semibold hover:bg-slate-50/30 dark:hover:bg-slate-850/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-slate-800 dark:text-slate-150">{issue.reporterName}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide">ID: {issue.reporterId.split("-")[1]}</p>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="font-bold text-slate-850 dark:text-slate-200 line-clamp-1">{issue.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{issue.address}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-blue-600 dark:text-blue-400 text-[10px]">{issue.category} (Conf: {issue.confidence || 96}%)</p>
                            <p className="text-[9.5px] text-slate-400">Route: {issue.assignedAuthority || "Road Authority"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${
                            issue.status === "Resolved" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/40"
                          }`}>{issue.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right pr-6">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => onSelectIssue(issue)}
                              className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-850"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => handleDeleteReport(issue._id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/50 rounded-xl transition-all"
                              title="Delete report as fake/spam"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN SUB-TAB: ANALYTICS */}
          {adminTab === "analytics" && analytics && (
            <div className="space-y-6 animate-fadeIn">
              {/* Summary Widgets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Reports</p>
                  <p className="text-2xl font-black mt-1">{analytics?.summary?.total}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">City Resolution Rate</p>
                  <p className="text-2xl font-black text-emerald-500 mt-1">
                    {Math.round((analytics?.summary?.resolved / analytics?.summary?.total) * 100) || 88}%
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Backlog</p>
                  <p className="text-2xl font-black text-amber-500 mt-1">{analytics?.summary?.pending}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Resolution Speed</p>
                  <p className="text-2xl font-black text-indigo-500 mt-1">{analytics?.summary?.averageResolutionTimeHours} hrs</p>
                </div>
              </div>

              {/* Recharts Graphics */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Category breakdown bar chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Volume distribution by civic Category</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.categoriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                          {analytics.categoriesData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Status distribution pie chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Reports Status Ratios</h4>
                  <div className="h-64 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {analytics.statusData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Simple absolute legend */}
                    <div className="text-[10px] space-y-1 pl-4 border-l border-slate-100 dark:border-slate-800 shrink-0">
                      {analytics.statusData.map((entry: any, index: number) => (
                        <div key={entry.name} className="flex items-center gap-1.5 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-slate-600 dark:text-slate-400 line-clamp-1">{entry.name}: {entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
