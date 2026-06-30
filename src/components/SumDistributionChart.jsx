import { motion } from "framer-motion";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Tính phân phối lý thuyết của Tổng khi tung k xúc xắc 6 mặt bằng phép chập (convolution).
// Trả về object: { sumValue: xácSuất }
function theoreticalSumDistribution(k) {
  let dist = { 0: 1 }; // tổng = 0 với xác suất 1 (chưa tung viên nào)
  for (let die = 0; die < k; die++) {
    const next = {};
    for (const [sumStr, prob] of Object.entries(dist)) {
      const sum = Number(sumStr);
      for (let face = 1; face <= 6; face++) {
        const newSum = sum + face;
        next[newSum] = (next[newSum] || 0) + prob * (1 / 6);
      }
    }
    dist = next;
  }
  return dist;
}

export default function SumDistributionChart({ sums, diceCount }) {
  const total = sums.length;
  const theoretical = theoreticalSumDistribution(diceCount);
  const minSum = diceCount;
  const maxSum = diceCount * 6;

  const actualCounts = {};
  sums.forEach((s) => {
    actualCounts[s] = (actualCounts[s] || 0) + 1;
  });

  const chartData = [];
  for (let s = minSum; s <= maxSum; s++) {
    chartData.push({
      sum: s,
      actualPct: total > 0 ? +(((actualCounts[s] || 0) / total) * 100).toFixed(1) : 0,
      theoreticalPct: +((theoretical[s] || 0) * 100).toFixed(1),
    });
  }

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
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-bold text-lg">🔔 Phân phối Tổng</h3>
        <span className="text-purple-300 text-sm font-medium">{total} lần</span>
      </div>
      <p className="text-purple-400 text-xs mb-4">
        Cột cam = thực tế · Đường trắng = lý thuyết. Tổng có nhiều cách tạo thành (ví dụ 7 với 2 xúc xắc) sẽ xuất hiện thường xuyên hơn — đây là hình dạng "chuông" của phân phối nhị thức.
      </p>

      {total === 0 ? (
        <p className="text-center text-purple-400 py-6 text-sm">Hãy tung để xem phân phối tổng!</p>
      ) : (
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} barSize={diceCount === 2 ? 20 : 14}>
              <XAxis
                dataKey="sum"
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#1A1040", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "#fff" }}
                formatter={(value, name) => [
                  `${value}%`,
                  name === "actualPct" ? "Thực tế" : "Lý thuyết",
                ]}
                labelFormatter={(label) => `Tổng = ${label}`}
              />
              <Bar dataKey="actualPct" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#FF8C00" />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="theoreticalPct"
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 2, fill: "#FFFFFF" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
