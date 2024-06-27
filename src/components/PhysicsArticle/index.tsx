import { createContext, useEffect, useRef, useState } from "react";
import { Acceleration } from "./Acceleration";
import { Force } from "./Force";
import { Velocity } from "./Velocity";
import { Position } from "./Position";
export const CANVAS_WIDTH = 450;
export const CANVAS_HEIGHT = 450;
import "@/App.css";

export const ArticleWidthContext = createContext(0);

export const PhysicsArticle = () => {
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
    <ArticleWidthContext.Provider value={articleWidth}>
      <article
        ref={articleRef}
        className="md:prose-md prose-sm max-w-[70ch] px-3 text-start dark:prose-invert lg:prose-lg xl:prose-xl [&_*:not(pre)_code]:rounded-sm [&_*:not(pre)_code]:bg-secondary [&_*:not(pre)_code]:px-1 [&_*:not(pre)_code]:py-[.125rem]"
      >
        <h2 className="tracking-wide] text-3xl font-bold">
          A Dive into 2D game physics
        </h2>
        <p>
          This blog aims to examine implentation details of physics inside a 2D
          javascript game.
        </p>
        <Position />
        <Velocity />
        <Acceleration />
        <Force />
      </article>
    </ArticleWidthContext.Provider>
  );
};
