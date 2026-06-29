import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Shield, Mail, Lock, Phone, User, Home, MapPin, Check, AlertCircle, Sparkles } from "lucide-react";

export default function AuthPage({ defaultTab = "login", onNavigate }: { defaultTab?: "login" | "register"; onNavigate: (page: string) => void }) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register inputs
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regCity, setRegCity] = useState("Springfield");
  const [regState, setRegState] = useState("Illinois");
  const [regPin, setRegPin] = useState("");
  const [regRole, setRegRole] = useState<"Citizen" | "Admin" | "Authority">("Citizen");
  const [selectedAvatar, setSelectedAvatar] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  );

  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", // Citizen F
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", // Citizen M
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", // Citizen F2
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200", // Admin M
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200", // Admin F
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"  // Authority Eng
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError("Please fill in all login fields");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      onNavigate("dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Try citizen@hero.com / password123");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regCity || !regPin) {
      setError("Name, Email, Password, City and PIN Code are required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        address: regAddress,
        city: regCity,
        state: regState,
        role: regRole,
        pinCode: regPin,
        profileImage: selectedAvatar,
      });
      onNavigate("dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Try using another email.");
    } finally {
      setLoading(false);
    }
  };

  // Preloaded simulation credentials helper
  const handleQuickLogin = (role: "citizen" | "admin" | "authority") => {
    const creds = {
      citizen: { email: "citizen@hero.com", pass: "password123" },
      admin: { email: "admin@hero.com", pass: "password123" },
      authority: { email: "authority@hero.com", pass: "password123" }
    };
    const c = creds[role];
    setLoginEmail(c.email);
    setLoginPassword(c.pass);
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden p-8 relative">
        {/* Glow accent */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />

        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {activeTab === "login" ? "Council Sign In" : "Register Council Account"}
          </h2>
          <p className="text-xs text-slate-400">
            {activeTab === "login"
              ? "Access Springfield's AI civil repair dashboard"
              : "Register as a citizen, municipal worker, or authority"}
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => {
              setActiveTab("login");
              setError(null);
            }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "login"
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setError(null);
            }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "register"
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-850 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secret Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-850 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>Remember Me</span>
              </label>
              <button type="button" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm tracking-wide shadow-md transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? "Authenticating..." : "Sign In to Council"}
            </button>

            {/* Quick Demo logins header */}
            <div className="pt-6 border-t border-slate-150 dark:border-slate-800 text-center space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demo Quick Access</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("citizen")}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400"
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin")}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("authority")}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400"
                >
                  Authority
                </button>
              </div>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Role</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {[
                  { id: "Citizen", label: "Citizen" },
                  { id: "Authority", label: "Authority" },
                  { id: "Admin", label: "Admin" }
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setRegRole(role.id as any)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                      regRole === role.id
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 555-0100"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
              <div className="relative">
                <Home className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="123 Civic Ave"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  value={regState}
                  onChange={(e) => setRegState(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PIN Code</label>
                <input
                  type="text"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  placeholder="62701"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none font-medium"
                />
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Choose Avatar</label>
              <div className="flex gap-2 items-center justify-between">
                <img src={selectedAvatar} alt="Selected Avatar" className="w-12 h-12 rounded-full border border-blue-500 shadow-md object-cover" />
                <div className="flex gap-1.5">
                  {avatars.map((ava, idx) => (
                    <img
                      key={idx}
                      src={ava}
                      alt={`Avatar ${idx}`}
                      onClick={() => setSelectedAvatar(ava)}
                      className={`w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform object-cover border-2 ${
                        selectedAvatar === ava ? "border-blue-600 scale-105" : "border-slate-200 dark:border-slate-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm tracking-wide shadow-md transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? "Registering Council Account..." : "Create Council Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
