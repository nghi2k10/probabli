import "./coin3d.css";

export default function Coin3D({ result, isFlipping }) {
  return (
    <div className="coin-scene">
      <div className={`coin ${isFlipping ? "coin-flipping" : ""} ${!isFlipping && result ? `coin-show-${result}` : ""}`}>
        {/* Heads */}
        <div className="coin-face coin-heads">
          <div className="coin-inner">
            <div className="coin-symbol">☀️</div>
            <div className="coin-text">NGỬA</div>
          </div>
        </div>
        {/* Tails */}
        <div className="coin-face coin-tails">
          <div className="coin-inner">
            <div className="coin-symbol">🌙</div>
            <div className="coin-text">SẤP</div>
          </div>
        </div>
      </div>
    </div>
  );
}