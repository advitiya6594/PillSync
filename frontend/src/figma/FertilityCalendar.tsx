import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Pill, Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

interface OtherMedication {
  time: string;
  ingredients: string;
}

interface MedicationEntry {
  date: string; // ISO date string
  birthControlPill: {
    type: "combination" | "progestin-only";
    time: string;
  };
  otherMedications: OtherMedication[];
}

interface MedicationCalendarProps {
  cycleStartDate: Date;
  cycleLength: number;
}

const STORAGE_KEY = "pillsync:medication-tracker";

export function FertilityCalendar({ cycleStartDate, cycleLength = 28 }: MedicationCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [medicationEntries, setMedicationEntries] = useState<Record<string, MedicationEntry>>({});
  
  // Form state
  const [pillType, setPillType] = useState<"combination" | "progestin-only">("combination");
  const [pillTime, setPillTime] = useState("");
  const [otherMeds, setOtherMeds] = useState<OtherMedication[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMedicationEntries(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load medication entries:", e);
      }
    }
  }, []);

  // Save data to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicationEntries));
  }, [medicationEntries]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getMedicationEntry = (date: Date): MedicationEntry | undefined => {
    const dateKey = formatDateKey(date);
    return medicationEntries[dateKey];
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    const dateKey = formatDateKey(date);
    const existingEntry = medicationEntries[dateKey];
    
    setSelectedDate(date);
    
    // Pre-fill form if entry exists
    if (existingEntry) {
      setPillType(existingEntry.birthControlPill.type);
      setPillTime(existingEntry.birthControlPill.time);
      setOtherMeds(existingEntry.otherMedications || []);
    } else {
      // Reset form
      setPillType("combination");
      setPillTime("");
      setOtherMeds([]);
    }
    
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedDate || !pillTime.trim()) {
      return; // Pill time is mandatory
    }

    const dateKey = formatDateKey(selectedDate);
    const entry: MedicationEntry = {
      date: dateKey,
      birthControlPill: {
        type: pillType,
        time: pillTime.trim(),
      },
      otherMedications: otherMeds.filter(med => med.time.trim() && med.ingredients.trim()),
    };

    setMedicationEntries(prev => ({
      ...prev,
      [dateKey]: entry,
    }));

    setIsDialogOpen(false);
  };

  const handleAddOtherMed = () => {
    setOtherMeds([...otherMeds, { time: "", ingredients: "" }]);
  };

  const handleRemoveOtherMed = (index: number) => {
    setOtherMeds(otherMeds.filter((_, i) => i !== index));
  };

  const handleOtherMedChange = (index: number, field: keyof OtherMedication, value: string) => {
    const updated = [...otherMeds];
    updated[index] = { ...updated[index], [field]: value };
    setOtherMeds(updated);
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
    <>
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
              <Pill className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-white">Medication Tracker</h3>
              <p className="text-[#E8F48C]">Track your medications and birth control pills</p>
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
            const today = isToday(date);
            const entry = getMedicationEntry(date);
            const hasEntry = !!entry;

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleDateClick(date)}
                className={`
                  relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 text-sm cursor-pointer hover-lift
                  ${today ? 'ring-2 ring-[#E84C9E] ring-offset-2 ring-offset-[#2D3561] bg-white text-[#2D3561]' : 'bg-[#1a2340]'}
                  ${hasEntry ? 'bg-gradient-to-br from-[#7DD3E8]/30 to-[#8B7CE7]/30 text-white border-2 border-[#7DD3E8]/50' : ''}
                  ${!hasEntry && !today ? 'text-[#E8F48C]' : ''}
                  transition-all
                `}
              >
                <span className={today ? 'text-[#2D3561] font-bold' : ''}>{day}</span>
                {hasEntry && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-1"
                  >
                    <Pill className="w-3 h-3 fill-current text-[#7DD3E8]" />
                  </motion.div>
                )}
                {entry && entry.otherMedications.length > 0 && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#E84C9E]" />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-[#7DD3E8]/30 to-[#8B7CE7]/30 border-2 border-[#7DD3E8]/50 flex items-center justify-center">
              <Pill className="w-2.5 h-2.5 fill-current text-[#7DD3E8]" />
            </div>
            <span className="text-[#E8F48C]">Medication Logged</span>
          </motion.div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border-2 border-[#E84C9E]" />
            <span className="text-[#E8F48C]">Today</span>
          </div>
        </div>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#2D3561] border-[#E84C9E]/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedDate ? `Medication Entry - ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'Add Medication'}
            </DialogTitle>
            <DialogDescription className="text-[#E8F48C]/80">
              Record your birth control pill and any other medications taken on this date.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Birth Control Pill Section */}
            <div className="space-y-4 p-4 rounded-xl bg-[#1a2340]/50 border border-[#E84C9E]/30">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Birth Control Pill <span className="text-[#E84C9E]">*</span>
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pill-type" className="text-[#E8F48C]">Pill Type</Label>
                  <Select value={pillType} onValueChange={(value: "combination" | "progestin-only") => setPillType(value)}>
                    <SelectTrigger id="pill-type" className="bg-[#1a2340] border-[#8B7CE7] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2D3561] border-[#8B7CE7]">
                      <SelectItem value="combination" className="text-white">Combination Pill</SelectItem>
                      <SelectItem value="progestin-only" className="text-white">Progestin-Only Pill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pill-time" className="text-[#E8F48C]">
                    Time <span className="text-[#E84C9E]">*</span>
                  </Label>
                  <Input
                    id="pill-time"
                    type="time"
                    value={pillTime}
                    onChange={(e) => setPillTime(e.target.value)}
                    className="bg-[#1a2340] border-[#8B7CE7] text-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Other Medications Section */}
            <div className="space-y-4 p-4 rounded-xl bg-[#1a2340]/50 border border-[#8B7CE7]/30">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Other Medications (Optional)</h4>
                <Button
                  type="button"
                  onClick={handleAddOtherMed}
                  size="sm"
                  className="bg-[#8B7CE7] hover:bg-[#8B7CE7]/80 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medication
                </Button>
              </div>

              {otherMeds.length === 0 && (
                <p className="text-[#E8F48C]/60 text-sm">No other medications added yet.</p>
              )}

              {otherMeds.map((med, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-[#2D3561]/50 border border-[#7DD3E8]/30 space-y-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#E8F48C] font-medium">Medication {index + 1}</span>
                    <Button
                      type="button"
                      onClick={() => handleRemoveOtherMed(index)}
                      size="sm"
                      variant="ghost"
                      className="text-[#E84C9E] hover:text-[#E84C9E]/80 hover:bg-[#E84C9E]/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#E8F48C] text-sm">Time</Label>
                    <Input
                      type="time"
                      value={med.time}
                      onChange={(e) => handleOtherMedChange(index, 'time', e.target.value)}
                      className="bg-[#1a2340] border-[#8B7CE7] text-white text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#E8F48C] text-sm">Active Ingredients</Label>
                    <Textarea
                      placeholder="e.g., Acetylsalicylic acid, Caffeine"
                      value={med.ingredients}
                      onChange={(e) => handleOtherMedChange(index, 'ingredients', e.target.value)}
                      className="bg-[#1a2340] border-[#8B7CE7] text-white text-sm min-h-[60px]"
                      rows={2}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-[#8B7CE7] text-white hover:bg-[#8B7CE7]/20"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!pillTime.trim()}
              className="bg-gradient-to-r from-[#E84C9E] to-[#8B7CE7] hover:from-[#E84C9E]/90 hover:to-[#8B7CE7]/90 text-white disabled:opacity-50"
            >
              Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
