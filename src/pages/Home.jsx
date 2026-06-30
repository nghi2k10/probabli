import { useState } from "react";
import DiceGame from "@/components/DiceGame";
import CoinGame from "@/components/CoinGame";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dice");

  return (
    <div className="min-h-screen w-full" style={{ background: "linear-gradient(135deg, #1A1040 0%, #0D2060 50%, #1A1040 100%)" }}>
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              opacity: Math.random() * 0.6 + 0.1,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite alternate`,
              animationDelay: Math.random() * 3 + "s",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
            🎲 N9h1 Lucky Toss
          </h1>
          <p className="text-purple-300 text-sm md:text-base font-medium">Thử vận may của bạn!</p>
        </motion.div>

        {/* Tab switcher */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-3 mb-8 p-1.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {[
            { id: "dice", label: "🎲 Xúc Xắc" },
            { id: "coin", label: "🪙 Đồng Xu" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 relative overflow-hidden"
              style={
                activeTab === tab.id
                  ? {
                      background: "linear-gradient(135deg, #FF8C00, #FFD700)",
                      color: "#1A1040",
                      boxShadow: "0 4px 20px rgba(255,160,0,0.5)",
                    }
                  : {
                      background: "transparent",
                      color: "rgba(255,255,255,0.6)",
                    }
              }
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Game area */}
        <AnimatePresence mode="wait">
          {activeTab === "dice" ? (
            <motion.div
              key="dice"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.35 }}
            >
              <DiceGame />
            </motion.div>
          ) : (
            <motion.div
              key="coin"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            >
              <CoinGame />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes twinkle {
          from { opacity: 0.1; transform: scale(1); }
          to { opacity: 0.8; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}