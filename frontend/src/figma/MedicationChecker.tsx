import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, Pill, Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Medication {
  name: string;
  category: string;
  interactionLevel: "high" | "moderate" | "low" | "none";
  description: string;
}

const medications: Medication[] = [
  { name: "Antibiotics (Rifampin)", category: "Antibiotic", interactionLevel: "high", description: "Can significantly reduce birth control effectiveness. Use backup contraception." },
  { name: "St. John's Wort", category: "Supplement", interactionLevel: "high", description: "Herbal supplement that reduces hormone levels. Avoid or use backup method." },
  { name: "Anti-seizure medications", category: "Neurological", interactionLevel: "moderate", description: "Some may reduce effectiveness. Consult your doctor." },
  { name: "Antiretrovirals (HIV meds)", category: "Antiviral", interactionLevel: "moderate", description: "May interact with hormonal birth control. Discuss with healthcare provider." },
  { name: "Common Antibiotics", category: "Antibiotic", interactionLevel: "low", description: "Most antibiotics don't affect birth control, but consult your doctor." },
  { name: "Vitamin C", category: "Supplement", interactionLevel: "none", description: "Safe to take with birth control pills." },
  { name: "Prenatal Vitamins", category: "Supplement", interactionLevel: "none", description: "Safe to take with birth control pills." },
  { name: "Ibuprofen", category: "Pain Relief", interactionLevel: "none", description: "Does not interact with birth control." },
  { name: "Antifungal (Fluconazole)", category: "Antifungal", interactionLevel: "low", description: "Minimal interaction. Safe for short-term use." },
];

export function MedicationChecker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMeds, setSelectedMeds] = useState<Medication[]>([]);

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addMedication = (med: Medication) => {
    if (!selectedMeds.find(m => m.name === med.name)) {
      setSelectedMeds([...selectedMeds, med]);
    }
    setSearchTerm("");
  };

  const removeMedication = (medName: string) => {
    setSelectedMeds(selectedMeds.filter(m => m.name !== medName));
  };

  const getInteractionIcon = (level: string) => {
    switch (level) {
      case "high": return <AlertTriangle className="w-5 h-5" />;
      case "moderate": return <Info className="w-5 h-5" />;
      case "low": return <Info className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getInteractionColor = (level: string) => {
    switch (level) {
      case "high": return "bg-[#E84C9E]/10 border-[#E84C9E] text-white";
      case "moderate": return "bg-[#FFD54F]/10 border-[#FFD54F] text-white";
      case "low": return "bg-[#7DD3E8]/10 border-[#7DD3E8] text-white";
      default: return "bg-[#7DD3E8]/10 border-[#7DD3E8] text-white";
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case "high": return "bg-[#E84C9E] text-white";
      case "moderate": return "bg-[#FFD54F] text-[#2D3561]";
      case "low": return "bg-[#7DD3E8] text-[#2D3561]";
      default: return "bg-[#7DD3E8] text-[#2D3561]";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -5 }}
      className="bg-[#2D3561]/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-[#8B7CE7]/30 hover-lift"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className="p-3 rounded-2xl bg-gradient-to-br from-[#8B7CE7] to-[#E84C9E] shadow-lg cursor-pointer"
        >
          <Pill className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h3 className="text-white">Medication Interaction Checker</h3>
          <p className="text-[#E8F48C]">Check if your medications affect birth control</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E8F48C]" />
        <Input
          type="text"
          placeholder="Search medications or supplements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 rounded-2xl border-2 border-[#8B7CE7]/30 bg-[#1a2340] text-white placeholder:text-[#E8F48C]/50 focus:border-[#E84C9E] focus:ring-[#E84C9E]/20 hover-lift transition-all"
        />
      </div>

      <AnimatePresence>
        {searchTerm && filteredMedications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-[#1a2340]/80 backdrop-blur-sm rounded-2xl p-4 space-y-2 max-h-48 overflow-y-auto border border-[#8B7CE7]/20"
          >
            {filteredMedications.slice(0, 5).map((med) => (
              <motion.button
                key={med.name}
                onClick={() => addMedication(med)}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left p-3 hover:bg-[#8B7CE7]/20 rounded-xl transition-all flex items-center justify-between hover-lift border border-transparent hover:border-[#E84C9E]/30"
              >
                <div>
                  <p className="text-white">{med.name}</p>
                  <p className="text-[#E8F48C]/70 text-sm">{med.category}</p>
                </div>
                <Badge className={getBadgeColor(med.interactionLevel)}>
                  {med.interactionLevel}
                </Badge>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedMeds.length === 0 ? (
        <div className="text-center py-12 text-[#E8F48C]/60">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
          </motion.div>
          <p className="text-white">No medications selected</p>
          <p className="text-sm">Search and add medications to check interactions</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {selectedMeds.map((med) => (
              <motion.div
                key={med.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`p-4 rounded-2xl border-2 ${getInteractionColor(med.interactionLevel)} hover-lift cursor-pointer backdrop-blur-sm`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getInteractionIcon(med.interactionLevel)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white">{med.name}</p>
                        <Badge variant="outline" className="text-xs border-[#E8F48C]/30 text-[#E8F48C]">
                          {med.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#E8F48C]/80">{med.description}</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => removeMedication(med.name)}
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 hover:bg-[#E84C9E]/20 rounded-lg transition-colors text-white"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {selectedMeds.some(m => m.interactionLevel === "high" || m.interactionLevel === "moderate") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="mt-6 p-4 bg-[#E84C9E]/10 border-2 border-[#E84C9E] rounded-2xl backdrop-blur-sm hover-lift"
        >
          <p className="text-[#FFD54F] text-sm">
            ⚠️ <strong className="text-white">Important:</strong> Consult your healthcare provider about these interactions. 
            You may need to use backup contraception methods.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

