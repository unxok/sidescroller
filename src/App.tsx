import { useState } from "react";
import "./App.css";
import {
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  GAME_CANVAS_ID,
} from "./game/constants";
import { game } from "./game";

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center bg-gray-800 p-2 text-slate-400">
      <h1 className="text-3xl font-bold tracking-wide">sidescroller</h1>
      {!gameStarted && (
        <div className="absolute left-1/2 top-1/2 z-50 flex h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-3 border bg-slate-600">
          <h2 className="text-4xl font-bold tracking-wide">Welcome!</h2>
          <p>
            This is a little sidescroller I made to have fun with figuring out
            how to code physics
          </p>
          <button
            onClick={() => {
              setGameStarted(true);
              setTimeout(() => game(), 0);
            }}
            className="rounded-md bg-blue-700 p-3 text-slate-300"
          >
            Start game
          </button>
        </div>
      )}
      {gameStarted && (
        <canvas
          width={DEFAULT_CANVAS_WIDTH}
          height={DEFAULT_CANVAS_HEIGHT}
          className="rounded-md border bg-slate-300"
          id={GAME_CANVAS_ID}
        ></canvas>
      )}
    </main>
  );
}

export default App;
