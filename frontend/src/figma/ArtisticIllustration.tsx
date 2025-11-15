import { motion } from "framer-motion";

export function ArtisticIllustration() {
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Woman 1 - Left with headwrap */}
        <motion.g
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Body */}
          <path d="M 50 250 Q 50 180 80 180 L 120 180 Q 150 180 150 250 Z" fill="#6B5CE7" />
          {/* Neck */}
          <rect x="85" y="155" width="30" height="25" fill="#C47B5B" />
          {/* Face */}
          <ellipse cx="100" cy="140" rx="30" ry="35" fill="#D4A68A" />
          {/* Headwrap - multiple colored sections */}
          <path d="M 70 120 Q 70 100 100 100 Q 130 100 130 120 L 130 140 Q 130 150 100 155 Q 70 150 70 140 Z" fill="#E84C9E" />
          <path d="M 75 110 Q 90 95 105 110" fill="#8B7CE7" />
          <ellipse cx="85" cy="105" rx="15" ry="20" fill="#FFD54F" />
          <ellipse cx="115" cy="105" rx="15" ry="20" fill="#7DD3E8" />
          {/* Smile */}
          <path d="M 90 145 Q 100 150 110 145" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Lips */}
          <ellipse cx="100" cy="155" rx="8" ry="4" fill="#E84C9E" />
        </motion.g>

        {/* Woman 2 - Center with curly hair */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Body */}
          <path d="M 150 250 Q 150 190 180 190 L 220 190 Q 250 190 250 250 Z" fill="#7DD3E8" />
          {/* Pattern on dress */}
          <path d="M 160 210 Q 170 200 180 210 Q 190 200 200 210 Q 210 200 220 210 Q 230 200 240 210" 
                stroke="#5BB8CC" strokeWidth="1.5" fill="none" />
          {/* Neck */}
          <rect x="185" y="165" width="30" height="25" fill="#F5CBA7" />
          {/* Face */}
          <ellipse cx="200" cy="150" rx="32" ry="37" fill="#FFE4CC" />
          {/* Curly hair */}
          <circle cx="180" cy="125" r="18" fill="#6B3E3E" />
          <circle cx="200" cy="115" r="20" fill="#6B3E3E" />
          <circle cx="220" cy="125" r="18" fill="#6B3E3E" />
          <circle cx="190" cy="120" r="16" fill="#6B3E3E" />
          <circle cx="210" cy="118" r="17" fill="#6B3E3E" />
          {/* Lips */}
          <ellipse cx="200" cy="162" rx="7" ry="4" fill="#E84C9E" />
          {/* Smile */}
          <path d="M 190 158 Q 200 163 210 158" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>

        {/* Woman 3 - Right with decorative headpiece */}
        <motion.g
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Body */}
          <path d="M 260 250 Q 260 185 290 185 L 330 185 Q 360 185 360 250 Z" fill="#6B5CE7" />
          {/* Neck */}
          <rect x="295" y="160" width="30" height="25" fill="#8B6F47" />
          {/* Earring */}
          <ellipse cx="285" cy="155" rx="4" ry="8" fill="#FFD54F" stroke="#E8C547" strokeWidth="1.5" />
          {/* Face */}
          <ellipse cx="310" cy="145" rx="30" ry="35" fill="#A67C52" />
          {/* Headwrap with pattern */}
          <path d="M 280 130 Q 280 105 310 105 Q 340 105 340 130 L 340 145 Q 340 155 310 158 Q 280 155 280 145 Z" fill="#E8F48C" />
          <path d="M 285 115 Q 295 108 305 115 Q 315 108 325 115 Q 335 108 340 115" 
                stroke="#D4E157" strokeWidth="1.5" fill="none" />
          <ellipse cx="295" cy="115" rx="12" ry="18" fill="#E84C9E" />
          <ellipse cx="325" cy="115" rx="12" ry="18" fill="#FFD54F" />
          {/* Lips */}
          <ellipse cx="310" cy="157" rx="8" ry="4" fill="#7B3F3F" />
          {/* Smile */}
          <path d="M 300 153 Q 310 158 320 153" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>

        {/* Floating decorative elements */}
        <motion.circle
          cx="30"
          cy="80"
          r="8"
          fill="#E84C9E"
          opacity="0.6"
          animate={{ y: [0, -10, 0], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.circle
          cx="370"
          cy="100"
          r="6"
          fill="#7DD3E8"
          opacity="0.6"
          animate={{ y: [0, -15, 0], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
        <motion.circle
          cx="200"
          cy="40"
          r="5"
          fill="#FFD54F"
          opacity="0.7"
          animate={{ y: [0, -12, 0], opacity: [0.7, 0.9, 0.7] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        />
        
        {/* Abstract shapes */}
        <motion.path
          d="M 350 50 Q 360 60 350 70 Q 340 60 350 50"
          fill="#8B7CE7"
          opacity="0.4"
          animate={{ rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "350px 60px" }}
        />
      </svg>
    </div>
  );
}

export function FloatingShapes() {
  const shapes = [
    { color: "#E84C9E", size: 60, duration: 20, delay: 0, x: "10%", startY: "110%" },
    { color: "#7DD3E8", size: 80, duration: 25, delay: 3, x: "80%", startY: "110%" },
    { color: "#8B7CE7", size: 70, duration: 22, delay: 6, x: "30%", startY: "110%" },
    { color: "#FFD54F", size: 50, duration: 18, delay: 9, x: "70%", startY: "110%" },
    { color: "#E8F48C", size: 65, duration: 23, delay: 12, x: "50%", startY: "110%" },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full opacity-20 blur-2xl"
          style={{
            width: shape.size,
            height: shape.size,
            backgroundColor: shape.color,
            left: shape.x,
          }}
          animate={{
            y: [shape.startY, "-20%"],
            x: ["0%", index % 2 === 0 ? "20%" : "-20%", "0%"],
            scale: [1, 1.2, 1],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

