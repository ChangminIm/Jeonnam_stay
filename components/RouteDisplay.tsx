
import React, { useEffect, useState, useRef } from 'react';
import { RecommendedRoute, DailyPlan, Spot } from '../types';

interface Props {
  route: RecommendedRoute;
  onReset: () => void;
}

const TypewriterText: React.FC<{ text: string; speed?: number; delay?: number }> = ({ text, speed = 8, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const hasStarted = useRef(false);
  
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let i = 0;
    let interval: any;
    
    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, delay);
    
    return () => {
      clearTimeout(startTimeout);
      if (interval) clearInterval(interval);
      hasStarted.current = false;
    };
  }, [text, speed, delay]);

  return <span>{displayedText}</span>;
};

const RouteDisplay: React.FC<Props> = ({ route, onReset }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  const [visibleDays, setVisibleDays] = useState<number>(0);
  const [showMap, setShowMap] = useState(false);
  const animationInitialized = useRef(false);

  useEffect(() => {
    if (animationInitialized.current) return;
    animationInitialized.current = true;

    const timers: any[] = [];
    timers.push(setTimeout(() => setShowMap(true), 200));
    
    route.days.forEach((_, index) => {
      timers.push(setTimeout(() => {
        setVisibleDays(prev => Math.max(prev, index + 1));
      }, 500 + (index * 300)));
    });

    return () => {
      timers.forEach(clearTimeout);
      animationInitialized.current = false;
    };
  }, [route]);

  useEffect(() => {
    const L = (window as any).L;
    if (showMap && mapRef.current && L && !leafletMapRef.current) {
      const map = L.map(mapRef.current, { zoomControl: false }).setView([34.76, 127.66], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
      
      const markers: any[] = [];
      (route.days || []).forEach((day, i) => {
        const coords: [number, number][] = [];
        (day.spots || []).forEach((spot) => {
          const m = L.circleMarker([spot.lat, spot.lng], { 
            radius: 8, color: colors[i % 5], fillOpacity: 1, weight: 3, fillColor: 'white' 
          }).addTo(map);
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
  }, [showMap, route]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-6">
            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Jeonnam AI Report</span>
            <button onClick={onReset} className="text-slate-300 hover:text-slate-600 transition-colors">🔄</button>
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            <TypewriterText text={route.title} />
          </h1>
          
          <div className="flex items-center gap-2 mb-6 text-blue-600 font-bold text-sm">
            <span>📍 {route.selectedCity}</span>
            <span className="text-slate-200">|</span>
            <span>🔥 트렌드 {route.trendingScore}%</span>
          </div>

          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            <TypewriterText text={route.summary} delay={400} />
          </p>
          
          {showMap && (
            <div className="rounded-3xl overflow-hidden h-[300px] border border-slate-100 shadow-inner" ref={mapRef}></div>
          )}
        </div>
      </div>

      <div className="space-y-10">
        {route.days.slice(0, visibleDays).map((day, i) => (
          <div key={i} className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg">
                {day.day}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{day.theme}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Day Schedule</p>
              </div>
            </div>

            <div className="relative pl-6 border-l-2 border-dashed border-slate-200 ml-6 space-y-4">
              {day.spots.map((spot, si) => (
                <div key={si} className="relative">
                  {si > 0 && spot.travelTimeFromPrevious && (
                    <div className="absolute -left-[31px] -top-5 flex items-center justify-center">
                      <div className="bg-white px-2 py-0.5 border border-slate-100 rounded-full text-[9px] font-black text-blue-600 shadow-sm whitespace-nowrap">
                        {spot.travelTimeFromPrevious}
                      </div>
                    </div>
                  )}
                  <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{spot.category}</span>
                      <a href={spot.naverLink} target="_blank" className="text-xs font-bold text-slate-300 hover:text-green-500 transition-colors">NAVER MAP ↗</a>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">{spot.name}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{spot.description}</p>
                  </div>
                </div>
              ))}

              {day.alternativeSpot && (
                <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">💡</div>
                  <h5 className="text-blue-600 text-xs font-black mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    AI TREND ALTERNATIVE
                  </h5>
                  <h6 className="text-lg font-black text-slate-800 mb-1">{day.alternativeSpot.name}</h6>
                  <p className="text-slate-500 text-xs mb-3">{day.alternativeSpot.description}</p>
                  <a href={day.alternativeSpot.naverLink} target="_blank" className="inline-block text-[10px] font-black text-blue-600 hover:underline">대안 경로로 선택하기 ↗</a>
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
