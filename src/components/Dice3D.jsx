import { useEffect, useRef } from "react";
import "./dice3d.css";

const diceFaces = {
  1: [[2, 2]],
  2: [[1, 1], [3, 3]],
  3: [[1, 1], [2, 2], [3, 3]],
  4: [[1, 1], [1, 3], [3, 1], [3, 3]],
  5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
  6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]],
};

function DieFace({ dots, faceNumber }) {
  return (
    <div className="die-face" data-face={faceNumber}>
      {dots.map(([row, col], i) => (
        <div
          key={i}
          className="die-dot"
          style={{
            gridRow: row,
            gridColumn: col,
          }}
        />
      ))}
    </div>
  );
}

// Map result to CSS class for rotation
const resultRotations = {
  1: "show-1",
  2: "show-2",
  3: "show-3",
  4: "show-4",
  5: "show-5",
  6: "show-6",
};

export default function Dice3D({ result, isRolling }) {
  return (
    <div className="dice-scene">
      <div className={`dice-cube ${isRolling ? "dice-rolling" : ""} ${!isRolling && result ? resultRotations[result] : ""}`}>
        <DieFace dots={diceFaces[1]} faceNumber={1} />
        <DieFace dots={diceFaces[2]} faceNumber={2} />
        <DieFace dots={diceFaces[3]} faceNumber={3} />
        <DieFace dots={diceFaces[4]} faceNumber={4} />
        <DieFace dots={diceFaces[5]} faceNumber={5} />
        <DieFace dots={diceFaces[6]} faceNumber={6} />
      </div>
    </div>
  );
}