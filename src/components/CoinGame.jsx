import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Coin3D from "@/components/Coin3D";
import StatsBar from "@/components/StatsBar";
import QuickSimButtons from "@/components/QuickSimButtons";
import TheoryPanel from "@/components/TheoryPanel";
import { loadJSON, saveJSON } from "@/lib/storage";
import confetti from "canvas-confetti";

const COIN_LABELS = ["Ngửa", "Sấp"];
const STORAGE_KEY = "probabli_coin_history";

export default function CoinGame() {
  const [result, setResult] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState(() => loadJSON(STORAGE_KEY, []));

  // Lưu history vào localStorage mỗi khi thay đổi, để không mất khi refresh
  useEffect(() => {
    saveJSON(STORAGE_KEY, history);
  }, [history]);

  const flip = useCallback(() => {
    if (isFlipping) return;
    const newResult = Math.random() < 0.5 ? "heads" : "tails";
    const label = newResult === "heads" ? "Ngửa" : "Sấp";
    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      setIsFlipping(false);
      setResult(newResult);
      setHistory((prev) => [label, ...prev].slice(0, 100));

      // Confetti burst
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.55 },
        colors: newResult === "heads"
          ? ["#FFD700", "#FF8C00", "#FFEE44"]
          : ["#C0C0C0", "#A8A8A8", "#E0E0E0", "#8888CC"],
        scalar: 0.9,
      });
    }, 1350);
  }, [isFlipping]);

  const quickSimulate = useCallback(
    (n) => {
      if (isFlipping) return;
      const newEntries = [];
      let last = null;
      for (let i = 0; i < n; i++) {
        const r = Math.random() < 0.5 ? "heads" : "tails";
        newEntries.push(r === "heads" ? "Ngửa" : "Sấp");
        last = r;
      }
      setResult(last);
      setHistory((prev) => [...newEntries.reverse(), ...prev].slice(0, 100));

      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#FFD700", "#FF8C00", "#C0C0C0"],
        scalar: 1,
      });
    },
    [isFlipping]
  );

  const reset = () => {
    setResult(null);
    setHistory([]);
    setIsFlipping(false);
  };

  const displayLabel = result === "heads" ? "Ngửa ☀️" : result === "tails" ? "Sấp 🌙" : null;
  const displayColor = result === "heads"
    ? "linear-gradient(135deg, #FFB800, #FFD700)"
    : "linear-gradient(135deg, #b0b0b0, #e0e0e0)";

  // --- Kỳ vọng & Phương sai (biến Bernoulli: Ngửa = 1, Sấp = 0, p = 0.5) ---
  const p = 0.5;
  const theoreticalE = p; // E[X] = p
  const theoreticalVar = p * (1 - p); // Var(X) = p(1-p)

  const numericHistory = history.map((h) => (h === "Ngửa" ? 1 : 0));
  const sampleE =
    numericHistory.length > 0
      ? numericHistory.reduce((a, b) => a + b, 0) / numericHistory.length
      : null;
  const sampleVar =
    numericHistory.length > 0
      ? numericHistory.reduce((a, b) => a + (b - sampleE) ** 2, 0) / numericHistory.length
      : null;

  return (
    <div>
      {/* Game card */}
      <div
        className="rounded-3xl p-6 mb-1"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 8px 40px rgba(138,43,226,0.2), 0 2px 12px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex flex-col items-center py-4">
          {/* Coin 3D */}
          <div
            className="mb-6 p-8 rounded-full"
            style={{
              background: "rgba(0,0,0,0.25)",
              boxShadow: result && !isFlipping
                ? result === "heads"
                  ? "0 0 40px rgba(255,200,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)"
                  : "0 0 40px rgba(192,192,192,0.4), inset 0 0 30px rgba(0,0,0,0.3)"
                : "inset 0 0 30px rgba(0,0,0,0.3)",
              transition: "box-shadow 0.5s ease",
            }}
          >
            <Coin3D result={result} isFlipping={isFlipping} />
          </div>

          {/* Result display */}
          <AnimatePresence>
            {result && !isFlipping && (
              <motion.div
                key={result}
                initial={{ scale: 0.3, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="text-center mb-4"
              >
                <p className="text-purple-300 text-sm font-semibold uppercase tracking-widest mb-1">Kết quả</p>
                <p
                  className="text-5xl font-black leading-none"
                  style={{
                    background: displayColor,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 10px rgba(255,160,0,0.5))",
                  }}
                >
                  {displayLabel}
                </p>
              </motion.div>
            )}

            {isFlipping && (
              <motion.p
                key="flipping"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-purple-300 text-base font-semibold mb-4 animate-pulse"
              >
                🪙 Đang tung...
              </motion.p>
            )}

            {!result && !isFlipping && (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-purple-400 text-sm mb-4"
              >
                Nhấn tung để bắt đầu!
              </motion.p>
            )}
          </AnimatePresence>

          {/* Flip button */}
          <motion.button
            onClick={flip}
            disabled={isFlipping}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.04 }}
            className="px-10 py-4 rounded-full text-lg font-black tracking-wide disabled:opacity-60 disabled:cursor-not-allowed select-none"
            style={{
              background: isFlipping
                ? "linear-gradient(135deg, #888, #666)"
                : "linear-gradient(135deg, #FF8C00, #FFD700)",
              color: "#1A1040",
              boxShadow: isFlipping ? "none" : "0 6px 30px rgba(255,160,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
              transition: "background 0.3s, box-shadow 0.3s",
            }}
          >
            {isFlipping ? "Đang tung..." : "🪙 Tung Đồng Xu"}
          </motion.button>

          <QuickSimButtons onSimulate={quickSimulate} disabled={isFlipping} />
        </div>
      </div>

      {/* Reset */}
      {history.length > 0 && (
        <div className="flex justify-end mt-2 mb-1 px-1">
          <button
            onClick={reset}
            className="text-xs text-purple-400 hover:text-red-400 transition-colors font-semibold underline underline-offset-2"
          >
            🗑 Reset thống kê
          </button>
        </div>
      )}

      {/* Stats */}
      <StatsBar history={history} labels={COIN_LABELS} title="Đồng Xu" />

      {/* Lý thuyết: Kỳ vọng & Phương sai */}
      <TheoryPanel
        title="Kỳ vọng & Phương sai"
        description='Coi "Ngửa" = 1, "Sấp" = 0, đây là biến ngẫu nhiên Bernoulli với xác suất p = 0,5. Kỳ vọng E[X] = p là tỉ lệ Ngửa trung bình về lâu dài; phương sai Var(X) = p(1−p) đo độ dao động quanh tỉ lệ đó.'
        rows={[
          {
            label: "E[X] — Kỳ vọng (tỉ lệ Ngửa)",
            formula: "p",
            theoretical: theoreticalE.toFixed(2),
            sample: sampleE !== null ? sampleE.toFixed(2) : "—",
          },
          {
            label: "Var(X) — Phương sai",
            formula: "p(1−p)",
            theoretical: theoreticalVar.toFixed(2),
            sample: sampleVar !== null ? sampleVar.toFixed(2) : "—",
          },
        ]}
      />
    </div>
  );
}