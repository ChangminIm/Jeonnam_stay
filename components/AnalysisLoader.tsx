
import React, { useEffect, useState, useRef } from 'react';

interface Props {
  isDataReady: boolean;
  onFinish: () => void;
}

const analysisSteps = [
  "유튜브 브이로그 10개 실시간 스캔 중...",
  "Vlog 인기 장소 좌표 추출 중...",
  "사용자 취향 매칭 및 도시 선정 중...",
  "이동 경로 최적화 및 이동 시간 계산 중...",
  "대안 여행지 추천 데이터 구성 중...",
  "초고속 리포트 생성 완료 중..."
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
        // 속도감 있는 증가 (최대 12%씩 증가)
        const next = p + (Math.random() * 12);
        
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
    }, 120);

    return () => clearInterval(progInterval);
  }, [isDataReady, stepIndex]);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(onFinish, 300);
      return () => clearTimeout(timer);
    }
  }, [progress, onFinish]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px] animate-in fade-in duration-300">
      <div className="relative mb-12">
        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl animate-bounce">⚡</span>
        </div>
      </div>

      <div className="max-w-md w-full">
        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">데이터 고속 분석 중</h3>
        <p className="text-blue-600 font-bold text-sm mb-8 h-6">
          {analysisSteps[stepIndex]}
        </p>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-blue-600 transition-all duration-150 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 text-left border border-slate-800 shadow-xl">
          <div className="space-y-2 font-mono">
            {logs.map((log, i) => (
              <div key={i} className="text-[10px] flex gap-2 items-start text-slate-400">
                <span className="text-green-500">OK</span>
                <span className="leading-tight">{log}</span>
              </div>
            ))}
            <div className="text-[10px] flex gap-2 items-center text-blue-400 animate-pulse">
              <span className="shrink-0">>></span>
              <span className="font-bold uppercase">Processing...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoader;
