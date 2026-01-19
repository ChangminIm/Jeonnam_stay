
import React, { useState } from 'react';
import { UserPreferences, RecommendedRoute } from './types';
import { generateYeosuRoute } from './geminiService';
import PreferenceForm from './components/PreferenceForm';
import AnalysisLoader from './components/AnalysisLoader';
import RouteDisplay from './components/RouteDisplay';

const App: React.FC = () => {
  const [view, setView] = useState<'HOME' | 'ANALYZING' | 'RESULT'>('HOME');
  const [route, setRoute] = useState<RecommendedRoute | null>(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartAnalysis = async (prefs: UserPreferences) => {
    setView('ANALYZING');
    setIsDataReady(false);
    setRoute(null);
    setError(null);
    
    try {
      const result = await generateYeosuRoute(prefs);
      setRoute(result);
      setIsDataReady(true);
      // View 전환은 AnalysisLoader에서 100% 도달 시 onFinish를 통해 수행됨
    } catch (err: any) {
      console.error(err);
      setError(err.message || "여행 계획 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setView('HOME');
    }
  };

  const handleAnalysisComplete = () => {
    setView('RESULT');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 border-b border-blue-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('HOME')}>
            <span className="text-3xl">⚓</span>
            <h1 className="text-2xl font-black text-blue-900 tracking-tighter">전남 Stay</h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <span className="hover:text-blue-600 transition-colors cursor-pointer">브이로그 분석</span>
            <span className="hover:text-blue-600 transition-colors cursor-pointer">핫플레이스 지도</span>
          </div>
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-xl shadow-slate-100 hover:bg-blue-600 transition-all">
            내 일정 관리
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6 py-12 md:py-20">
        {view === 'HOME' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[11px] font-black mb-6 tracking-widest animate-pulse">
                AI POWERED TRAVEL PLANNER
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
                전라남도에서 즐기는<br />
                <span className="text-blue-600">트렌디한 한달살기</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                브이로그와 SNS 데이터를 실시간 분석하여<br />
                당신에게 딱 맞는 전남의 도시와 경로를 추천합니다.
              </p>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-6 rounded-3xl mb-12 border border-red-100 flex items-center justify-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <span className="font-bold text-sm">{error}</span>
                </div>
              )}
              
              <PreferenceForm onStart={handleStartAnalysis} />
            </div>
          </div>
        )}

        {view === 'ANALYZING' && (
          <AnalysisLoader 
            isDataReady={isDataReady} 
            onFinish={handleAnalysisComplete} 
          />
        )}

        {view === 'RESULT' && route && (
          <RouteDisplay route={route} onReset={() => setView('HOME')} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-lg font-black text-slate-900 mb-2">전남 Stay AI</h4>
            <p className="text-slate-400 text-sm font-medium">© 2024 Jeonnam-Stay AI Project. Powered by Gemini 3 Flash.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
