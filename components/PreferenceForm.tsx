
import React from 'react';
import { UserPreferences, TravelStyle } from '../types';

interface Props {
  onStart: (prefs: UserPreferences) => void;
}

const PreferenceForm: React.FC<Props> = ({ onStart }) => {
  const [prefs, setPrefs] = React.useState<UserPreferences>({
    duration: 3,
    style: 'PHOTO',
    budget: 'MID'
  });

  const styles: { id: TravelStyle; label: string; icon: string }[] = [
    { id: 'PHOTO', label: '인스타핫플', icon: '📸' },
    { id: 'FOODIE', label: '미식여행', icon: '🥢' },
    { id: 'NATURE', label: '자연/힐링', icon: '⛰️' },
    { id: 'PET', label: '반려동물', icon: '🐶' },
    { id: 'RELAX', label: '느린여행', icon: '🏡' },
    { id: 'DIGITAL_NOMAD', label: '워케이션', icon: '👨‍💻' },
  ];

  return (
    <div className="max-w-xl mx-auto p-10 bg-white rounded-[3rem] shadow-2xl border border-blue-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black mb-10 text-center text-slate-900 tracking-tighter">당신만의 전남을 찾아드릴게요</h2>
      
      <div className="mb-10">
        <label className="block text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 text-center">어떤 여행을 꿈꾸시나요?</label>
        <div className="grid grid-cols-3 gap-3">
          {styles.map((s) => (
            <button
              key={s.id}
              onClick={() => setPrefs({...prefs, style: s.id})}
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                prefs.style === s.id 
                  ? 'border-blue-600 bg-blue-50 scale-105 shadow-md' 
                  : 'border-slate-50 bg-slate-50 hover:border-slate-200'
              }`}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="text-[12px] font-black text-slate-700">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-12 px-2">
        <div className="flex justify-between items-center mb-6">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">일정 선택</label>
          <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-black">{prefs.duration}일 코스</span>
        </div>
        <input 
          type="range" min="1" max="5" step="1"
          value={prefs.duration}
          onChange={(e) => setPrefs({...prefs, duration: parseInt(e.target.value)})}
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-300">
          <span>당일치기</span>
          <span>5일 이상</span>
        </div>
      </div>

      <button
        onClick={() => onStart(prefs)}
        className="group w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98]"
      >
        <span>최적의 도시 분석 시작</span>
        <span className="text-2xl group-hover:translate-x-1 transition-transform">✨</span>
      </button>
      
      <p className="mt-6 text-center text-[10px] text-slate-400 font-medium">
        AI가 여수, 순천, 목포, 담양 중 당신의 취향에 가장 맞는 곳을 선정합니다.
      </p>
    </div>
  );
};

export default PreferenceForm;
