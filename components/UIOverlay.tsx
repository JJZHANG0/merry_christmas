
import React from 'react';
import { useStore } from '../store';
import { GestureType } from '../types';

export const UIOverlay: React.FC = () => {
  const { hand, isLoadingVision } = useStore();

  const getStatusColor = () => {
    if (!hand.isDetected) return 'text-gray-500';
    if (hand.gesture === GestureType.CLOSED_FIST) return 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]';
    if (hand.gesture === GestureType.OPEN_HAND) return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]';
    if (hand.gesture === GestureType.PINCH) return 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]';
    return 'text-white';
  };

  const getStatusText = () => {
    if (!hand.isDetected) return 'Looking for hand...';
    if (hand.gesture === GestureType.CLOSED_FIST) return 'ASSEMBLING TREE';
    if (hand.gesture === GestureType.OPEN_HAND) return 'DISPERSING CLOUD';
    if (hand.gesture === GestureType.PINCH) return 'ENLARGING PHOTO';
    return 'TRACKING HAND';
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 font-mono">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-widest drop-shadow-lg" style={{ textShadow: "0 0 20px rgba(57, 255, 20, 0.5)" }}>
            STEMHUB 
          </h1>
          <p className="text-xs text-green-400 mt-2 uppercase tracking-[0.3em]">
            祝您圣诞快乐～
          </p>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${hand.isDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-white/70 uppercase">
             {isLoadingVision ? 'Loading Vision Model...' : (hand.isDetected ? 'System Online' : 'No Signal')}
          </span>
        </div>
      </div>

      {/* Center Status */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-300 transform scale-100">
         <div className={`text-2xl font-bold transition-colors duration-300 ${getStatusColor()}`}>
            {getStatusText()}
         </div>
         {hand.isDetected && (
            <div className="text-xs text-white/30 mt-2">
               X: {hand.position.x.toFixed(2)} | Rot: {hand.rotation.toFixed(2)}
            </div>
         )}
      </div>

      {/* Footer Instructions */}
      <div className="flex justify-center gap-8 text-white/60 text-sm">
        <div className={`flex flex-col items-center gap-2 transition-all ${hand.gesture === GestureType.CLOSED_FIST ? 'text-green-400 scale-110' : ''}`}>
           <div className="w-12 h-12 border border-current rounded-full flex items-center justify-center text-xl">
              ✊
           </div>
           <span>ASSEMBLE</span>
        </div>
        <div className="w-px bg-white/20"></div>
        <div className={`flex flex-col items-center gap-2 transition-all ${hand.gesture === GestureType.OPEN_HAND ? 'text-yellow-400 scale-110' : ''}`}>
           <div className="w-12 h-12 border border-current rounded-full flex items-center justify-center text-xl">
              🖐️
           </div>
           <span>SCATTER</span>
        </div>
        <div className="w-px bg-white/20"></div>
        <div className={`flex flex-col items-center gap-2 transition-all ${hand.gesture === GestureType.PINCH ? 'text-cyan-400 scale-110' : ''}`}>
           <div className="w-12 h-12 border border-current rounded-full flex items-center justify-center text-xl">
              🤏
           </div>
           <span>GRAB</span>
        </div>
      </div>
    </div>
  );
};
