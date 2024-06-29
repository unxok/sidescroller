import "./App.css";
import { PhysicsArticle } from "@/components/PhysicsArticle";
import { Sidescroller } from "@/components/Sidescroller";
import { buttonVariants } from "@/components/ui/button";
import { HTMLAttributes, ReactNode } from "react";
import { Sandbox } from "./components/Sandbox";
import { SandboxV2 } from "./components/SandboxV2";
export const CANVAS_WIDTH = 450;
export const CANVAS_HEIGHT = 450;

const BASE_PATHNAME = "/sidescroller";
const routes = {
  "/": <Home />,
  "/A_Dive_into_2D_game_physics": <PhysicsArticle />,
  "/game": <Sidescroller />,
  "/sandbox": <Sandbox />,
  "/sandboxV2": <SandboxV2 />,
};

const App = () => {
  // dumb router for now

  return (
    <main className="dark fixed inset-0 flex flex-col items-center justify-start overflow-y-auto">
      <header className="flex w-full items-center justify-start gap-4 bg-secondary p-5">
        <span>unxok.com</span>
        <Link href={"/"} className={buttonVariants({ variant: "link" })}>
          Home
        </Link>
        <Link
          href={"/A_Dive_into_2D_game_physics"}
          className={buttonVariants({ variant: "link" })}
        >
          Article
        </Link>
        <Link href={"/game"} className={buttonVariants({ variant: "link" })}>
          Game
        </Link>
        <Link href={"/sandbox"} className={buttonVariants({ variant: "link" })}>
          Sandbox
        </Link>
        <Link
          href={"/sandboxV2"}
          className={buttonVariants({ variant: "link" })}
        >
          Sandbox V2
        </Link>
      </header>
      <br />
      <Outlet routes={routes} />
      {/* <Home /> */}
      {/* <PhysicsArticle /> */}
      {/* <Sidescroller /> */}
    </main>
  );
};

export default App;

function Home() {
  //
  return (
    <div>
      <div>Welcome home!</div>
    </div>
  );
}

const createRouter = (
  routes: Record<string, JSX.Element>,
  basePathname?: string,
) => {
  type RoutePath = keyof typeof routes;
  type Router = {
    currentRoute: RoutePath | "/" | "/404";
    push: (route: RoutePath) => void;
  };
  const router: Router = {
    currentRoute: "/",
    push: (route) => {
      const isValid = Object.keys(routes).includes(route);
      const r = isValid ? route : "/404";
      history.pushState({}, "", basePathname ?? "" + r);
      return { ...router, currentRoute: r };
    },
  };

  return router;
};

// const router = createRouter(routes, BASE_PATHNAME)

type RoutePath = keyof typeof routes;

const Outlet = ({ routes }: { routes: Record<string, JSX.Element> }) => {
  const pathname = window.location.pathname;
  const route = pathname.replace(BASE_PATHNAME, "");
  const currentRoute = Object.keys(routes).includes(route) ? route : "/404";

  history.pushState({}, "", BASE_PATHNAME + currentRoute);

  return routes[currentRoute];
};

const Link = ({
  href,
  children,
  onClick,
  ...props
}: Omit<HTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  href: RoutePath;
}) => {
  return (
    <a
      href={BASE_PATHNAME + href}
      // onClick={(e) => {
      //   e.preventDefault();
      //   history.pushState(undefined, "", BASE_PATHNAME + href);
      //   if (onClick) onClick(e);
      // }}
      {...props}
    >
      {children}
    </a>
  );
};
