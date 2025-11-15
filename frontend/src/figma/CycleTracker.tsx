import { motion } from "framer-motion";
import { Calendar, Droplet, Heart, Sparkles } from "lucide-react";

interface CycleTrackerProps {
  startDate: Date;
  cycleLength: number;
}

export function CycleTracker({ startDate, cycleLength = 28 }: CycleTrackerProps) {
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = (daysSinceStart % cycleLength) + 1;
  
  const getPhase = (day: number) => {
    if (day >= 1 && day <= 7) return { name: "Menstrual", color: "from-[#E84C9E] to-[#C44C7E]", icon: Droplet };
    if (day >= 8 && day <= 13) return { name: "Follicular", color: "from-[#8B7CE7] to-[#E84C9E]", icon: Sparkles };
    if (day >= 14 && day <= 16) return { name: "Ovulation", color: "from-[#E84C9E] to-[#FF69B4]", icon: Heart };
    return { name: "Luteal", color: "from-[#7DD3E8] to-[#8B7CE7]", icon: Calendar };
  };

  const phase = getPhase(currentDay);
  const PhaseIcon = phase.icon;

  const getFertilityStatus = (day: number) => {
    if (day >= 12 && day <= 18) return { status: "High Fertility", color: "text-rose-500" };
    if (day >= 9 && day <= 11 || day >= 19 && day <= 21) return { status: "Moderate Fertility", color: "text-amber-500" };
    return { status: "Low Fertility", color: "text-emerald-500" };
  };

  const fertility = getFertilityStatus(currentDay);

  const progress = (currentDay / cycleLength) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-[#2D3561]/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-[#E84C9E]/30 hover-lift cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`p-3 rounded-2xl bg-gradient-to-br ${phase.color} shadow-lg`}
        >
          <PhaseIcon className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h3 className="text-white">Current Phase</h3>
          <p className="text-[#E8F48C]">Day {currentDay} of {cycleLength}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className={`bg-gradient-to-r ${phase.color} bg-clip-text text-transparent text-lg`}>
            {phase.name} Phase
          </span>
          <span className="text-[#7DD3E8]">{fertility.status}</span>
        </div>
        <div className="relative h-3 bg-[#1a2340] rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${phase.color} rounded-full shadow-lg`}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: cycleLength }).map((_, i) => {
          const day = i + 1;
          const dayPhase = getPhase(day);
          const isToday = day === currentDay;
          const isFertile = day >= 12 && day <= 18;

          return (
            <motion.div
              key={day}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: isToday ? 1.2 : 1.15, rotate: 5 }}
              transition={{ delay: i * 0.01 }}
              className={`
                relative aspect-square rounded-lg flex items-center justify-center text-xs cursor-pointer hover-lift
                ${isToday ? `bg-gradient-to-br ${dayPhase.color} text-white shadow-xl scale-110` : 'bg-[#1a2340] text-[#E8F48C]'}
                ${isFertile && !isToday ? 'ring-2 ring-[#E84C9E]/50' : ''}
              `}
            >
              {day}
              {isFertile && !isToday && (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-[#E84C9E] rounded-full shadow-lg" 
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

