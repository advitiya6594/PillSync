import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Pill, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../figma/ui/dialog";
import { Input } from "../figma/ui/input";
import { Label } from "../figma/ui/label";
import { Button } from "../figma/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../figma/ui/select";

const STORAGE_KEY = "pillsync:user-profile";

const API = import.meta.env.VITE_API_URL || "http://localhost:5050";

// Map pill types to API pack types
const pillTypeMap = {
  "combined_21_7": "combined_21_7",
  "combined_24_4": "combined_24_4",
  "continuous_28": "continuous_28",
  "progestin_only": "progestin_only",
};

export function getUserProfile() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to load user profile:", e);
    }
  }
  return null;
}

export function isProfileComplete() {
  const profile = getUserProfile();
  if (!profile) return false;
  
  return (
    profile.name &&
    profile.age &&
    profile.weight &&
    profile.height &&
    profile.pillType &&
    profile.pillStartDate &&
    profile.periodStartDate &&
    (profile.periodEndDate || profile.periodOngoing) &&
    profile.cyclePhase
  );
}

export default function UserOnboarding() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    pillType: "",
    pillStartDate: "",
    periodStartDate: "",
    periodEndDate: "",
    periodOngoing: false,
  });
  
  const [cyclePhase, setCyclePhase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if profile already exists and load it
  useEffect(() => {
    const existing = getUserProfile();
    if (existing) {
      setFormData({
        name: existing.name || "",
        age: existing.age || "",
        weight: existing.weight || "",
        height: existing.height || "",
        pillType: existing.pillType || "",
        pillStartDate: existing.pillStartDate || "",
        periodStartDate: existing.periodStartDate || "",
        periodEndDate: existing.periodEndDate || "",
        periodOngoing: existing.periodOngoing || false,
      });
      setCyclePhase(existing.cyclePhase || null);
    }
  }, []);

  // Determine cycle phase when period dates and pill info are available
  useEffect(() => {
    if (
      formData.pillType &&
      formData.pillStartDate &&
      formData.periodStartDate &&
      (formData.periodEndDate || formData.periodOngoing)
    ) {
      determineCyclePhase();
    }
  }, [formData.pillType, formData.pillStartDate, formData.periodStartDate, formData.periodEndDate, formData.periodOngoing]);

  const determineCyclePhase = async () => {
    if (!formData.pillType || !formData.pillStartDate) return;

    setLoading(true);
    setError("");

    try {
      // Format dates as YYYY-MM-DD
      const pillStartDateStr = formData.pillStartDate.split('T')[0];
      const periodStartDateStr = formData.periodStartDate.split('T')[0];
      const periodEndDateStr = formData.periodEndDate ? formData.periodEndDate.split('T')[0] : null;

      // Try OpenAI prediction first
      try {
        const predictionResponse = await fetch(
          `${API}/api/ai/predict-cycle-phase`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              periodStartDate: periodStartDateStr,
              periodEndDate: periodEndDateStr,
              periodOngoing: formData.periodOngoing,
              pillType: formData.pillType,
              pillStartDate: pillStartDateStr,
            }),
          }
        );

        if (predictionResponse.ok) {
          const predictionData = await predictionResponse.json();
          
          // Use AI prediction
          const phaseInfo = {
            phase: predictionData.phase,
            confidence: predictionData.confidence,
            reasoning: predictionData.reasoning,
            cycleDay: predictionData.cycleDay,
            note: predictionData.note,
            packDay: predictionData.packDay,
            packType: predictionData.packType,
            isActivePill: predictionData.isActivePill,
            suppression: predictionData.suppression,
            periodStartDate: formData.periodStartDate,
            periodEndDate: formData.periodEndDate,
            periodOngoing: formData.periodOngoing,
            aiPredicted: true,
          };

          setCyclePhase(phaseInfo);
          setLoading(false);
          return;
        }
      } catch (aiError) {
        console.warn("AI prediction failed, falling back to rule-based calculation:", aiError);
        // Continue to fallback calculation below
      }

      // Fallback to rule-based calculation if AI is unavailable
      const packType = pillTypeMap[formData.pillType];
      if (!packType) {
        setError("Invalid pill type");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API}/api/cycle?packType=${encodeURIComponent(packType)}&startDate=${pillStartDateStr}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cycle information");
      }

      const data = await response.json();
      
      // Calculate days from period start
      const periodStart = new Date(formData.periodStartDate);
      const today = new Date();
      const daysSincePeriodStart = Math.floor(
        (today.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine phase based on period status and cycle day
      let phase = "";
      
      if (formData.periodOngoing) {
        // Period is currently ongoing
        phase = "Menstrual (Active Period - Currently bleeding)";
      } else if (formData.periodEndDate) {
        const periodEnd = new Date(formData.periodEndDate);
        const periodDuration = Math.floor(
          (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Check if currently in period range
        if (daysSincePeriodStart >= 0 && daysSincePeriodStart <= periodDuration) {
          phase = "Menstrual (Days 1-7)";
        } else {
          // Calculate cycle day (assuming 28-day cycle)
          const cycleDay = (daysSincePeriodStart % 28) || 28;
          
          if (cycleDay >= 1 && cycleDay <= 7) {
            phase = "Menstrual (Days 1-7)";
          } else if (cycleDay >= 8 && cycleDay <= 13) {
            phase = "Follicular (Days 8-13)";
          } else if (cycleDay >= 14 && cycleDay <= 16) {
            phase = "Ovulation (Days 14-16)";
          } else {
            phase = "Luteal (Days 17-28)";
          }
        }
      } else {
        // Use API data as fallback
        phase = data.phaseLabel || "Unknown";
      }

      // Combine with API cycle info
      const phaseInfo = {
        phase,
        confidence: "medium",
        reasoning: "Rule-based calculation (AI unavailable)",
        cycleDay: (daysSincePeriodStart % 28) || 28,
        packDay: data.packDay,
        packType: data.packType,
        isActivePill: data.isActivePill,
        suppression: data.suppression,
        periodStartDate: formData.periodStartDate,
        periodEndDate: formData.periodEndDate,
        periodOngoing: formData.periodOngoing,
        aiPredicted: false,
      };

      setCyclePhase(phaseInfo);
    } catch (err) {
      console.error("Error determining cycle phase:", err);
      setError("Failed to determine cycle phase. Please check your dates.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError("Please fill out all required fields");
      return;
    }

    if (!cyclePhase) {
      setError("Please wait while we determine your cycle phase");
      return;
    }

    const profile = {
      ...formData,
      cyclePhase,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    
    // Trigger a custom event to notify App.jsx
    window.dispatchEvent(new CustomEvent("profileUpdated"));
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.age &&
      formData.weight &&
      formData.height &&
      formData.pillType &&
      formData.pillStartDate &&
      formData.periodStartDate &&
      (formData.periodEndDate || formData.periodOngoing) &&
      cyclePhase
    );
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  return (
    <Dialog open={true} modal={true}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#2D3561] to-[#3d4575] border-[#E84C9E]/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              className="p-3 bg-gradient-to-br from-[#E84C9E] to-[#8B7CE7] rounded-2xl"
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <DialogTitle className="text-2xl font-bold text-white">
              Welcome to PillSync! 💕
            </DialogTitle>
          </div>
          <DialogDescription className="text-[#E8F48C]/90 text-base">
            Let's get to know you better. Fill out the information below to personalize your experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#E84C9E]" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Name <span className="text-[#E84C9E]">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your name"
                  className="bg-[#2D3561]/50 border-[#E84C9E]/30 text-white placeholder:text-white/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-white">
                  Age <span className="text-[#E84C9E]">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  placeholder="Your age"
                  className="bg-[#2D3561]/50 border-[#E84C9E]/30 text-white placeholder:text-white/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-white">
                  Weight (lbs) <span className="text-[#E84C9E]">*</span>
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="Your weight"
                  className="bg-[#2D3561]/50 border-[#E84C9E]/30 text-white placeholder:text-white/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height" className="text-white">
                  Height (inches) <span className="text-[#E84C9E]">*</span>
                </Label>
                <Input
                  id="height"
                  type="number"
                  min="1"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="Your height"
                  className="bg-[#2D3561]/50 border-[#E84C9E]/30 text-white placeholder:text-white/50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Birth Control Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#8B7CE7]" />
              Birth Control Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pillType" className="text-white">
                  Pill Type <span className="text-[#E84C9E]">*</span>
                </Label>
                <Select
                  value={formData.pillType}
                  onValueChange={(value) => handleInputChange("pillType", value)}
                >
                  <SelectTrigger className="bg-[#2D3561]/50 border-[#E84C9E]/30 text-white">
                    <SelectValue placeholder="Select pill type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2D3561] border-[#E84C9E]/30 text-white">
                    <SelectItem value="combined_21_7">Combined (21 active, 7 placebo)</SelectItem>
                    <SelectItem value="combined_24_4">Combined (24 active, 4 placebo)</SelectItem>
                    <SelectItem value="continuous_28">Continuous (28 active days)</SelectItem>
                    <SelectItem value="progestin_only">Progestin-only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pillStartDate" className="text-white">
                  When did you start this pack? <span className="text-[#E84C9E]">*</span>
                </Label>
                <Input
                  id="pillStartDate"
                  type="date"
                  value={formData.pillStartDate}
                  onChange={(e) => handleInputChange("pillStartDate", e.target.value)}
                  className="bg-[#2D3561]/50 border-[#E84C9E]/30 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Period Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#7DD3E8]" />
              Period Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="periodStartDate" className="text-white">
                  Period Start Date <span className="text-[#E84C9E]">*</span>
                </Label>
                <Input
                  id="periodStartDate"
                  type="date"
                  value={formData.periodStartDate}
                  onChange={(e) => handleInputChange("periodStartDate", e.target.value)}
                  className="bg-[#2D3561]/50 border-[#E84C9E]/30 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodEndDate" className="text-white">
                  Period End Date {!formData.periodOngoing && <span className="text-[#E84C9E]">*</span>}
                </Label>
                <Input
                  id="periodEndDate"
                  type="date"
                  value={formData.periodEndDate}
                  onChange={(e) => handleInputChange("periodEndDate", e.target.value)}
                  disabled={formData.periodOngoing}
                  className="bg-[#2D3561]/50 border-[#E84C9E]/30 text-white disabled:opacity-50"
                  required={!formData.periodOngoing}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="periodOngoing"
                checked={formData.periodOngoing}
                onChange={(e) => {
                  handleInputChange("periodOngoing", e.target.checked);
                  if (e.target.checked) {
                    handleInputChange("periodEndDate", "");
                  }
                }}
                className="w-4 h-4 rounded border-[#E84C9E]/30 bg-[#2D3561]/50 text-[#E84C9E] focus:ring-[#E84C9E]"
              />
              <Label htmlFor="periodOngoing" className="text-white cursor-pointer">
                My period is still ongoing
              </Label>
            </div>
          </div>

          {/* Cycle Phase Display */}
          {cyclePhase && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-[#E84C9E]/20 to-[#8B7CE7]/20 rounded-xl border border-[#E84C9E]/30"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-semibold">Your Cycle Phase:</h4>
                {cyclePhase.aiPredicted && (
                  <span className="text-xs bg-[#8B7CE7]/30 text-[#E8F48C] px-2 py-1 rounded-full border border-[#8B7CE7]/50">
                    AI Predicted
                  </span>
                )}
              </div>
              <p className="text-[#E8F48C] text-lg font-bold">{cyclePhase.phase}</p>
              {cyclePhase.confidence && (
                <p className="text-white/70 text-xs mt-1">
                  Confidence: <span className="capitalize">{cyclePhase.confidence}</span>
                </p>
              )}
              {cyclePhase.reasoning && (
                <p className="text-white/80 text-sm mt-2 italic">
                  {cyclePhase.reasoning}
                </p>
              )}
              {cyclePhase.note && (
                <p className="text-white/70 text-xs mt-1">
                  {cyclePhase.note}
                </p>
              )}
              {cyclePhase.packDay && (
                <p className="text-white/80 text-sm mt-2">
                  Pack Day: {cyclePhase.packDay}/28 | Suppression: {cyclePhase.suppression}
                </p>
              )}
            </motion.div>
          )}

          {loading && (
            <div className="text-[#E8F48C] text-sm flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-[#E84C9E] border-t-transparent rounded-full"
              />
              Using AI to predict your cycle phase...
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={!isFormValid() || loading}
              className="bg-gradient-to-r from-[#E84C9E] to-[#8B7CE7] hover:from-[#E84C9E]/90 hover:to-[#8B7CE7]/90 text-white font-semibold px-8 py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Get Started!"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

