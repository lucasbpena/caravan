import { type PlayerId } from "../game/turns";


type Props = {
  result: PlayerId;
  onRestart: () => void;
};

export function GameEndBanner({ result, onRestart }: { result: PlayerId; onRestart: () => void }) {
  const isVictory = result === 'player';
  
  return (
    <>
      {/* Subtle overlay */}
      <div className={`
        fixed inset-0 z-30
        ${isVictory ? 'bg-green-500/10' : 'bg-red-500/10'}
        animate-in fade-in duration-1000
      `} />

      {/* Left edge glow */}
      <div className={`
        fixed left-0 top-0 bottom-0 z-35
        w-2
        ${isVictory 
          ? 'bg-linear-to-r from-green-500 to-transparent' 
          : 'bg-linear-to-r from-red-500 to-transparent'
        }
        ${isVictory ? 'shadow-[0_0_30px_10px_rgba(34,197,94,0.4)]' : 'shadow-[0_0_30px_10px_rgba(239,68,68,0.4)]'}
        animate-pulse
      `} />

      {/* Floating result card */}
      <div className={`
        fixed left-10 top-1/3 -translate-y-1/2 z-100
        ${isVictory 
          ? 'bg-linear-to-br from-green-500 to-emerald-600' 
          : 'bg-linear-to-br from-red-500 to-rose-600'
        }
        p-8 rounded-2xl
        shadow-2xl
        ${isVictory ? 'shadow-green-500/50' : 'shadow-red-500/50'}
        border-4 ${isVictory ? 'border-green-300' : 'border-red-300'}
        animate-in zoom-in-50 slide-in-from-left duration-700
        backdrop-blur-sm
      `}>
        <div className="flex flex-col items-center gap-6">
          {/* Icon */}
          <div className="text-white text-7xl font-black">
            {isVictory ? '👑' : '💀'}
          </div>
          
          {/* Text */}
          <div className="text-white font-black text-4xl tracking-wide text-center">
            {isVictory ? 'VICTORY' : 'DEFEAT'}
          </div>
          
          {/* Button */}
          <button
            onClick={onRestart}
            className="
              mt-4
              bg-white hover:bg-gray-100
              text-gray-900 font-bold
              px-8 py-3 rounded-xl
              shadow-xl
              transition-all hover:scale-105
              text-lg
              cursor-pointer
            "
          >
            🔄 Play again
          </button>
        </div>
      </div>
    </>
  );
}
