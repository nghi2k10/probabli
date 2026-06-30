import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dice3D from "@/components/Dice3D";
import StatsBar from "@/components/StatsBar";
import QuickSimButtons from "@/components/QuickSimButtons";
import SumDistributionChart from "@/components/SumDistributionChart";
import TheoryPanel from "@/components/TheoryPanel";
import { loadJSON, saveJSON } from "@/lib/storage";
import confetti from "canvas-confetti";

const DICE_LABELS = ["1", "2", "3", "4", "5", "6"];
const STORAGE_KEY_PREFIX = "probabli_dice_";
const STORAGE_KEY_COUNT = "probabli_dice_count";

// Mỗi số lượng xúc xắc (1, 2, 3) có dữ liệu lịch sử riêng vì ý nghĩa thống kê khác nhau
function loadDiceData(count) {
  return loadJSON(STORAGE_KEY_PREFIX + count, { history: [], sumHistory: [] });
}

export default function DiceGame() {
  const [diceCount, setDiceCount] = useState(() => Number(loadJSON(STORAGE_KEY_COUNT, 1)) || 1);
  const [results, setResults] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState(() => loadDiceData(diceCount).history);
  const [sumHistory, setSumHistory] = useState(() => loadDiceData(diceCount).sumHistory);

  // Khi đổi số xúc xắc, nạp lại dữ liệu đã lưu riêng cho số lượng đó (không mất dữ liệu cũ)
  useEffect(() => {
    const data = loadDiceData(diceCount);
    setHistory(data.history);
    setSumHistory(data.sumHistory);
    saveJSON(STORAGE_KEY_COUNT, diceCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diceCount]);

  // Lưu history/sumHistory vào localStorage mỗi khi thay đổi
  useEffect(() => {
    saveJSON(STORAGE_KEY_PREFIX + diceCount, { history, sumHistory });
  }, [history, sumHistory, diceCount]);

  const roll = useCallback(() => {
    if (isRolling) return;
    const newResults = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
    setIsRolling(true);
    setResults(null);

    setTimeout(() => {
      setIsRolling(false);
      setResults(newResults);
      // Record each die result into history
      setHistory((prev) => [...newResults.map(String).reverse(), ...prev].slice(0, 100));
      setSumHistory((prev) => [...prev, newResults.reduce((a, b) => a + b, 0)]);

      // Small confetti burst
      confetti({
        particleCount: 35 + diceCount * 15,
        spread: 60,
        origin: { y: 0.55 },
        colors: ["#FFD700", "#FF8C00", "#FF4488", "#44CCFF"],
        scalar: 0.8,
      });
    }, 1200);
  }, [isRolling, diceCount]);

  // Mô phỏng nhanh N lần tung, không có hiệu ứng xoay — minh hoạ Luật số lớn
  const quickSimulate = useCallback(
    (n) => {
      if (isRolling) return;
      const newHistoryEntries = [];
      const newSums = [];
      let lastResults = null;
      for (let i = 0; i < n; i++) {
        const r = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
        newHistoryEntries.push(...r.map(String));
        newSums.push(r.reduce((a, b) => a + b, 0));
        lastResults = r;
      }
      setResults(lastResults);
      setHistory((prev) => [...newHistoryEntries.reverse(), ...prev].slice(0, 100));
      setSumHistory((prev) => [...prev, ...newSums]);

      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#FFD700", "#FF8C00", "#FF4488", "#44CCFF"],
        scalar: 1,
      });
    },
    [isRolling, diceCount]
  );

  const reset = () => {
    setResults(null);
    setHistory([]);
    setSumHistory([]);
    setIsRolling(false);
    saveJSON(STORAGE_KEY_PREFIX + diceCount, { history: [], sumHistory: [] });
  };

  const total = results ? results.reduce((a, b) => a + b, 0) : 0;
  const diceSize = diceCount === 3 ? "small" : "large";

  // --- Tính kỳ vọng (E) và phương sai (Var) ---
  const sampleStats = (arr) => {
    if (arr.length === 0) return { mean: null, variance: null };
    const m = arr.reduce((a, b) => a + b, 0) / arr.length;
    const v = arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
    return { mean: m, variance: v };
  };

  // Lý thuyết cho 1 viên xúc xắc đồng khả năng (1-6): E[X]=3.5, Var(X)=35/12
  const singleDieE = 3.5;
  const singleDieVar = 35 / 12;

  const faceSample = sampleStats(history.map(Number));
  const sumSample = sampleStats(sumHistory);

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
        {/* Dice count selector */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="text-purple-300 text-xs font-bold uppercase tracking-wider mr-1">Số xúc xắc:</span>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => {
                if (isRolling) return;
                setDiceCount(n);
                setResults(null);
              }}
              disabled={isRolling}
              className="w-9 h-9 rounded-xl font-black text-sm transition-all duration-200 disabled:cursor-not-allowed"
              style={
                diceCount === n
                  ? {
                      background: "linear-gradient(135deg, #FF8C00, #FFD700)",
                      color: "#1A1040",
                      boxShadow: "0 4px 14px rgba(255,160,0,0.4)",
                      transform: "scale(1.1)",
                    }
                  : {
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }
              }
            >
              {n}
            </button>
          ))}
        </div>

        {/* Dice 3D */}
        <div className="flex flex-col items-center py-4">
          <div
            className="mb-6 p-6 rounded-3xl"
            style={{
              background: "rgba(0,0,0,0.25)",
              boxShadow: results && !isRolling
                ? "0 0 40px rgba(255,160,0,0.4), inset 0 0 30px rgba(0,0,0,0.3)"
                : "inset 0 0 30px rgba(0,0,0,0.3)",
              transition: "box-shadow 0.5s ease",
            }}
          >
            <div className={`flex items-center justify-center gap-3 ${diceCount === 1 ? "" : "scale-90"}`}>
              {Array.from({ length: diceCount }).map((_, i) => (
                <Dice3D
                  key={i}
                  result={results ? results[i] : null}
                  isRolling={isRolling}
                />
              ))}
            </div>
          </div>

          {/* Result display */}
          <AnimatePresence>
            {results && !isRolling && (
              <motion.div
                key={results.join("-")}
                initial={{ scale: 0.3, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="text-center mb-4"
              >
                <p className="text-purple-300 text-sm font-semibold uppercase tracking-widest mb-1">Kết quả</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {results.map((r, i) => (
                    <span
                      key={i}
                      className="text-5xl font-black leading-none"
                      style={{
                        background: "linear-gradient(135deg, #FF8C00, #FFD700)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        filter: "drop-shadow(0 0 10px rgba(255,160,0,0.5))",
                      }}
                    >
                      {r}
                    </span>
                  ))}
                </div>
                {diceCount > 1 && (
                  <p className="text-purple-300 text-sm font-bold mt-2">
                    Tổng: <span style={{ color: "#FFD700" }}>{total}</span>
                  </p>
                )}
              </motion.div>
            )}

            {isRolling && (
              <motion.p
                key="rolling"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-purple-300 text-base font-semibold mb-4 animate-pulse"
              >
                🎲 Đang tung...
              </motion.p>
            )}

            {!results && !isRolling && (
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

          {/* Roll button */}
          <motion.button
            onClick={roll}
            disabled={isRolling}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.04 }}
            className="px-10 py-4 rounded-full text-lg font-black tracking-wide disabled:opacity-60 disabled:cursor-not-allowed select-none"
            style={{
              background: isRolling
                ? "linear-gradient(135deg, #888, #666)"
                : "linear-gradient(135deg, #FF8C00, #FFD700)",
              color: "#1A1040",
              boxShadow: isRolling ? "none" : "0 6px 30px rgba(255,160,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
              transition: "background 0.3s, box-shadow 0.3s",
            }}
          >
            {isRolling ? "Đang tung..." : `🎲 Tung ${diceCount} Xúc Xắc`}
          </motion.button>

          <QuickSimButtons onSimulate={quickSimulate} disabled={isRolling} />
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
      <StatsBar history={history} labels={DICE_LABELS} title="Xúc Xắc" />

      {/* Phân phối tổng — chỉ có ý nghĩa khi tung từ 2 xúc xắc trở lên */}
      {diceCount > 1 && <SumDistributionChart sums={sumHistory} diceCount={diceCount} />}

      {/* Lý thuyết: Kỳ vọng & Phương sai */}
      <TheoryPanel
        title="Kỳ vọng & Phương sai"
        description={
          diceCount === 1
            ? "Với 1 xúc xắc 6 mặt đồng khả năng, mỗi mặt có xác suất 1/6. Kỳ vọng E[X] là giá trị trung bình \"mong đợi\" về lâu dài; phương sai Var(X) đo độ phân tán quanh giá trị đó."
            : `Khi tung ${diceCount} xúc xắc, Tổng (S) là một biến ngẫu nhiên mới. Vì các lần tung độc lập, kỳ vọng cộng dồn: E[S] = ${diceCount} × E[X]. Phương sai cũng cộng dồn: Var(S) = ${diceCount} × Var(X).`
        }
        rows={[
          {
            label: "E[X] — Kỳ vọng 1 viên xúc xắc",
            formula: "(1+2+...+6)/6",
            theoretical: singleDieE.toFixed(2),
            sample: faceSample.mean !== null ? faceSample.mean.toFixed(2) : "—",
          },
          {
            label: "Var(X) — Phương sai 1 viên xúc xắc",
            formula: "E[X²] − E[X]²",
            theoretical: singleDieVar.toFixed(2),
            sample: faceSample.variance !== null ? faceSample.variance.toFixed(2) : "—",
          },
          ...(diceCount > 1
            ? [
                {
                  label: `E[S] — Kỳ vọng Tổng ${diceCount} xúc xắc`,
                  formula: `${diceCount} × 3.5`,
                  theoretical: (singleDieE * diceCount).toFixed(2),
                  sample: sumSample.mean !== null ? sumSample.mean.toFixed(2) : "—",
                },
                {
                  label: `Var(S) — Phương sai Tổng ${diceCount} xúc xắc`,
                  formula: `${diceCount} × 35/12`,
                  theoretical: (singleDieVar * diceCount).toFixed(2),
                  sample: sumSample.variance !== null ? sumSample.variance.toFixed(2) : "—",
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}