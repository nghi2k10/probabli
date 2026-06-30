export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="max-w-md text-center rounded-3xl border border-white/10 bg-slate-900/90 p-10 shadow-xl shadow-slate-900/30">
        <h1 className="text-6xl font-black tracking-tight">404</h1>
        <p className="mt-4 text-lg text-slate-300">Trang bạn tìm không tồn tại.</p>
        <p className="mt-2 text-sm text-slate-400">Vui lòng kiểm tra lại đường dẫn hoặc quay lại trang chủ.</p>
      </div>
    </div>
  );
}
