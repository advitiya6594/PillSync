import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Pill, Calendar, User, Weight, Ruler, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "../figma/ui/dialog";
import { Button } from "../figma/ui/button";
import { getUserProfile } from "./UserOnboarding.jsx";

const pillTypeLabels = {
  "combined_21_7": "Combined (21 active, 7 placebo)",
  "combined_24_4": "Combined (24 active, 4 placebo)",
  "continuous_28": "Continuous (28 active days)",
  "progestin_only": "Progestin-only",
};

export default function UserProfile({ open, onOpenChange }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (open) {
      const userProfile = getUserProfile();
      setProfile(userProfile);
    }
  }, [open]);

  if (!profile) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#2D3561] to-[#3d4575] border-[#E84C9E]/30">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              className="p-3 bg-gradient-to-br from-[#E84C9E] to-[#8B7CE7] rounded-2xl"
            >
              <User className="w-6 h-6 text-white" />
            </motion.div>
            <DialogTitle className="text-2xl font-bold text-white">
              My Profile
            </DialogTitle>
          </div>
          <DialogDescription className="text-[#E8F48C]/90 text-base">
            View and manage your personal information and cycle details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Personal Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-[#2D3561]/50 rounded-2xl border border-[#E84C9E]/30"
          >
            <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-[#E84C9E]" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[#E8F48C]/70 text-sm mb-1">Name</p>
                <p className="text-white text-lg font-semibold">{profile.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-[#E8F48C]/70 text-sm mb-1">Age</p>
                <p className="text-white text-lg font-semibold">{profile.age ? `${profile.age} years old` : "Not set"}</p>
              </div>
              <div>
                <p className="text-[#E8F48C]/70 text-sm mb-1 flex items-center gap-1">
                  <Weight className="w-4 h-4" />
                  Weight
                </p>
                <p className="text-white text-lg font-semibold">{profile.weight ? `${profile.weight} lbs` : "Not set"}</p>
              </div>
              <div>
                <p className="text-[#E8F48C]/70 text-sm mb-1 flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  Height
                </p>
                <p className="text-white text-lg font-semibold">{profile.height ? `${profile.height} inches` : "Not set"}</p>
              </div>
            </div>
          </motion.div>

          {/* Birth Control Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-[#2D3561]/50 rounded-2xl border border-[#8B7CE7]/30"
          >
            <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Pill className="w-5 h-5 text-[#8B7CE7]" />
              Birth Control Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[#E8F48C]/70 text-sm mb-1">Pill Type</p>
                <p className="text-white text-lg font-semibold">
                  {profile.pillType ? pillTypeLabels[profile.pillType] || profile.pillType : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-[#E8F48C]/70 text-sm mb-1">Pack Start Date</p>
                <p className="text-white text-lg font-semibold">{formatDate(profile.pillStartDate)}</p>
              </div>
            </div>
          </motion.div>

          {/* Period Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-[#2D3561]/50 rounded-2xl border border-[#7DD3E8]/30"
          >
            <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#7DD3E8]" />
              Period Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[#E8F48C]/70 text-sm mb-1">Period Start Date</p>
                <p className="text-white text-lg font-semibold">{formatDate(profile.periodStartDate)}</p>
              </div>
              <div>
                <p className="text-[#E8F48C]/70 text-sm mb-1">
                  {profile.periodOngoing ? "Status" : "Period End Date"}
                </p>
                <p className="text-white text-lg font-semibold">
                  {profile.periodOngoing ? "Ongoing" : formatDate(profile.periodEndDate)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Cycle Phase Section */}
          {profile.cyclePhase && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-gradient-to-r from-[#E84C9E]/20 to-[#8B7CE7]/20 rounded-2xl border border-[#E84C9E]/30"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#E84C9E]" />
                  Current Cycle Phase
                </h3>
                {profile.cyclePhase.aiPredicted && (
                  <span className="text-xs bg-[#8B7CE7]/30 text-[#E8F48C] px-2 py-1 rounded-full border border-[#8B7CE7]/50">
                    AI Predicted
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-[#E8F48C] text-2xl font-bold mb-1">
                    {profile.cyclePhase.phase || "Unknown"}
                  </p>
                  {profile.cyclePhase.confidence && (
                    <p className="text-white/70 text-sm">
                      Confidence: <span className="capitalize text-[#E8F48C]">{profile.cyclePhase.confidence}</span>
                    </p>
                  )}
                </div>

                {profile.cyclePhase.reasoning && (
                  <div className="p-3 bg-[#2D3561]/50 rounded-lg border border-[#E84C9E]/20">
                    <p className="text-white/80 text-sm italic">
                      {profile.cyclePhase.reasoning}
                    </p>
                  </div>
                )}

                {profile.cyclePhase.note && (
                  <p className="text-white/70 text-sm">
                    {profile.cyclePhase.note}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E84C9E]/20">
                  {profile.cyclePhase.packDay && (
                    <div>
                      <p className="text-[#E8F48C]/70 text-sm mb-1">Pack Day</p>
                      <p className="text-white font-semibold">{profile.cyclePhase.packDay}/28</p>
                    </div>
                  )}
                  {profile.cyclePhase.suppression && (
                    <div>
                      <p className="text-[#E8F48C]/70 text-sm mb-1">Hormone Suppression</p>
                      <p className="text-white font-semibold capitalize">{profile.cyclePhase.suppression}</p>
                    </div>
                  )}
                  {profile.cyclePhase.cycleDay && (
                    <div>
                      <p className="text-[#E8F48C]/70 text-sm mb-1">Cycle Day</p>
                      <p className="text-white font-semibold">{profile.cyclePhase.cycleDay}/28</p>
                    </div>
                  )}
                  {profile.cyclePhase.isActivePill !== undefined && (
                    <div>
                      <p className="text-[#E8F48C]/70 text-sm mb-1">Pill Status</p>
                      <p className="text-white font-semibold">
                        {profile.cyclePhase.isActivePill ? "Active Hormones" : "Placebo/Break"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-4 border-t border-[#E84C9E]/20"
          >
            <p className="text-xs text-[#E8F48C]/60 text-center">
              Profile created on {formatDate(profile.createdAt)}
            </p>
          </motion.div>
        </div>

        <div className="flex justify-end pt-4">
          <DialogClose asChild>
            <Button
              className="bg-gradient-to-r from-[#E84C9E] to-[#8B7CE7] hover:from-[#E84C9E]/90 hover:to-[#8B7CE7]/90 text-white font-semibold px-6 py-6"
            >
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

