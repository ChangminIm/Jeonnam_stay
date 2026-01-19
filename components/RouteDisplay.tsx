
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
            radius: 7, color: colors[i % 5], fillOpacity: 1, weight: 2, fillColor: 'white' 
          }).addTo(map).bindPopup(`<b>${spot.name}</b>`);
          markers.push(m);
          coords.push([spot.lat, spot.lng]);
        });
        if (coords.length > 1) L.polyline(coords, { color: colors[i % 5], weight: 3, opacity: 0.4, dashArray: '5, 10' }).addTo(map);
      });
      
      if (markers.length) map.fitBounds(L.featureGroup(markers).getBounds().pad(0.2));
      leafletMapRef.current = map;
    }
  }, [route]);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
      {/* Hero Section */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-100/50 border border-slate-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="p-10 md:p-14">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-3">
              <span className="inline-flex items-center px-4 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-tighter">AI Curation Complete</span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {route.title}
              </h1>
            </div>
            <button onClick={onReset} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors text-xl">🔄</button>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-10 text-sm font-bold">
            <div className="px-4 py-2 bg-slate-900 text-white rounded-2xl">📍 {route.selectedCity}</div>
            <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl">✨ 트렌드 {route.trendingScore}%</div>
            {route.tags?.map((tag, i) => (
              <div key={i} className="px-4 py-2 border border-slate-100 text-slate-400 rounded-2xl"># {tag}</div>
            ))}
          </div>

          <p className="text-slate-500 text-lg leading-relaxed mb-10 font-medium">
            <TypewriterText text={route.summary} delay={500} />
          </p>
          
          <div className="rounded-[2.5rem] overflow-hidden h-[350px] shadow-inner border border-slate-100" ref={mapRef}></div>
        </div>
      </div>

      {/* Daily Timeline */}
      <div className="space-y-16">
        {route.days.slice(0, visibleDays).map((day, i) => (
          <div key={i} className="animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex flex-col items-center justify-center shadow-xl shadow-blue-200">
                <span className="text-[10px] font-black opacity-70">DAY</span>
                <span className="text-2xl font-black">{day.day}</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{day.theme}</h3>
                <p className="text-blue-600 font-bold text-sm tracking-wide">오늘의 핫플레이스 로드맵</p>
              </div>
            </div>

            <div className="relative ml-8 pl-10 border-l-4 border-slate-100 space-y-8">
              {day.spots.map((spot, si) => (
                <div key={si} className="relative group">
                  {/* Point Marker */}
                  <div className="absolute -left-[54px] top-8 w-6 h-6 rounded-full border-4 border-white bg-blue-600 shadow-md z-10"></div>
                  
                  {/* Travel Time Badge */}
                  {si > 0 && spot.travelTimeFromPrevious && (
                    <div className="absolute -left-[75px] -top-5 z-20">
                      <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1.5 animate-bounce">
                        <span>🚗</span>
                        {spot.travelTimeFromPrevious}
                      </div>
                    </div>
                  )}

                  <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-widest">{spot.category}</span>
                      <a href={spot.naverLink} target="_blank" className="flex items-center gap-2 text-xs font-black text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-all">
                        MAP ↗
                      </a>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-3">{spot.name}</h4>
                    <p className="text-slate-500 leading-relaxed font-medium">{spot.description}</p>
                  </div>
                </div>
              ))}

              {/* Alternative Card */}
              {day.alternativeSpot && (
                <div className="ml-4 p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2.5rem] border border-blue-100 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">💡</div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">AI Trend Alternative</span>
                  </div>
                  <h5 className="text-xl font-black text-slate-800 mb-2">{day.alternativeSpot.name}</h5>
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed">{day.alternativeSpot.description}</p>
                  <a href={day.alternativeSpot.naverLink} target="_blank" className="text-xs font-black text-blue-700 hover:underline">이 장소도 가볼까요? ↗</a>
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
