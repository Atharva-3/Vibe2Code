import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Issue, Comment } from "../types";
import CustomMap from "../components/CustomMap";
import { Shield, ThumbsUp, Calendar, Clock, MapPin, User, MessageSquare, CornerDownRight, CheckCircle2, ChevronLeft, ArrowRight, ShieldCheck } from "lucide-react";

export default function IssueDetail({ issueId, onNavigate }: { issueId: string; onNavigate: (page: string) => void }) {
  const { user, token } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // New Comment State
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Load issue details
  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/issue/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIssue(data.issue);
        setComments(data.comments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && issueId) {
      fetchDetails();
    }
  }, [token, issueId]);

  // Comment submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ issueId, comment: newComment })
      });
      if (res.ok) {
        const addedComment = await res.json();
        setComments((prev) => [...prev, addedComment]);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  // Upvote / Verify
  const handleVerify = async () => {
    if (!issue) return;
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ issueId: issue._id, vote: "up" })
      });
      if (res.ok) {
        const updated = await res.json();
        setIssue(updated.issue);
        alert("Verification logged! You earned +5 Citizen Contribution Points!");
      } else {
        const err = await res.json();
        alert(err.error || "Already verified");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTimelineStepClass = (currentStatus: string, stepStatus: string[], index: number, total: number) => {
    const statusOrder = ["Reported", "AI Analysed", "Community Verified", "Accepted", "In Progress", "Resolved", "Closed"];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = Math.max(...stepStatus.map(s => statusOrder.indexOf(s)));

    if (currentIdx >= stepIdx) {
      return {
        line: "bg-blue-600",
        circle: "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/40",
        text: "text-blue-600 dark:text-blue-400 font-bold"
      };
    }
    return {
      line: "bg-slate-200 dark:bg-slate-800",
      circle: "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700",
      text: "text-slate-400 dark:text-slate-500"
    };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 space-y-8 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-8 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="col-span-4 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <h2 className="text-lg font-bold">Report not found</h2>
        <button onClick={() => onNavigate("dashboard")} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Navigation and Title */}
      <div className="space-y-3">
        <button
          onClick={() => onNavigate("dashboard")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{issue.category}</span>
            <h1 className="text-xl font-black text-slate-850 dark:text-slate-100 leading-tight">{issue.title}</h1>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>{issue.address}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wide text-white ${
              issue.severity === "Critical" ? "bg-rose-600" : issue.severity === "High" ? "bg-amber-500" : "bg-yellow-400"
            }`}>
              {issue.severity} Priority
            </span>
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-700 dark:text-slate-300">
              {issue.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visuals, details, comment board */}
        <div className="md:col-span-8 space-y-6">
          {/* Repair Slider / Images Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {issue.status === "Resolved" || issue.status === "Closed" ? (
              /* Before vs After Slider Side-By-Side */
              <div className="space-y-4 p-5">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Before / After Sliders
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Before (Hazard)</p>
                    <div className="h-44 rounded-xl overflow-hidden border border-slate-100">
                      <img src={issue.images[0]} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase">After (Resolved Repair)</p>
                    <div className="h-44 rounded-xl overflow-hidden border border-slate-100 relative">
                      <img src={issue.beforeAfterImage || "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=400"} alt="After" className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">Works Proof</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Resolution summary / proof report</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{issue.resolutionProof || "Problem resolved successfully and checked by municipal road maintenance team."}"</p>
                </div>
              </div>
            ) : (
              /* Just standard Image display */
              <div className="relative h-80">
                <img src={issue.images[0]} alt={issue.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> GPS Locked: ({issue.latitude}, {issue.longitude})
                </span>
              </div>
            )}
          </div>

          {/* Timeline and description */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="space-y-2">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Hazard Details</h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-350 leading-relaxed italic">
                "{issue.description}"
              </p>
            </div>

            {/* AI Diagnostics details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Predicted Category</p>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>{issue.predictedCategory || issue.category} ({issue.confidence || 96}%)</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Authority Office</p>
                <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-wide">{issue.assignedAuthority || "Road Authority"}</p>
              </div>
            </div>

            {/* Repair Progress Timeline (Feature 1 status track) */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Repair Pipeline Progress</h3>
              <div className="flex justify-between relative pt-3">
                {/* Horizontal line */}
                <div className="absolute top-7.5 left-[10%] right-[10%] h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />

                {[
                  { label: "Reported", statuses: ["Reported"] },
                  { label: "Community Verified", statuses: ["Community Verified", "Assigned"] },
                  { label: "Repair Scheduled", statuses: ["Accepted", "In Progress"] },
                  { label: "Resolved", statuses: ["Resolved", "Closed"] }
                ].map((step, idx) => {
                  const style = getTimelineStepClass(issue.status, step.statuses, idx, 4);
                  return (
                    <div key={idx} className="flex flex-col items-center space-y-2 z-10 flex-1 text-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${style.circle}`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold ${style.text}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comment board */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <MessageSquare className="w-4 h-4" /> Neighbor Discussions ({comments.length})
            </h3>

            {/* Add comment form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-3">
              <img src={user?.profileImage} alt={user?.name} className="w-8 h-8 rounded-full object-cover border" />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Share details or update neighbors about repairs..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={commentLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Post
                </button>
              </div>
            </form>

            {/* Comments Feed */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic text-center py-4">No comments posted yet. Start the conversation!</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="flex gap-3 text-xs items-start">
                    <img src={c.userImage} alt={c.userName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl flex-1 border border-slate-150 dark:border-slate-850">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-slate-800 dark:text-slate-150 flex items-center gap-1.5">
                          <span>{c.userName}</span>
                          <span className={`inline-block text-[8.5px] font-extrabold px-1.5 py-0.2 rounded border uppercase ${
                            c.userRole === "Admin" ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40" : c.userRole === "Authority" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40" : "bg-blue-100 text-blue-800 dark:bg-blue-950/40"
                          }`}>{c.userRole}</span>
                        </p>
                        <span className="text-[9px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium mt-1.5 leading-relaxed">"{c.comment}"</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Map context & actions */}
        <div className="md:col-span-4 space-y-6">
          {/* Quick Actions (Verify) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4 text-center">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Escalate Priorities</h3>
            <p className="text-[10px] text-slate-400">Have you noticed this issue too? Upvote to escalate this to high-priority repairs.</p>

            <button
              onClick={handleVerify}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <ThumbsUp className="w-4 h-4 animate-bounce" />
              <span>Verify & Support Ticket</span>
            </button>
            <p className="text-[9px] text-slate-400">Total Verification upvotes: <strong>{issue.verificationCount} citizens</strong></p>
          </div>

          {/* Mini street tracker map */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Street Map Context</h3>
            <CustomMap
              issues={[issue]}
              height="h-[200px]"
            />
            <div className="space-y-1 pt-1 text-[10px]">
              <p className="font-bold flex justify-between text-slate-500">
                <span>LATITUDE:</span> <span className="font-mono">{issue.latitude}</span>
              </p>
              <p className="font-bold flex justify-between text-slate-500">
                <span>LONGITUDE:</span> <span className="font-mono">{issue.longitude}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
