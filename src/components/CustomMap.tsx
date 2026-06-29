import React, { useState } from "react";
import { Issue, IssueSeverity } from "../types";
import { MapPin, ShieldAlert, Sparkles, Navigation } from "lucide-react";

interface CustomMapProps {
  issues: Issue[];
  onSelectIssue?: (issue: Issue) => void;
  selectable?: boolean;
  selectedCoords?: { lat: number; lng: number } | null;
  onCoordsChange?: (lat: number, lng: number) => void;
  showPredictions?: boolean;
  predictiveHotspots?: Array<{ area: string; hazard: string; confidence: number; reason: string; lat?: number; lng?: number }>;
  height?: string;
}

// Center of Springfield IL for simulation coordinates
// We'll map Latitude: [39.75, 39.81] to Y: [90%, 10%]
// Longitude: [-89.68, -89.62] to X: [10%, 90%]
const MAP_LAT_MIN = 39.75;
const MAP_LAT_MAX = 39.81;
const MAP_LNG_MIN = -89.68;
const MAP_LNG_MAX = -89.62;

export default function CustomMap({
  issues,
  onSelectIssue,
  selectable = false,
  selectedCoords = null,
  onCoordsChange,
  showPredictions = false,
  predictiveHotspots = [],
  height = "h-[450px]"
}: CustomMapProps) {
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<any | null>(null);

  // Conversion logic from GPS to SVG percentages
  const gpsToPercent = (lat: number, lng: number) => {
    // Standard linear interpolation
    const x = ((lng - MAP_LNG_MIN) / (MAP_LNG_MAX - MAP_LNG_MIN)) * 100;
    const y = 100 - ((lat - MAP_LAT_MIN) / (MAP_LAT_MAX - MAP_LAT_MIN)) * 100; // Invert Y for screen space
    return {
      x: Math.min(Math.max(x, 2), 98),
      y: Math.min(Math.max(y, 2), 98)
    };
  };

  // Conversion from SVG percentages to GPS
  const percentToGps = (pctX: number, pctY: number) => {
    const lng = MAP_LNG_MIN + (pctX / 100) * (MAP_LNG_MAX - MAP_LNG_MIN);
    const lat = MAP_LAT_MIN + ((100 - pctY) / 100) * (MAP_LAT_MAX - MAP_LAT_MIN);
    return {
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4))
    };
  };

  // Severity to marker color mapping
  const getMarkerColor = (issue: Issue) => {
    if (issue.status === "Resolved" || issue.status === "Closed") {
      return "bg-emerald-500 border-emerald-100 text-emerald-950";
    }
    const severity: IssueSeverity = issue.severity;
    switch (severity) {
      case "Critical":
        return "bg-rose-600 border-rose-100 text-rose-950 ring-rose-300";
      case "High":
        return "bg-amber-500 border-amber-100 text-amber-950 ring-amber-200";
      case "Medium":
        return "bg-yellow-400 border-yellow-100 text-yellow-950 ring-yellow-100";
      case "Low":
        return "bg-sky-400 border-sky-100 text-sky-950";
      default:
        return "bg-slate-400 border-slate-100 text-slate-950";
    }
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!selectable || !onCoordsChange) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const percentX = (clickX / rect.width) * 100;
    const percentY = (clickY / rect.height) * 100;

    const gps = percentToGps(percentX, percentY);
    onCoordsChange(gps.lat, gps.lng);
  };

  // Predefined simulated hotspots coordinates for visual representation
  const defaultHotspotPoints = [
    { name: "Lincoln Avenue & 5th St", lat: 39.7820, lng: -89.6510, radius: 24, fill: "fill-rose-500/20 stroke-rose-500" },
    { name: "East Springfield River Ridge", lat: 39.7940, lng: -89.6320, radius: 32, fill: "fill-cyan-500/20 stroke-cyan-500" },
    { name: "Elm Street Community Park Side", lat: 39.7690, lng: -89.6640, radius: 20, fill: "fill-purple-500/20 stroke-purple-500" },
    { name: "South MacArthur Boulevard", lat: 39.7580, lng: -89.6540, radius: 28, fill: "fill-amber-500/20 stroke-amber-500" }
  ];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-inner">
      {/* Map Control Info bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap gap-2 items-center justify-between pointer-events-none">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800 text-xs font-medium flex items-center gap-2 shadow-sm pointer-events-auto">
          <Navigation className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span>Springfield Interactive Grid Map</span>
        </div>

        {selectable && (
          <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md pointer-events-auto animate-bounce">
            Click anywhere on the map to drop pin!
          </div>
        )}

        {showPredictions && (
          <div className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 pointer-events-auto">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Predictive Overlays Active</span>
          </div>
        )}
      </div>

      {/* SVG Vector Map Canvas */}
      <svg
        className={`w-full ${height} cursor-crosshair select-none transition-all duration-300`}
        viewBox="0 0 1000 600"
        onClick={handleMapClick}
      >
        {/* Background Gridlines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" className="stroke-slate-200/40 dark:stroke-slate-800/20" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Dynamic Simulated City Features: River */}
        <path
          d="M -100 480 Q 250 420 400 300 T 800 200 T 1100 150"
          fill="none"
          className="stroke-sky-200/70 dark:stroke-sky-900/40"
          strokeWidth="60"
          strokeLinecap="round"
        />
        <path
          d="M -100 480 Q 250 420 400 300 T 800 200 T 1100 150"
          fill="none"
          className="stroke-sky-300/40 dark:stroke-sky-950/20"
          strokeWidth="45"
          strokeLinecap="round"
        />

        {/* Simulated Parks */}
        <rect x="120" y="80" width="180" height="110" rx="15" className="fill-emerald-100/40 dark:fill-emerald-950/20 stroke-emerald-200/20" strokeWidth="2" />
        <text x="210" y="140" textAnchor="middle" className="fill-emerald-700/60 dark:fill-emerald-400/30 font-sans text-xs font-semibold uppercase tracking-wider">Community Park</text>

        <rect x="720" y="400" width="160" height="130" rx="15" className="fill-emerald-100/40 dark:fill-emerald-950/20 stroke-emerald-200/20" strokeWidth="2" />
        <text x="800" y="470" textAnchor="middle" className="fill-emerald-700/60 dark:fill-emerald-400/30 font-sans text-xs font-semibold uppercase tracking-wider">Nature Reserve</text>

        {/* Major Roads Grid */}
        {/* Horizontal Major Highways */}
        <line x1="0" y1="250" x2="1000" y2="250" className="stroke-slate-200 dark:stroke-slate-800/80" strokeWidth="14" />
        <line x1="0" y1="250" x2="1000" y2="250" className="stroke-yellow-400/30 dark:stroke-slate-900/60" strokeWidth="2" strokeDasharray="5,5" />
        <text x="50" y="244" className="fill-slate-400 dark:fill-slate-600 font-mono text-[9px] font-semibold tracking-wider">LINCOLN AVE (STATE ROUTE 4)</text>

        <line x1="0" y1="500" x2="1000" y2="500" className="stroke-slate-200 dark:stroke-slate-800/80" strokeWidth="10" />
        <text x="50" y="494" className="fill-slate-400 dark:fill-slate-600 font-mono text-[9px] font-semibold tracking-wider">ELM STREET</text>

        {/* Vertical Major Roads */}
        <line x1="300" y1="0" x2="300" y2="600" className="stroke-slate-200 dark:stroke-slate-800/80" strokeWidth="10" />
        <text x="312" y="550" className="fill-slate-400 dark:fill-slate-600 font-mono text-[9px] font-semibold tracking-wider font-sans rotate-90 origin-left">5TH STREET</text>

        <line x1="700" y1="0" x2="700" y2="600" className="stroke-slate-200 dark:stroke-slate-800/80" strokeWidth="10" />
        <text x="712" y="100" className="fill-slate-400 dark:fill-slate-600 font-mono text-[9px] font-semibold tracking-wider font-sans rotate-90 origin-left">MACARTHUR BLVD</text>

        {/* Minor Road Network */}
        <path d="M 0 120 L 1000 120 M 0 380 L 1000 380 M 150 0 L 150 600 M 520 0 L 520 600 M 850 0 L 850 600" className="stroke-slate-200/50 dark:stroke-slate-900/40" strokeWidth="4" />

        {/* AI Predictive Hotspots Overlays (Feature 5) */}
        {showPredictions && defaultHotspotPoints.map((hotspot, idx) => {
          const pos = gpsToPercent(hotspot.lat, hotspot.lng);
          // SVG coordinate dimensions 1000x600 -> map percent to coordinates
          const svgX = (pos.x / 100) * 1000;
          const svgY = (pos.y / 100) * 600;

          // Find if there is a predicted risk explanation
          const matchPredict = predictiveHotspots.find(
            (p) => p.area.toLowerCase().includes(hotspot.name.split(" ")[0].toLowerCase())
          ) || hotspot;

          return (
            <g key={`hotspot-${idx}`}>
              {/* Radial heat glow */}
              <circle
                cx={svgX}
                cy={svgY}
                r={hotspot.radius * 2}
                className={`animate-ping ${hotspot.fill.split(" ")[0]}`}
                style={{ animationDuration: "3s" }}
              />
              <circle
                cx={svgX}
                cy={svgY}
                r={hotspot.radius}
                className={`${hotspot.fill} stroke-2 stroke-dashed cursor-pointer transition-all hover:scale-110`}
                onMouseEnter={() => setHoveredHotspot(matchPredict)}
                onMouseLeave={() => setHoveredHotspot(null)}
              />
            </g>
          );
        })}

        {/* Render User Selection Marker when Reporting (Selectable) */}
        {selectable && selectedCoords && (
          (() => {
            const pos = gpsToPercent(selectedCoords.lat, selectedCoords.lng);
            const svgX = (pos.x / 100) * 1000;
            const svgY = (pos.y / 100) * 600;
            return (
              <g className="animate-bounce">
                <circle cx={svgX} cy={svgY} r="18" className="fill-blue-500/20 stroke-blue-500 stroke-2 animate-pulse" />
                <circle cx={svgX} cy={svgY} r="5" className="fill-blue-600" />
                <path
                  d={`M ${svgX} ${svgY} L ${svgX - 10} ${svgY - 24} A 12 12 0 1 1 ${svgX + 10} ${svgY - 24} Z`}
                  className="fill-blue-600 stroke-white stroke-2 shadow-lg"
                />
                <circle cx={svgX} cy={svgY - 24} r="4" className="fill-white" />
              </g>
            );
          })()
        )}

        {/* Dynamic Issue Pins */}
        {issues.map((issue) => {
          const pos = gpsToPercent(issue.latitude, issue.longitude);
          const svgX = (pos.x / 100) * 1000;
          const svgY = (pos.y / 100) * 600;
          const colorClasses = getMarkerColor(issue);

          return (
            <g
              key={issue._id}
              className="cursor-pointer transition-transform duration-200 hover:scale-125"
              onClick={() => onSelectIssue && onSelectIssue(issue)}
              onMouseEnter={() => setHoveredIssue(issue)}
              onMouseLeave={() => setHoveredIssue(null)}
            >
              {/* Ripple animation for unresolved severe issues */}
              {issue.status !== "Resolved" && issue.status !== "Closed" && (issue.severity === "High" || issue.severity === "Critical") && (
                <circle
                  cx={svgX}
                  cy={svgY}
                  r="20"
                  className={`animate-ping opacity-25 fill-current ${colorClasses.split(" ")[0]}`}
                  style={{ animationDuration: "2s" }}
                />
              )}

              {/* Pin Ring Backdrop */}
              <circle
                cx={svgX}
                cy={svgY}
                r="10"
                className={`stroke-2 shadow-md fill-white dark:fill-slate-900 ${
                  issue.status === "Resolved" ? "stroke-emerald-500" : issue.severity === "Critical" ? "stroke-rose-600" : "stroke-amber-500"
                }`}
              />

              {/* Core Pin Dot */}
              <circle
                cx={svgX}
                cy={svgY}
                r="6"
                className={`transition-colors ${colorClasses.split(" ")[0]}`}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Cards */}
      {hoveredIssue && (
        (() => {
          const pos = gpsToPercent(hoveredIssue.latitude, hoveredIssue.longitude);
          return (
            <div
              className="absolute pointer-events-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl z-30 max-w-xs transition-all duration-200"
              style={{
                left: `${Math.min(Math.max(pos.x, 5), 75)}%`,
                top: `${Math.min(Math.max(pos.y - 18, 5), 80)}%`
              }}
            >
              <div className="flex items-start gap-2">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  hoveredIssue.status === "Resolved" ? "bg-emerald-500" : hoveredIssue.severity === "Critical" ? "bg-red-500" : "bg-amber-500"
                }`} />
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">{hoveredIssue.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{hoveredIssue.category} • {hoveredIssue.address}</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 italic">"{hoveredIssue.description}"</p>
                  <div className="flex gap-1.5 items-center mt-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      hoveredIssue.status === "Resolved" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300"
                    }`}>
                      {hoveredIssue.status}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">{hoveredIssue.verificationCount} verification votes</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {hoveredHotspot && (
        <div className="absolute top-16 left-3 right-3 md:left-auto md:right-3 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white border border-purple-500/50 p-3.5 rounded-xl shadow-2xl z-20 max-w-sm pointer-events-none animate-fadeIn">
          <div className="flex gap-2 items-start">
            <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400 border border-purple-500/30">
              <ShieldAlert className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs text-purple-300">{hoveredHotspot.area || hoveredHotspot.name}</h4>
                <span className="text-[9px] bg-purple-500 text-white font-bold px-1 rounded-sm">{hoveredHotspot.confidence || 85}% Conf.</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-300 mt-1 uppercase tracking-wider text-rose-400">{hoveredHotspot.hazard}</p>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-relaxed italic">"{hoveredHotspot.reason || hoveredHotspot.reason}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid Legend bar */}
      <div className="bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200/50 dark:border-slate-800/80 px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-600 dark:text-slate-400 items-center select-none">
        <span className="font-bold uppercase tracking-wider text-[9px] text-slate-500 dark:text-slate-500 mr-1">Legend:</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Critical Hazard</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> High Priority</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Medium</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Resolved / Closed</span>
      </div>
    </div>
  );
}
