import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Button } from "./ui/button";

interface FertilityCalendarProps {
  cycleStartDate: Date;
  cycleLength: number;
}

export function FertilityCalendar({ cycleStartDate, cycleLength = 28 }: FertilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getCycleDay = (date: Date) => {
    const daysSinceStart = Math.floor((date.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24));
    return ((daysSinceStart % cycleLength) + cycleLength) % cycleLength + 1;
  };

  const isFertileDay = (cycleDay: number) => {
    return cycleDay >= 12 && cycleDay <= 18;
  };

  const isPeriodDay = (cycleDay: number) => {
    return cycleDay >= 1 && cycleDay <= 7;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -5 }}
      className="bg-[#2D3561]/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-[#E84C9E]/30 hover-lift"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="p-3 rounded-2xl bg-gradient-to-br from-[#E84C9E] to-[#FF69B4] shadow-lg cursor-pointer"
          >
            <CalendarIcon className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-white">Fertility Calendar</h3>
            <p className="text-[#E8F48C]">Track your cycle and fertility window</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={previousMonth}
            variant="outline"
            size="icon"
            className="rounded-full border-[#8B7CE7] bg-[#1a2340] hover:bg-[#8B7CE7]/20 text-white hover-lift"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </motion.div>
        
        <h4 className="text-white">{monthName}</h4>
        
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={nextMonth}
            variant="outline"
            size="icon"
            className="rounded-full border-[#8B7CE7] bg-[#1a2340] hover:bg-[#8B7CE7]/20 text-white hover-lift"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-[#E8F48C] text-sm p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} />;
          }

          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const cycleDay = getCycleDay(date);
          const fertile = isFertileDay(cycleDay);
          const period = isPeriodDay(cycleDay);
          const today = isToday(date);

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ delay: index * 0.01 }}
              className={`
                relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 text-sm cursor-pointer hover-lift
                ${today ? 'ring-2 ring-[#E84C9E] ring-offset-2 ring-offset-[#2D3561] bg-white text-[#2D3561]' : 'bg-[#1a2340]'}
                ${fertile ? 'bg-gradient-to-br from-[#E84C9E]/30 to-[#FF69B4]/30 text-white border-2 border-[#E84C9E]/50' : ''}
                ${period ? 'bg-gradient-to-br from-[#8B7CE7]/30 to-[#E84C9E]/30 text-white border-2 border-[#8B7CE7]/50' : ''}
                ${!fertile && !period && !today ? 'text-[#E8F48C]' : ''}
                transition-all
              `}
            >
              <span className={today ? 'text-[#2D3561] font-bold' : ''}>{day}</span>
              {fertile && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-3 h-3 absolute bottom-1 fill-current text-[#E84C9E]" />
                </motion.div>
              )}
              {period && (
                <motion.div 
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-[#8B7CE7] absolute bottom-1" 
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-[#8B7CE7]/30 to-[#E84C9E]/30 border-2 border-[#8B7CE7]/50" />
          <span className="text-[#E8F48C]">Period</span>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-[#E84C9E]/30 to-[#FF69B4]/30 border-2 border-[#E84C9E]/50 flex items-center justify-center">
            <Heart className="w-2.5 h-2.5 fill-current text-[#E84C9E]" />
          </div>
          <span className="text-[#E8F48C]">Fertile Window</span>
        </motion.div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border-2 border-purple-500" />
          <span className="text-gray-600">Today</span>
        </div>
      </div>
    </motion.div>
  );
}

