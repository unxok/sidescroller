import { createContext, useEffect, useState } from "react";
import "./App.css";
import { Position } from "./components/Position";
import { Velocity } from "./components/Velocity";
export const CANVAS_WIDTH = 450;
export const CANVAS_HEIGHT = 450;

export const ViewportContext = createContext({ width: 0, height: 0 });

function App() {
  const [viewport, setViewport] = useState({
    width: window.screen.width,
    height: window.screen.height,
  });

  const updateViewport = () => {
    const width = window.screen.width;
    const height = window.screen.height;
    setViewport({ width, height });
  };

  useEffect(() => {
    window.addEventListener("resize", updateViewport);
    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  return (
    <main className="dark fixed inset-0 flex flex-col items-center justify-start overflow-y-auto">
      <header className="flex w-full max-w-[100vw] items-center justify-start bg-secondary p-5">
        unxok.com
      </header>
      <br />
      <ViewportContext.Provider value={viewport}>
        <article className="md:prose-md prose-sm max-w-[90vw] text-start dark:prose-invert lg:prose-lg xl:prose-xl [&_code]:rounded-sm [&_code]:bg-secondary [&_code]:px-1 [&_code]:py-[.125rem]">
          <h2 className="tracking-wide] text-3xl font-bold">
            A Dive into 2D game physics
          </h2>
          <p>
            This blog aims to examine implentation details of physics inside a
            2D javascript game.
          </p>
          <Position />
          <Velocity />
        </article>
      </ViewportContext.Provider>
      {/* <Sidescroller /> */}
    </main>
  );
}

export default App;
