import { motion } from "framer-motion";

// Hiển thị 1 dòng so sánh: nhãn, giá trị lý thuyết, giá trị mẫu thực tế (nếu có)
function StatRow({ label, formula, theoretical, sample, unit = "" }) {
  return (
    <div className="flex flex-col gap-1 py-2.5 border-b border-white/10 last:border-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-white font-semibold text-sm">{label}</span>
        {formula && <span className="text-purple-400 text-xs font-mono">{formula}</span>}
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-purple-300">
          Lý thuyết: <span className="text-white font-bold">{theoretical}{unit}</span>
        </span>
        {sample !== undefined && (
          <span className="text-purple-300">
            Thực tế: <span style={{ color: "#FFD700" }} className="font-bold">{sample}{unit}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * TheoryPanel — giải thích Kỳ vọng (Expected Value) và Phương sai (Variance)
 *
 * props:
 *  - title: tiêu đề panel
 *  - description: đoạn giải thích ngắn (Vietnamese, theo ngữ cảnh game)
 *  - rows: mảng [{ label, formula, theoretical, sample, unit }]
 */
export default function TheoryPanel({ title, description, rows }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl p-5 mt-4"
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <h3 className="text-white font-bold text-lg mb-1">📐 {title}</h3>
      {description && <p className="text-purple-400 text-xs mb-4 leading-relaxed">{description}</p>}
      <div>
        {rows.map((row, i) => (
          <StatRow key={i} {...row} />
        ))}
      </div>
    </motion.div>
  );
}