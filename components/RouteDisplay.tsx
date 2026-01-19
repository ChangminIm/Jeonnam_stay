
import React, { useEffect, useState, useRef } from 'react';
import { RecommendedRoute, DailyPlan, Spot } from '../types';

interface Props {
  route: RecommendedRoute;
  onReset: () => void;
}

const TypewriterText: React.FC<{ text: string; speed?: number; delay?: number }> = ({ text, speed = 5, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return <span>{displayedText}</span>;
};

const RouteDisplay: React.FC<Props> = ({ route, onReset }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const [visibleDays, setVisibleDays] = useState<number>(0);

  useEffect(() => {
    route.days.forEach((_, i) => {
      setTimeout(() => setVisibleDays(prev => i + 1), 300 + i * 200);
    });
  }, [route]);

  useEffect(() => {
    const L = (window as any).L;
    if (mapRef.current && L && !leafletMapRef.current) {
      const firstSpot = route.days[0].spots[0];
      const map = L.map(mapRef.current, { zoomControl: false }).setView([firstSpot.lat, firstSpot.lng], 12);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
      
      const markers: any[] = [];
      route.days.forEach((day, i) => {
        const coords: [number, number][] = [];
        day.spots.forEach((spot) => {
          const m = L.circleMarker([spot.lat, spot.lng], { 
            radius: 8, color: colors[i % 5], fillOpacity: 1, weight: 3, fillColor: 'white' 
          }).addTo(map).bindPopup(`<b>${spot.name}</b>`);
          markers.push(m);
          coords.push([spot.lat, spot.lng]);
        });
        if (coords.length > 1) {
          L.polyline(coords, { color: colors[i % 5], weight: 4, opacity: 0.3, dashArray: '5, 10' }).addTo(map);
        }
      });
      
      if (markers.length) map.fitBounds(L.featureGroup(markers).getBounds().pad(0.3));
      leafletMapRef.current = map;
    }
  }, [route]);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 animate-in fade-in duration-500">
      {/* Hero Card */}
      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-50 overflow-hidden">
        <div className="p-10 md:p-14">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-3">
              <span className="inline-flex items-center px-4 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-tighter">Verified Trends</span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {route.title}
              </h1>
            </div>
            <button onClick={onReset} className="p-4 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-colors text-xl shadow-sm">🔄</button>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-10">
            <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-black">📍 {route.selectedCity}</div>
            <div className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-2xl text-sm font-black">🔥 트렌드 {route.trendingScore}%</div>
            {route.tags?.map((tag, i) => (
              <div key={i} className="px-5 py-2.5 border border-slate-100 text-slate-400 rounded-2xl text-sm font-bold"># {tag}</div>
            ))}
          </div>

          <p className="text-slate-500 text-lg leading-relaxed mb-10 font-medium italic">
            <TypewriterText text={route.summary} delay={600} />
          </p>
          
          <div className="rounded-[3rem] overflow-hidden h-[400px] shadow-inner border border-slate-100 relative z-10" ref={mapRef}></div>
        </div>
      </div>

      {/* Daily Content */}
      <div className="space-y-20">
        {route.days.slice(0, visibleDays).map((day, i) => (
          <div key={i} className="animate-in slide-in-from-bottom-12 duration-700">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center shadow-2xl">
                <span className="text-[10px] font-black opacity-50">DAY</span>
                <span className="text-2xl font-black">{day.day}</span>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900">{day.theme}</h3>
                <p className="text-blue-600 font-bold text-sm tracking-widest uppercase">Daily Roadmap</p>
              </div>
            </div>

            <div className="relative ml-8 pl-12 border-l-4 border-slate-100 space-y-12">
              {day.spots.map((spot, si) => (
                <div key={si} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[66px] top-10 w-8 h-8 rounded-full border-8 border-white bg-blue-600 shadow-xl z-10 transition-transform group-hover:scale-125"></div>
                  
                  {/* Travel Time Badge */}
                  {si > 0 && spot.travelTimeFromPrevious && (
                    <div className="absolute -left-[95px] -top-8 z-20">
                      <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-xl flex items-center gap-2 animate-bounce">
                        <span>🚗</span>
                        {spot.travelTimeFromPrevious}
                      </div>
                    </div>
                  )}

                  <div className="p-10 bg-white rounded-[3rem] border border-slate-50 shadow-sm group-hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black rounded-xl uppercase tracking-[0.2em]">{spot.category}</span>
                      <a href={spot.naverLink} target="_blank" className="flex items-center gap-2 text-[11px] font-black text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-2xl transition-all border border-blue-50">
                        지도 보기 ↗
                      </a>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-4">{spot.name}</h4>
                    <p className="text-slate-500 leading-relaxed font-medium text-base">{spot.description}</p>
                  </div>
                </div>
              ))}

              {/* Alternative Suggestion */}
              {day.alternativeSpot && (
                <div className="ml-6 p-10 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-[3rem] border border-blue-100/50 relative overflow-hidden group">
                  <div className="absolute -right-6 -bottom-6 text-9xl opacity-[0.03] group-hover:scale-110 transition-transform font-black">?</div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="flex h-3 w-3 rounded-full bg-blue-600 animate-pulse"></span>
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">Smart Alternative</span>
                  </div>
                  <h5 className="text-2xl font-black text-slate-800 mb-3">{day.alternativeSpot.name}</h5>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed max-w-lg">{day.alternativeSpot.description}</p>
                  <a href={day.alternativeSpot.naverLink} target="_blank" className="inline-flex items-center gap-2 text-xs font-black text-blue-700 hover:gap-3 transition-all">
                    대안 경로 상세보기 <span>→</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteDisplay;
