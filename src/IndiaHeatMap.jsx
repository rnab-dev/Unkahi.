import React, { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "/src/india.json";

export default function IndiaHeatMap({ regionData }) {
  const [tooltipContent, setTooltipContent] = useState("");

  // Map the aggregated region data for quick lookup
  // regionData format expected: { "Maharashtra": { avgScore: 85, count: 12 }, "Delhi": ... }
  const dataMap = useMemo(() => {
    const map = {};
    if (regionData) {
      Object.keys(regionData).forEach((key) => {
        // Normalize name for robust matching
        map[key.toLowerCase().trim()] = regionData[key];
      });
    }
    return map;
  }, [regionData]);

  // Heatmap color logic based on avgScore
  const getHeatColor = (avgScore) => {
    if (avgScore === undefined || avgScore === null) return "#f1f5f9"; // Default slate-100 for no data
    if (avgScore >= 80) return "#be123c"; // Rose 700 - Critical Load
    if (avgScore >= 60) return "#f43f5e"; // Rose 500 - High Load
    if (avgScore >= 40) return "#fca5a5"; // Red 300 - Moderate
    return "#fed7aa"; // Orange 200 - Baseline (visible!)
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 800,
          center: [80, 22] // Center of India coordinates
        }}
        className="w-full max-h-[500px]"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = (geo.properties.name || "").toLowerCase().trim();
              const stateData = dataMap[stateName];
              const heatColor = stateData ? getHeatColor(stateData.avgScore) : "#f1f5f9";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={heatColor}
                  stroke="#ffffff"
                  strokeWidth={0.5}
                  onMouseEnter={() => {
                    const displayState = geo.properties.name;
                    if (stateData) {
                      setTooltipContent(`${displayState}: ${stateData.count} logs (Avg Load: ${stateData.avgScore}%)`);
                    } else {
                      setTooltipContent(`${displayState}: No data yet`);
                    }
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                  style={{
                    default: { outline: "none", transition: "all 250ms" },
                    hover: { fill: "#6366f1", outline: "none", cursor: "pointer", strokeWidth: 1.5 },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      
      {/* Dynamic Tooltip */}
      <div className="absolute top-4 right-4 bg-slate-800 text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-xl transition-opacity duration-300" style={{ opacity: tooltipContent ? 1 : 0 }}>
        {tooltipContent || "Hover a state"}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1.5">
        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Nervous System Load</span>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#be123c]"></div><span className="text-[10px] font-bold text-slate-600">Critical (80-100%)</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f43f5e]"></div><span className="text-[10px] font-bold text-slate-600">High (60-79%)</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#fca5a5]"></div><span className="text-[10px] font-bold text-slate-600">Moderate (40-59%)</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#fed7aa]"></div><span className="text-[10px] font-bold text-slate-600">Baseline (0-39%)</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f1f5f9]"></div><span className="text-[10px] font-bold text-slate-600">Insufficient Data</span></div>
      </div>
    </div>
  );
}
