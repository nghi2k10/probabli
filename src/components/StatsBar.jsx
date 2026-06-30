import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from "recharts";

const COLORS = ["#FF8C00", "#FFD700", "#FF4488", "#44CCFF", "#44FF88", "#CC44FF"];

export default function StatsBar({ history, labels, title }) {
  const total = history.length;

  const counts = {};
  labels.forEach((l) => (counts[l] = 0));
  history.forEach((h) => {
    counts[h] = (counts[h] || 0) + 1;
  });

  // Xác suất lý thuyết (giả định đồng khả năng): mỗi mặt = 100 / số mặt
  const theoreticalPct = 100 / labels.length;

  const chartData = labels.map((label, i) => ({
    name: label,
    count: counts[label] || 0,
    pct: total > 0 ? (((counts[label] || 0) / total) * 100).toFixed(1) : "0.0",
    color: COLORS[i % COLORS.length],
  }));

  // Để vẽ đường lý thuyết trên cùng trục với count, quy đổi % lý thuyết sang số lượng kỳ vọng
  const expectedCount = total > 0 ? (theoreticalPct / 100) * total : 0;

  const recent = [...history].reverse().slice(0, 20);

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">📊 Thống kê</h3>
        <span className="text-purple-300 text-sm font-medium">{total} kết quả</span>
      </div>

      {total === 0 ? (
        <p className="text-center text-purple-400 py-6 text-sm">Hãy tung để xem thống kê!</p>
      ) : (
        <>
          {/* Bar chart */}
          <div className="mb-5" style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#1A1040", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "#fff" }}
                  formatter={(value, name, props) => [`${value} lần (${props.payload.pct}%)`, "Kết quả"]}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
                <ReferenceLine
                  y={expectedCount}
                  stroke="#FFFFFF"
                  strokeDasharray="5 4"
                  strokeWidth={1.5}
                  strokeOpacity={0.85}
                >
                  <Label
                    value={`Lý thuyết: ${theoreticalPct.toFixed(1)}%`}
                    position="insideTopRight"
                    fill="rgba(255,255,255,0.85)"
                    fontSize={11}
                    fontWeight={700}
                  />
                </ReferenceLine>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-purple-400 text-xs mb-4 -mt-2">
            Đường nét đứt = xác suất lý thuyết ({theoreticalPct.toFixed(1)}% mỗi mục). Tung càng nhiều lần, cột thực tế sẽ càng gần đường này — đó là <span className="text-purple-200 font-semibold">Luật số lớn</span>.
          </p>

          {/* Percentage pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {chartData.map((d, i) => {
              const diff = (parseFloat(d.pct) - theoreticalPct).toFixed(1);
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                  style={{ background: `${d.color}22`, border: `1px solid ${d.color}55`, color: d.color }}
                >
                  <span>{d.name}</span>
                  <span className="text-white opacity-80">— {d.pct}%</span>
                  <span className="text-white opacity-50 text-xs font-normal">
                    ({diff > 0 ? "+" : ""}{diff})
                  </span>
                </div>
              );
            })}
          </div>

          {/* History chips */}
          <div>
            <p className="text-purple-300 text-xs font-semibold mb-2 uppercase tracking-wider">Lịch sử gần nhất</p>
            <div className="flex flex-wrap gap-1.5">
              {recent.map((val, i) => {
                const idx = labels.indexOf(String(val));
                const color = COLORS[idx % COLORS.length];
                return (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black"
                    style={{
                      background: `${color}33`,
                      border: `1.5px solid ${color}`,
                      color,
                      fontSize: "11px",
                    }}
                  >
                    {val}
                  </motion.span>
                );
              })}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}