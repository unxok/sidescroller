import { createContext, useEffect, useRef, useState } from "react";
import "./App.css";
import { Position } from "./components/Position";
import { Velocity } from "./components/Velocity";
import { Acceleration } from "./components/Acceleration";
import { Force } from "./components/Force";
export const CANVAS_WIDTH = 450;
export const CANVAS_HEIGHT = 450;

export const ArticleWidthContext = createContext(0);

function App() {
  const [articleWidth, setArticleWidth] = useState(0);
  const articleRef = useRef<HTMLElement>(null);

  const updateArticle = () => {
    if (!articleRef.current) return;
    const { clientWidth } = articleRef.current;
    setArticleWidth(clientWidth);
  };

  useEffect(() => {
    updateArticle();
    window.addEventListener("resize", updateArticle);
    return () => {
      window.removeEventListener("resize", updateArticle);
    };
  }, []);

  return (
    <main className="dark fixed inset-0 flex flex-col items-center justify-start overflow-y-auto">
      <header className="flex w-full items-center justify-start bg-secondary p-5">
        unxok.com
      </header>
      <br />
      <ArticleWidthContext.Provider value={articleWidth}>
        <article
          ref={articleRef}
          className="md:prose-md prose-sm max-w-[70ch] px-3 text-start dark:prose-invert lg:prose-lg xl:prose-xl [&_*:not(pre)_code]:rounded-sm [&_*:not(pre)_code]:bg-secondary [&_*:not(pre)_code]:px-1 [&_*:not(pre)_code]:py-[.125rem]"
        >
          <h2 className="tracking-wide] text-3xl font-bold">
            A Dive into 2D game physics
          </h2>
          <p>
            This blog aims to examine implentation details of physics inside a
            2D javascript game.
          </p>
          <Position />
          <Velocity />
          <Acceleration />
          <Force />
        </article>
      </ArticleWidthContext.Provider>
      {/* <Sidescroller /> */}
    </main>
  );
}

export default App;
