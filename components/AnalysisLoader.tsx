
import React, { useEffect, useState } from 'react';

interface Props {
  isDataReady: boolean;
  onFinish: () => void;
}

const analysisSteps = [
  "전남 지역 최신 유튜브 트렌드 데이터 로딩 중...",
  "사용자 취향 기반 최적 도시(여수/순천/목포) 분석 중...",
  "AI 브이로그 장소 언급 빈도 필터링 중...",
  "장소 간 실시간 이동 시간 및 최적 동선 계산 중...",
  "대안 여행지 및 테마별 핫플레이스 매핑 중...",
  "당신만을 위한 맞춤형 전남 여행 리포트 생성 중..."
];

const AnalysisLoader: React.FC<Props> = ({ isDataReady, onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const progInterval = setInterval(() => {
      setProgress(p => {
        if (isDataReady) return 100;
        if (p >= 99) return 99;
        
        // 데이터 준비 상태가 아니어도 99%까지는 빠르게 진행 (평균 2-3초 소요)
        const increment = Math.random() * 15;
        const next = p + increment;
        
        const nextStep = Math.min(
          Math.floor((next / 100) * analysisSteps.length),
          analysisSteps.length - 1
        );
        if (nextStep !== stepIndex) {
          setStepIndex(nextStep);
          setLogs(prev => [...prev, analysisSteps[nextStep]].slice(-3));
        }
        
        return next;
      });
    }, 150);

    return () => clearInterval(progInterval);
  }, [isDataReady, stepIndex]);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(onFinish, 400);
      return () => clearTimeout(timer);
    }
  }, [progress, onFinish]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[450px] animate-in fade-in duration-500">
      {/* Dynamic Loader Icon */}
      <div className="relative mb-14">
        <div className="w-24 h-24 border-[6px] border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 w-24 h-24 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl animate-pulse">⚡</span>
        </div>
      </div>

      <div className="max-w-md w-full">
        <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">AI 고속 분석 중</h3>
        <p className="text-blue-600 font-bold text-sm mb-10 h-6">
          {analysisSteps[stepIndex]}
        </p>

        {/* Glossy Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-12 shadow-inner border border-slate-50">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        {/* Minimal Terminal Log */}
        <div className="bg-slate-900 rounded-[2rem] p-8 text-left border border-slate-800 shadow-2xl">
          <div className="flex gap-2 mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/30"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/30"></div>
          </div>
          <div className="space-y-3 font-mono">
            {logs.map((log, i) => (
              <div key={i} className="text-[11px] flex gap-3 items-start">
                <span className="text-green-400 font-bold">SUCCESS</span>
                <span className="text-slate-400 leading-tight">{log}</span>
              </div>
            ))}
            <div className="text-[11px] flex gap-3 items-center text-blue-400 animate-pulse">
              <span className="shrink-0 font-bold">PROCESS</span>
              <span className="font-bold uppercase tracking-widest">Fetching Trends...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoader;
