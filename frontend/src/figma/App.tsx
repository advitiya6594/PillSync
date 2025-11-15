import { useState } from "react";
import { motion } from "framer-motion";
import { Pill, Calendar, Activity, Shield, Sparkles, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { CycleTracker } from "./components/CycleTracker";
import { MedicationChecker } from "./components/MedicationChecker";
import { CurrentEffects } from "./components/CurrentEffects";
import { PillReminder } from "./components/PillReminder";
import { FertilityCalendar } from "./components/FertilityCalendar";
import { ArtisticIllustration, FloatingShapes } from "./components/ArtisticIllustration";
import diverseWomenArt from "/figma/2cc324443e5a26c23b89d8d960274aea9746c4a7.png";

export default function App() {
  // Mock data - in a real app, this would come from user settings
  const cycleStartDate = new Date(2025, 10, 1); // November 1, 2025
  const cycleLength = 28;
  const pillTime = "9:00 AM";
  
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = (daysSinceStart % cycleLength) + 1;

  const handleMarkPillTaken = () => {
    // In a real app, this would save to a database
    console.log("Pill marked as taken");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D3561] via-[#3d4575] to-[#4a5288] relative overflow-hidden">
      {/* Floating animated shapes */}
      <FloatingShapes />
      
      {/* Decorative background elements with new color palette */}
      <motion.div 
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E84C9E]/20 to-[#8B7CE7]/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transform: "translate(30%, -30%)" }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-[#7DD3E8]/20 to-[#FFD54F]/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{ transform: "translate(-30%, 30%)" }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-[#E8F48C]/15 to-[#E84C9E]/15 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transform: "translate(-50%, -50%)" }}
      />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="p-4 bg-gradient-to-br from-[#E84C9E] to-[#8B7CE7] rounded-3xl shadow-xl cursor-pointer hover-lift"
            >
              <Pill className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-white flex items-center gap-3">
                PillSync
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-[#FFD54F]" />
                </motion.div>
              </h1>
              <p className="text-[#E8F48C]">Your personalized birth control companion</p>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-[#E84C9E] via-[#8B7CE7] to-[#7DD3E8] p-[3px] rounded-3xl shadow-2xl hover-glow"
          >
            <div className="bg-[#2D3561] rounded-3xl p-6 md:p-8 backdrop-blur-sm">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="text-white">Welcome back! 💕</h2>
                  <p className="text-[#E8F48C]/90">
                    Track your cycle, check medication interactions, and stay on top of your birth control routine with confidence.
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-2 bg-[#E84C9E]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E84C9E]/30 cursor-pointer hover-lift"
                    >
                      <Heart className="w-4 h-4 text-[#E84C9E]" />
                      <span className="text-white">Safe & Private</span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-2 bg-[#8B7CE7]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#8B7CE7]/30 cursor-pointer hover-lift"
                    >
                      <Shield className="w-4 h-4 text-[#8B7CE7]" />
                      <span className="text-white">Medically Informed</span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-2 bg-[#7DD3E8]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#7DD3E8]/30 cursor-pointer hover-lift"
                    >
                      <Sparkles className="w-4 h-4 text-[#7DD3E8]" />
                      <span className="text-white">Always Here</span>
                    </motion.div>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden h-64 md:h-auto group cursor-pointer">
                  <motion.img
                    src={diverseWomenArt}
                    alt="Diverse women illustration"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2D3561]/70 to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.header>

        {/* Daily Reminder Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <PillReminder pillTime={pillTime} onMarkTaken={handleMarkPillTaken} />
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="w-full bg-[#2D3561]/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border-2 border-[#E84C9E]/30 flex-wrap h-auto gap-2">
              <TabsTrigger 
                value="overview" 
                className="flex-1 min-w-[120px] rounded-xl transition-all duration-300 hover:scale-105 hover-lift data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E84C9E] data-[state=active]:to-[#8B7CE7] data-[state=active]:text-white data-[state=inactive]:text-[#E8F48C] data-[state=inactive]:hover:bg-[#E84C9E]/10"
              >
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="medications" 
                className="flex-1 min-w-[120px] rounded-xl transition-all duration-300 hover:scale-105 hover-lift data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8B7CE7] data-[state=active]:to-[#7DD3E8] data-[state=active]:text-white data-[state=inactive]:text-[#E8F48C] data-[state=inactive]:hover:bg-[#8B7CE7]/10"
              >
                <Pill className="w-4 h-4 mr-2" />
                Medications
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="flex-1 min-w-[120px] rounded-xl transition-all duration-300 hover:scale-105 hover-lift data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7DD3E8] data-[state=active]:to-[#FFD54F] data-[state=active]:text-[#2D3561] data-[state=inactive]:text-[#E8F48C] data-[state=inactive]:hover:bg-[#7DD3E8]/10"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <CycleTracker startDate={cycleStartDate} cycleLength={cycleLength} />
                <CurrentEffects cycleDay={currentDay} />
              </div>
            </TabsContent>

            <TabsContent value="medications">
              <MedicationChecker />
            </TabsContent>

            <TabsContent value="calendar">
              <FertilityCalendar cycleStartDate={cycleStartDate} cycleLength={cycleLength} />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-sm"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-[#2D3561]/80 backdrop-blur-md rounded-2xl p-6 border-2 border-[#E84C9E]/30 shadow-xl hover-lift"
          >
            <p className="mb-2 text-white">
              💜 PillSync is designed to support your health journey
            </p>
            <p className="text-xs text-[#E8F48C]/80">
              Always consult with your healthcare provider for medical advice. This app is for informational purposes only.
            </p>
          </motion.div>
        </motion.footer>
      </div>
    </div>
  );
}

