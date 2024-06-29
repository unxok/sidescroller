import {
  ReactiveGameProps,
  Game,
  Body,
  ReactiveBodyProps,
  BodyProps,
} from "@/components/SandboxV2/classes/Game";
import { ReactNode, useEffect, useRef, useState } from "react";
import { getRandomHexStr, toNumber } from "@/utils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretSortIcon, Cross2Icon, MoveIcon } from "@radix-ui/react-icons";
import { motion, useDragControls } from "framer-motion";

const CANVAS_ID = "sandbox-v2";
const CANVAS_HEIGHT = 450;
const DEFAULT_GRAVITY = 7;

const defaultBodyState: BodyProps = {
  position: { x: 20, y: 20 },
  volume: { w: 50, h: 50 },
  mass: 50,
  velocity: { x: 0, y: 0 },
  acceleration: { x: 0, y: 0 },
  immovable: false,
  fill: "#1ce91f",
  canvasId: CANVAS_ID,
};

export const SandboxV2 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<ReactiveGameProps>({
    gravity: DEFAULT_GRAVITY,
  });
  const [bodiesState, setBodiesState] = useState<ReactiveBodyProps[]>();
  const [clickedBodies, setClickedBodies] = useState<number[]>();
  const updateGameState = (
    key: keyof ReactiveGameProps,
    value: ReactiveGameProps[keyof ReactiveGameProps],
  ) => {
    setGameState((prev) => ({ ...prev, [key]: value }));
  };
  const gameRef = useRef(
    new Game(
      {
        canvasId: CANVAS_ID,
        gravity: DEFAULT_GRAVITY,
        height: CANVAS_HEIGHT,
        width: 900,
      },
      updateGameState,
      //   eventTargetRef.current,
    ),
  );

  const animate = () => {
    if (!gameRef.current) return;
    gameRef.current.animate();
    requestAnimationFrame(animate);
  };

  //   useEffect(() => {
  //     const dispatch = (e: Event) => {
  //       const { detail } = e as CustomEvent;
  //       if (!detail) return;
  //       const { key, value } =
  //         (detail as typeof gameRef.current.DispatchDetail) ?? {};
  //       if (!key || value === null || value === undefined) return;
  //       updateGameState(key, value);
  //     };
  //     eventTargetRef.current.removeEventListener("dispatch", dispatch);
  //     eventTargetRef.current.addEventListener("dispatch", dispatch);
  //     animate();
  //     return () => {
  //       eventTargetRef.current.removeEventListener("dispatch", dispatch);
  //     };
  //   }, []);

  useEffect(() => animate(), []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    if (!gameRef) return;
    console.log("canvas ref called");

    const parent = el.parentElement;
    if (!parent) {
      throw new Error("No parent of canvas found");
    }
    const { clientWidth } = parent;
    el.setAttribute("width", clientWidth.toString());
    gameRef.current.setWidth(clientWidth);
    gameRef.current.initCtx();
  }, []);

  return (
    <div className="w-[90vw]">
      <h1 className="text-4xl font-bold tracking-wide">Sandbox V2</h1>
      <br />
      <canvas
        id={CANVAS_ID}
        className="border"
        height={CANVAS_HEIGHT}
        ref={canvasRef}
        onMouseDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          console.log("clicked: ", x, ",", y);
          if (!gameRef.current.bodies) return;
          const f = gameRef.current.bodies?.findIndex((b) => {
            const { left, right, top, bottom } = b.getBounds();
            return left <= x && right >= x && top <= y && bottom >= y;
          });
          if (f === -1) {
            return console.log("nothing found");
          }
          setClickedBodies((prev) => {
            if (!prev) return [f];
            return [...prev, f];
          });
        }}
      ></canvas>
      <GameControls gameState={gameState} gameRef={gameRef} />
      <Button
        onClick={() => {
          const i = bodiesState?.length ?? 0;
          const defaultState = {
            ...defaultBodyState,
            fill: "#" + getRandomHexStr(6),
          };
          setBodiesState((prev) => [...(prev ?? []), { ...defaultState }]);
          const body = new Body(
            defaultState,
            (
              key: keyof ReactiveBodyProps,
              value: ReactiveBodyProps[keyof ReactiveBodyProps],
            ) => {
              setBodiesState((prev) => {
                if (!prev) {
                  return [{ ...defaultState, [key]: value }];
                }
                const copy = [...prev];
                // @ts-ignore TODO not really sure why this is happening
                copy[i][key] = value;
                return [...copy];
              });
            },
          );
          body.ctx = body.initCtx();
          gameRef.current.addBody(body);
        }}
      >
        add body
      </Button>
      {bodiesState?.map((b, i) => (
        <BodyControls
          key={`body-control-` + i}
          bodyState={b}
          index={i}
          gameRef={gameRef}
          destroyBody={() => {
            const { bodies } = gameRef.current;
            if (!bodies)
              throw new Error("tried updating bodies when none exist in game");
            const newBodies = bodies.filter((_, j) => j !== i);
            gameRef.current.setBodies(newBodies);
            setBodiesState((prev) => {
              if (!prev) return;
              return prev.filter((_, j2) => j2 !== i);
            });
            setClickedBodies((prev) => {
              if (!prev) return;
              return prev.filter((index) => index !== i);
            });
          }}
        />
      ))}
      {clickedBodies?.length &&
        bodiesState &&
        [...new Set(clickedBodies)].map((index, i) => (
          <DragCard
            key={"draggable-body-controls-" + index}
            onClose={() =>
              setClickedBodies((prev) =>
                prev
                  ? prev.filter((num) => num !== clickedBodies[i])
                  : undefined,
              )
            }
          >
            <BodyControls
              bodyState={bodiesState[index]}
              index={index}
              gameRef={gameRef}
              destroyBody={() => {
                const { bodies } = gameRef.current;
                if (!bodies)
                  throw new Error(
                    "tried updating bodies when none exist in game",
                  );
                const newBodies = bodies.filter((_, j) => j !== index);
                gameRef.current.setBodies(newBodies);
                setBodiesState((prev) => {
                  if (!prev) return;
                  return prev.filter((_, j) => j !== index);
                });
                setClickedBodies((prev) => {
                  if (!prev) return;
                  return prev.filter((index2) => index2 !== index);
                });
              }}
            />
          </DragCard>
        ))}
    </div>
  );
};

