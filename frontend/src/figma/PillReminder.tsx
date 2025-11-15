import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlarmClock, Check, CheckCircle, Pill, X, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

interface PillReminderProps {
  pillTime: string;
  onMarkTaken: () => void;
}

export function PillReminder({ pillTime, onMarkTaken }: PillReminderProps) {
  const [isTaken, setIsTaken] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [issue, setIssue] = useState<string>("");

  const handleMarkTaken = () => {
    setIsTaken(true);
    onMarkTaken();
  };

  const handleReportIssue = () => {
    setShowIssueDialog(true);
  };

  const handleIssueSubmit = () => {
    setShowIssueDialog(false);
    // In a real app, this would store the issue
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-gradient-to-br from-[#E84C9E] to-[#8B7CE7] rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden hover-lift cursor-pointer border-2 border-[#FFD54F]/20"
    >
      {/* Decorative background elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" 
      />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg hover-scale cursor-pointer"
          >
            <AlarmClock className="w-6 h-6" />
          </motion.div>
          <div>
            <h3 className="text-white">Daily Reminder</h3>
            <p className="text-[#FFD54F] text-sm">Take your pill at {pillTime}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isTaken ? (
            <motion.div
              key="not-taken"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleMarkTaken}
                  className="w-full bg-white text-[#8B7CE7] hover:bg-white/90 h-12 rounded-2xl shadow-lg hover-lift"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Mark as Taken
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleReportIssue}
                  variant="outline"
                  className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 h-12 rounded-2xl hover-lift"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Report an Issue
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="taken"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center gap-3 py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <div>
                <p className="text-white">Pill taken!</p>
                <p className="text-white/80 text-sm">Great job staying on track</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent className="bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              Let us know if something affected your pill's effectiveness
            </DialogDescription>
          </DialogHeader>
          
          <RadioGroup value={issue} onValueChange={setIssue} className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:border-pink-300 transition-colors">
              <RadioGroupItem value="vomiting" id="vomiting" />
              <Label htmlFor="vomiting" className="flex-1 cursor-pointer">
                <p>Vomited within 2 hours</p>
                <p className="text-sm text-gray-500">May need to take another pill</p>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:border-pink-300 transition-colors">
              <RadioGroupItem value="late" id="late" />
              <Label htmlFor="late" className="flex-1 cursor-pointer">
                <p>Took pill late (3+ hours)</p>
                <p className="text-sm text-gray-500">May affect effectiveness</p>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:border-pink-300 transition-colors">
              <RadioGroupItem value="missed" id="missed" />
              <Label htmlFor="missed" className="flex-1 cursor-pointer">
                <p>Missed pill yesterday</p>
                <p className="text-sm text-gray-500">Take as soon as possible</p>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:border-pink-300 transition-colors">
              <RadioGroupItem value="diarrhea" id="diarrhea" />
              <Label htmlFor="diarrhea" className="flex-1 cursor-pointer">
                <p>Severe diarrhea</p>
                <p className="text-sm text-gray-500">May reduce absorption</p>
              </Label>
            </div>
          </RadioGroup>

          {issue && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-amber-50 border border-amber-200 rounded-2xl"
            >
              <p className="text-amber-800 text-sm">
                ⚠️ Consider using backup contraception for the next 7 days. Consult your healthcare provider for specific guidance.
              </p>
            </motion.div>
          )}

          <Button
            onClick={handleIssueSubmit}
            disabled={!issue}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white h-12 rounded-2xl"
          >
            Submit Report
          </Button>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

