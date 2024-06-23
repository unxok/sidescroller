import { useEffect } from "react";
import "./App.css";
import {
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  GAME_CANVAS_ID,
} from "./game/constants";
import { game } from "./game";

function App() {
  useEffect(() => {
    game();
  }, []);

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center bg-gray-800 p-2 text-slate-400">
      <h1 className="text-3xl font-bold tracking-wide">sidescroller</h1>
      <canvas
        width={DEFAULT_CANVAS_WIDTH}
        height={DEFAULT_CANVAS_HEIGHT}
        className="rounded-md border bg-slate-300"
        id={GAME_CANVAS_ID}
      ></canvas>
    </main>
  );
}

export default App;