const DragCard = ({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) => {
  const dragControls = useDragControls();

  const startDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragControls.start(e, { snapToCursor: false });
  };

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 rounded-md border bg-background px-10"
    >
      <div className="absolute right-0 top-0 flex w-full items-center justify-between">
        <Button variant={"ghost"} onPointerDown={startDrag}>
          <MoveIcon />
        </Button>
        <Button variant={"ghost"} onClick={onClose}>
          <Cross2Icon />
        </Button>
      </div>
      {children}
    </motion.div>
  );
};

const GameControls = ({
  gameState,
  gameRef,
}: {
  gameState: ReactiveGameProps;
  gameRef: React.MutableRefObject<Game>;
}) => {
  //
  return (
    <div className="flex flex-col gap-4 py-10">
      <div>
        <h3 className="text-xl font-bold tracking-wide">Game controls</h3>
        <p className="text-muted-foreground">These affect the game as whole</p>
      </div>
      <div className="flex items-center gap-2 py-2">
        <Label htmlFor="gravity-slider">Gravity</Label>
        <span className="text-muted-foreground">-20</span>
        <Slider
          name="gravity-slider"
          id="gravity-slider"
          thumbLabel
          min={-20}
          max={20}
          // step={1}
          value={[gameState.gravity]}
          onValueChange={(arr) => {
            gameRef.current.setGravity(toNumber(arr[0]));
          }}
        />
        <span className="text-muted-foreground">20</span>
      </div>
    </div>
  );
};

const BodyControls = ({
  bodyState,
  index,
  gameRef,
  destroyBody,
}: {
  bodyState: ReactiveBodyProps;
  index: number;
  gameRef: React.MutableRefObject<Game>;
  destroyBody: () => void;
}) => {
  //
  return (
    <Collapsible defaultOpen className="flex flex-col gap-4 py-10">
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold tracking-wide">
            Body {index} controls
          </h3>
          <CollapsibleTrigger className={buttonVariants({ variant: "ghost" })}>
            <CaretSortIcon />
          </CollapsibleTrigger>
        </div>
        <p className="text-muted-foreground">
          Change settings for a specific body
        </p>
      </div>
      <CollapsibleContent>
        <div className="flex items-center gap-2 py-3">
          <Label htmlFor={`fill-color-picker-` + index}>Color</Label>
          <Input
            type={"color"}
            value={bodyState.fill}
            onChange={(e) => {
              const { bodies } = gameRef.current;
              if (!bodies)
                throw new Error(
                  "tried updating bodies when none exist in game",
                );
              bodies[index].setFill(e.target.value);
            }}
            className="w-14"
          />
          <Button
            variant={"outline"}
            onClick={() => {
              const { bodies } = gameRef.current;
              if (!bodies)
                throw new Error(
                  "tried updating bodies when none exist in game",
                );
              bodies[index].setFill("#" + getRandomHexStr(6));
            }}
          >
            randomize
          </Button>
        </div>
        <div className="flex items-center gap-2 py-2">
          <Label
            htmlFor={`x-position-slider-` + index}
            className="whitespace-nowrap"
          >
            Position X
          </Label>
          <span className="text-muted-foreground">0</span>
          <Slider
            name={`x-position-slider-` + index}
            id={`x-position-slider-` + index}
            thumbLabel
            min={0}
            max={gameRef.current.getWidth() - bodyState.volume.w}
            step={1}
            value={[bodyState.position.x]}
            onValueChange={(arr) => {
              const { bodies } = gameRef.current;
              if (!bodies)
                throw new Error(
                  "tried updating bodies when none exist in game",
                );
              bodies[index].updatePosition((prev) => ({
                x: toNumber(arr[0]),
                y: prev.y,
              }));
            }}
          />
          <span className="text-muted-foreground">
            {gameRef.current.getWidth() - bodyState.volume.w}
          </span>
        </div>
        <div className="flex items-center gap-2 py-2">
          <Label
            htmlFor={`y-position-slider-` + index}
            className="whitespace-nowrap"
          >
            Position Y
          </Label>
          <span className="text-muted-foreground">0</span>
          <Slider
            name={`y-position-slider-` + index}
            id={`y-position-slider-` + index}
            thumbLabel
            min={0}
            max={CANVAS_HEIGHT - bodyState.volume.h}
            step={1}
            value={[bodyState.position.y]}
            onValueChange={(arr) => {
              const { bodies } = gameRef.current;
              if (!bodies)
                throw new Error(
                  "tried updating bodies when none exist in game",
                );
              bodies[index].updatePosition((prev) => ({
                x: prev.x,
                y: toNumber(arr[0]),
              }));
            }}
          />
          <span className="text-muted-foreground">
            {CANVAS_HEIGHT - bodyState.volume.h}
          </span>
        </div>
        <Button variant={"destructive"} onClick={destroyBody}>
          destroy
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
};
