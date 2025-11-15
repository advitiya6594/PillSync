import { motion } from "framer-motion";
import { Activity, Brain, Droplet, Heart, Moon, Smile, Sparkles, Zap } from "lucide-react";
import { Progress } from "./ui/progress";

interface Effect {
  icon: any;
  name: string;
  description: string;
  intensity: number;
  color: string;
}

interface CurrentEffectsProps {
  cycleDay: number;
}

export function CurrentEffects({ cycleDay }: CurrentEffectsProps) {
  const getEffectsForDay = (day: number): Effect[] => {
    // Menstrual phase (days 1-7)
    if (day >= 1 && day <= 7) {
      return [
        { icon: Droplet, name: "Reduced Cramping", description: "Birth control is reducing menstrual cramps", intensity: 75, color: "from-[#E84C9E] to-[#C44C7E]" },
        { icon: Moon, name: "Lighter Flow", description: "Experiencing lighter than normal flow", intensity: 80, color: "from-[#8B7CE7] to-[#E84C9E]" },
        { icon: Brain, name: "Mood Stabilization", description: "Hormones are helping stabilize mood", intensity: 60, color: "from-[#7DD3E8] to-[#8B7CE7]" },
      ];
    }
    
    // Follicular phase (days 8-13)
    if (day >= 8 && day <= 13) {
      return [
        { icon: Sparkles, name: "Energy Boost", description: "Increased energy levels", intensity: 85, color: "from-[#FFD54F] to-[#E8F48C]" },
        { icon: Smile, name: "Positive Mood", description: "Elevated mood and wellbeing", intensity: 90, color: "from-[#7DD3E8] to-[#5BB8CC]" },
        { icon: Brain, name: "Mental Clarity", description: "Enhanced focus and concentration", intensity: 80, color: "from-[#8B7CE7] to-[#7DD3E8]" },
        { icon: Heart, name: "Skin Health", description: "Improved skin appearance", intensity: 70, color: "from-[#E84C9E] to-[#FF69B4]" },
      ];
    }
    
    // Ovulation phase (days 14-16)
    if (day >= 14 && day <= 16) {
      return [
        { icon: Heart, name: "Ovulation Suppression", description: "Birth control is preventing ovulation", intensity: 95, color: "from-[#E84C9E] to-[#FF69B4]" },
        { icon: Zap, name: "Peak Energy", description: "Hormone levels optimized", intensity: 88, color: "from-[#FFD54F] to-[#E8C547]" },
        { icon: Activity, name: "Physical Performance", description: "Enhanced physical capacity", intensity: 85, color: "from-[#7DD3E8] to-[#5BB8CC]" },
      ];
    }
    
    // Luteal phase (days 17-28)
    return [
      { icon: Brain, name: "PMS Prevention", description: "Birth control is reducing PMS symptoms", intensity: 70, color: "from-[#8B7CE7] to-[#7366D9]" },
      { icon: Moon, name: "Sleep Support", description: "Hormones supporting better sleep", intensity: 65, color: "from-[#7DD3E8] to-[#8B7CE7]" },
      { icon: Heart, name: "Acne Control", description: "Managing hormonal acne", intensity: 75, color: "from-[#E84C9E] to-[#C44C7E]" },
      { icon: Droplet, name: "Bloating Reduction", description: "Minimizing water retention", intensity: 60, color: "from-[#7DD3E8] to-[#A8E6F0]" },
    ];
  };

  const effects = getEffectsForDay(cycleDay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-[#2D3561]/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-[#8B7CE7]/30 hover-lift cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className="p-3 rounded-2xl bg-gradient-to-br from-[#8B7CE7] to-[#7DD3E8] shadow-lg"
        >
          <Activity className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h3 className="text-white">Current Effects</h3>
          <p className="text-[#E8F48C]">How birth control is affecting your body today</p>
        </div>
      </div>

      <div className="space-y-4">
        {effects.map((effect, index) => {
          const Icon = effect.icon;
          return (
            <motion.div
              key={effect.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.03, x: 5 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1a2340]/80 backdrop-blur-sm p-5 rounded-2xl border-2 border-[#E84C9E]/20 hover:border-[#E84C9E]/50 hover:shadow-2xl transition-all cursor-pointer hover-lift"
            >
              <div className="flex items-start gap-4 mb-3">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className={`p-2.5 rounded-xl bg-gradient-to-br ${effect.color} shrink-0 shadow-lg`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white">{effect.name}</h4>
                    <motion.span 
                      whileHover={{ scale: 1.1 }}
                      className={`text-sm bg-gradient-to-r ${effect.color} bg-clip-text text-transparent font-bold`}
                    >
                      {effect.intensity}%
                    </motion.span>
                  </div>
                  <p className="text-[#E8F48C]/80 text-sm mb-3">{effect.description}</p>
                  <div className="relative h-2 bg-[#0f1629] rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${effect.intensity}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                      className={`h-full bg-gradient-to-r ${effect.color} rounded-full shadow-lg`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-[#E84C9E]/10 backdrop-blur-sm rounded-2xl border-2 border-[#E84C9E]/30 hover-lift cursor-pointer"
      >
        <p className="text-[#E8F48C] text-sm">
          💡 <strong className="text-white">Note:</strong> Effects vary by individual. If you experience unusual symptoms or vomiting within 2 hours of taking your pill, consult your healthcare provider.
        </p>
      </motion.div>
    </motion.div>
  );
}

