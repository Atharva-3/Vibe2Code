import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ISSUE_CATEGORIES, IssueCategory } from "../types";
import CustomMap from "../components/CustomMap";
import { Shield, Camera, Mic, MapPin, Sparkles, Navigation, AlertCircle, FileText, CheckCircle2, Upload } from "lucide-react";

export default function ReportIssue({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { token, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [latitude, setLatitude] = useState(39.7817); // Default Springfield IL center
  const [longitude, setLongitude] = useState(-89.6501);
  const [address, setAddress] = useState("");

  // Visual Preloaded Images (Easy for testing Gemini analysis)
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [customImageBase64, setCustomImageBase64] = useState<string>("");

  // Voice recording simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{ transcription: string; summary: string } | null>(null);

  const testImages = [
    {
      name: "Springfield Asphalt Pothole",
      url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400",
      description: "Huge deep pothole on Springfield Lincoln avenue main street."
    },
    {
      name: "Public Dumpster Waste Overflow",
      url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400",
      description: "Overflowing garbage next to community park entrance."
    },
    {
      name: "Broken Elm Streetlight",
      url: "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&q=80&w=400",
      description: "Dark, completely broken street light casing on Elm street."
    }
  ];

  // Simulated GPS tracker
  const handleAutoGPS = () => {
    // Generate slight random variations around Springfield
    const dLat = (Math.random() - 0.5) * 0.03;
    const dLng = (Math.random() - 0.5) * 0.03;
    const newLat = 39.7817 + dLat;
    const newLng = -89.6501 + dLng;
    setLatitude(Number(newLat.toFixed(4)));
    setLongitude(Number(newLng.toFixed(4)));
    setAddress(`Street Marker #${Math.floor(100 + Math.random() * 900)} Springfield, IL`);
  };

  // Convert custom file upload to base64
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImageBase64(reader.result as string);
        setSelectedImage(""); // clear pre-selected
      };
      reader.readAsDataURL(file);
    }
  };

  // voice reporting trigger
  const handleVoiceReporting = async () => {
    if (isRecording) {
      // Stop recording and send
      setIsRecording(false);
      setLoading(true);
      try {
        // Send simulated dummy voice base64 string to `/api/voice-report`
        const dummyAudio = "dummy-audio-content"; // Backend handles gracefully
        const res = await fetch("/api/voice-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer={token}`
          },
          body: JSON.stringify({ audio: dummyAudio })
        });
        if (res.ok) {
          const result = await res.json();
          setVoiceResult(result);
          setDescription(result.transcription);
          if (result.suggestedCategory) {
            setCategory(result.suggestedCategory);
          }
          setTitle(result.summary);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      // Start simulation
      setIsRecording(true);
      setVoiceResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const imageToSend = customImageBase64 || selectedImage || testImages[0].url;

    try {
      const response = await fetch("/api/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category: category || undefined, // If blank, AI will analyze/predict it!
          latitude,
          longitude,
          address: address || "Springfield, IL",
          images: [imageToSend]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data);
        await refreshProfile(); // update citizen points
      } else {
        const err = await response.json();
        setError(err.error || "Failed to submit report");
      }
    } catch (err) {
      setError("Server connection failure, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="space-y-1.5 text-center md:text-left">
        <h1 className="text-xl font-black tracking-tight flex items-center gap-2 justify-center md:justify-start">
          <Shield className="w-6 h-6 text-blue-600 animate-pulse" />
          <span>Report Neighborhood Civil Hazard</span>
        </h1>
        <p className="text-xs text-slate-400">
          Our real-time Gemini AI agent will predict category, check duplicate reports, and dispatch to authorities immediately.
        </p>
      </div>

      {success ? (
        <div className="bg-white dark:bg-slate-900 border border-emerald-150 p-8 rounded-3xl shadow-xl text-center space-y-5 animate-fadeIn">
          <div className="mx-auto h-16 w-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-slate-850 dark:text-slate-100">Report Successfully Submitted!</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your ticket has been catalogued. Gemini vision analyzed the image and determined details:
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-800 text-left space-y-2">
            <p className="text-xs font-bold flex justify-between">
              <span className="text-slate-400 uppercase">Assigned Authority:</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{success.issue.assignedAuthority}</span>
            </p>
            <p className="text-xs font-bold flex justify-between">
              <span className="text-slate-400 uppercase">AI Category Prediction:</span>
              <span className="text-indigo-600 dark:text-indigo-400">{success.issue.predictedCategory} ({success.issue.confidence || 96}% confidence)</span>
            </p>
            <p className="text-xs font-bold flex justify-between">
              <span className="text-slate-400 uppercase">Severity Level:</span>
              <span className="text-rose-500">{success.issue.severity}</span>
            </p>
            {success.duplicateFound && (
              <div className="mt-4 p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 rounded-xl text-xs text-rose-700 dark:text-rose-400 font-bold">
                ⚠️ Gemini identified a potential duplicate nearby!
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate("dashboard")}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setSuccess(null);
                setTitle("");
                setDescription("");
                setCategory("");
              }}
              className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              Report Another Concern
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid md:grid-cols-12 gap-6 items-start">
          {/* Left Inputs Panel */}
          <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Voice reporting block */}
            <div className="p-4 bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-850 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Speak Your Report
                </h3>
                <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs">
                  Too cold or busy to type? Speak directly. Gemini will transcribe & structure your report automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={handleVoiceReporting}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-all ${
                  isRecording ? "bg-rose-600 animate-pulse scale-105" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            {isRecording && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-xl text-center space-y-2">
                <div className="flex gap-1 justify-center py-2 items-center h-4">
                  <span className="w-1 h-3 bg-blue-500 rounded animate-bounce" style={{ animationDelay: "0s" }} />
                  <span className="w-1 h-4 bg-blue-500 rounded animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="w-1 h-2 bg-blue-500 rounded animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1 h-3 bg-blue-500 rounded animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider animate-pulse">Simulating Microphone Capture... Click Mic again to submit</p>
              </div>
            )}

            {voiceResult && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs space-y-1">
                <p className="font-extrabold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> AI Voice Analysis Complete
                </p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed italic">"{voiceResult.transcription}"</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Title / Summary</label>
              <input
                type="text"
                placeholder="e.g. Broken streetlight causing pitch black corner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description of Hazard</label>
              <textarea
                placeholder="Explain the damage. How does it affect motorists or children? Mention any safety risk factors."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none h-24 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category (Optional)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none font-semibold text-slate-600 dark:text-slate-300"
                >
                  <option value="">🔮 Leave empty for Gemini Prediction</option>
                  {ISSUE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GPS Coordinates</label>
                <button
                  type="button"
                  onClick={handleAutoGPS}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                  <span>Get Device GPS ({latitude}, {longitude})</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Street Address / Landmark Details</label>
              <input
                type="text"
                placeholder="e.g. Near Community Park East Gate, Springfield IL"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm tracking-wide shadow-md transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-1.5"
            >
              {loading ? "AI Analyzing Report..." : "Submit Report to Council"}
            </button>
          </div>

          {/* Right Column: Visual Attachments & Proximity Board */}
          <div className="md:col-span-5 space-y-6">
            {/* Visual attachments card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Camera className="w-4 h-4" /> Visual Attachments
              </h3>

              {/* Grid of test presets */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase text-slate-400">Presetted Civic Presets (For Gemini testing)</label>
                <div className="grid grid-cols-3 gap-2">
                  {testImages.map((img) => (
                    <div
                      key={img.name}
                      onClick={() => {
                        setSelectedImage(img.url);
                        setCustomImageBase64(""); // clear custom
                        setDescription(img.description);
                        setTitle(img.name);
                      }}
                      className={`h-16 rounded-lg overflow-hidden cursor-pointer relative border-2 ${
                        selectedImage === img.url ? "border-blue-600 scale-105" : "border-slate-200"
                      }`}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom uploader */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
                <label className="text-[9px] font-bold uppercase text-slate-400 block mb-2">Or Upload Custom Image</label>
                <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-slate-500">Drag/Drop or click to browse</p>
                  <p className="text-[8px] text-slate-400 mt-1">PNG, JPG, or JPEG up to 10MB</p>
                </div>
              </div>

              {(selectedImage || customImageBase64) && (
                <div className="h-44 rounded-xl overflow-hidden border border-slate-200 relative">
                  <img src={customImageBase64 || selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[9px] px-2 py-0.5 rounded font-semibold">Image Ready for Gemini Vision Analysis</span>
                </div>
              )}
            </div>

            {/* Click-to-Pin Springfield Mini Map */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Drop pin on Springfield Map
              </h3>
              <CustomMap
                issues={[]}
                selectable={true}
                selectedCoords={{ lat: latitude, lng: longitude }}
                onCoordsChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                  setAddress(`Custom Grid Pin, Springfield IL`);
                }}
                height="h-[250px]"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
