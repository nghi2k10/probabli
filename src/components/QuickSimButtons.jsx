export default function QuickSimButtons({ onSimulate, disabled }) {
  const options = [10, 100, 1000];
  return (
    <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
      <span className="text-purple-300 text-xs font-bold uppercase tracking-wider mr-1">
        Mô phỏng nhanh:
      </span>
      {options.map((n) => (
        <button
          key={n}
          onClick={() => onSimulate(n)}
          disabled={disabled}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          ⚡ {n.toLocaleString("vi-VN")} lần
        </button>
      ))}
    </div>
  );
}
