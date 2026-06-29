import { Shield, MapPin, CheckCircle, Brain, Users, Zap, Award, Star } from "lucide-react";

export default function LandingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen transition-colors font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Subtle decorative grid/glow backdrops */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-12 left-10 w-72 h-72 rounded-full bg-blue-400/10 dark:bg-blue-600/5 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-400/10 dark:bg-indigo-600/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                  Next-Gen AI-Powered Civic Platform
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Be the Hero Your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Community
                </span>{" "}
                Needs
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Report local civic hazards—from dangerous potholes to broken streetlights—and watch AI automatically route, prioritize, and check duplicates. Earn contribution badges, upvote neighbor reports, and track real government repairs in real-time.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <button
                  onClick={() => onNavigate("auth-register")}
                  className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:translate-y-[-2px]"
                >
                  Join the Council
                </button>
                <button
                  onClick={() => onNavigate("auth-login")}
                  className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm tracking-wide border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:translate-y-[-2px]"
                >
                  Explore Active Reports
                </button>
              </div>

              {/* Trust Badge Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 pt-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>98.6% Verification Rate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>&lt;24 Hour Routing Turnaround</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>Gamified Civic Badges</span>
                </div>
              </div>
            </div>

            {/* Right Column Illustration */}
            <div className="lg:col-span-5 relative">
              <div className="w-full aspect-[4/3] sm:aspect-square bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-850 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
                {/* Visual mock of a city dashboard with glowing pinpoints */}
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40" />

                {/* Simulated Map Grid layout in card */}
                <div className="relative h-full w-full rounded-2xl bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Civic Matrix</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* Mock pin 1 */}
                  <div className="absolute top-[35%] left-[25%] bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-md animate-bounce">
                    <MapPin className="w-2.5 h-2.5" /> Pothole High
                  </div>

                  {/* Mock pin 2 */}
                  <div className="absolute top-[60%] right-[20%] bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
                    <CheckCircle className="w-2.5 h-2.5" /> Water Leak Fixed
                  </div>

                  {/* Mini HUD Card */}
                  <div className="mt-auto bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase">Weekly Resolution</p>
                      <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">842 Issues</p>
                    </div>
                    <div className="h-9 w-16 bg-blue-100 dark:bg-blue-950/40 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 text-[11px] font-bold">
                      +14% Peak
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "3,429+", label: "Issues Resolved" },
              { num: "94.5%", label: "AI Prediction Accuracy" },
              { num: "2.4 hrs", label: "Avg Assignment Speed" },
              { num: "142k", label: "Citizen Points Earned" }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.num}
                </p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features bento section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Designed for Instant City Impact
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Automated intelligence that bridges the gap between frustration and active municipal repairs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Brain className="w-5 h-5 text-blue-600" />,
              title: "AI Auto-Categorization",
              desc: "Upload a photo and Gemini Vision instantly predicts the hazard category, severity rating, and optimal municipal department."
            },
            {
              icon: <Shield className="w-5 h-5 text-indigo-600" />,
              title: "Duplicate Detection",
              desc: "Advanced GPS proximity algorithms checks incoming reports to prevent redundancy and merge reports into cohesive unified targets."
            },
            {
              icon: <Zap className="w-5 h-5 text-amber-600" />,
              title: "Smart Authority Routing",
              desc: "Issues are immediately dispatched to specific boards: Road Boards, Sanitation, and Electricity commands, reducing red-tape."
            },
            {
              icon: <Users className="w-5 h-5 text-sky-600" />,
              title: "Community Verification",
              desc: "Upvote and comment on neighborhood reports to help validation. Once verified by 5 neighbors, issues are escalated to councils."
            },
            {
              icon: <Award className="w-5 h-5 text-purple-600" />,
              title: "Citizen Gamification",
              desc: "Earn XP points and unlock achievements like 'Neighborhood Guardian' and 'Community Hero' as issues you report get fixed."
            },
            {
              icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
              title: "Resolution Proof",
              desc: "Municipal repair teams upload completion photos which are overlayed as 'Before/After' sliders for immediate transparency."
            }
          ].map((feat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                {feat.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{feat.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-100/50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-850 py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">The 3-Step Lifecycle</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              How reports transform into concrete road repairs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              { step: "01", title: "Spot & Snap", desc: "Citizen takes a photo of a civic hazard, uploads description, and captures GPS pinpoint." },
              { step: "02", title: "AI Analysis & Verification", desc: "Gemini assesses category/severity, routes to works department, and citizens upvote proximity validation." },
              { step: "03", title: "Council Action & Repair", desc: "Assigned authority accepts, schedules filling, resolves, and uploads completion proof slider." }
            ].map((step, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative">
                <span className="text-5xl font-black text-blue-600/10 dark:text-blue-500/5 absolute top-4 right-4">{step.step}</span>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Step {step.step}</h3>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{step.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Loved by Active Citizens</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Hear from residents and administrative leaders.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              text: "The pothole on my child's bicycle route was filled within 36 hours of me reporting it here. The duplicate detection combined with community upvotes actually works!",
              author: "Elena Rostova",
              role: "Parent & Active Citizen",
              avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100"
            },
            {
              text: "As a city maintenance administrator, this system completely streamlines our dispatching backlog. AI categorizes and dispatches tickets to correct authorities with zero manual sorting.",
              author: "Director Sarah Vance",
              role: "Springfield Municipal HQ",
              avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"
            },
            {
              text: "The points reward got me and my neighbors checking and upvoting reports daily. Highly intuitive dashboard design suitable for all age ranges.",
              author: "Marcus Aurelius",
              role: "Neighborhood Association Pres.",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
            }
          ].map((test, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <p className="text-xs italic text-slate-600 dark:text-slate-400 leading-relaxed">"{test.text}"</p>
              <div className="flex gap-3 items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <img src={test.avatar} alt={test.author} className="w-8.5 h-8.5 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-150">{test.author}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Ready to Resolve Local Problems?</h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto leading-relaxed">
            Create an account in 60 seconds, check the interactive hazard board, and report your first neighborhood concern today.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate("auth-register")}
              className="px-6 py-3 rounded-xl bg-white text-blue-600 hover:bg-slate-100 font-extrabold text-xs sm:text-sm shadow-md transition-transform hover:scale-105"
            >
              Sign Up Now
            </button>
            <button
              onClick={() => onNavigate("auth-login")}
              className="px-6 py-3 rounded-xl bg-blue-700/50 hover:bg-blue-700/80 border border-blue-400 text-white font-extrabold text-xs sm:text-sm shadow-sm transition-transform hover:scale-105"
            >
              Access Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-850 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <span className="text-sm font-black text-white">Community Hero Inc.</span>
          </div>
          <p className="text-[10px] text-slate-500 text-center md:text-left">
            &copy; 2026 Springfield Council AI Initiative. This is a fully compliant high-fidelity full-stack civic sandbox application.
          </p>
          <div className="flex gap-4 text-xs font-semibold">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Council</a>
            <a href="#" className="hover:text-white">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
