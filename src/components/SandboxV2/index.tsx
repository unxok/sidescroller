import {
  ReactiveGameProps,
  Game,
  Body,
  ReactiveBodyProps,
  BodyProps,
} from "@/components/SandboxV2/classes/Game";
import { ReactNode, useEffect, useRef, useState } from "react";
import { XY, getRandomHexStr, toNumber } from "@/utils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CaretSortIcon,
  Cross2Icon,
  HeightIcon,
  MoveIcon,
  WidthIcon,
} from "@radix-ui/react-icons";
import { motion, useDragControls } from "framer-motion";

const CANVAS_ID = "sandbox-v2";
const CANVAS_HEIGHT = 450;
const DEFAULT_GRAVITY = 7;
const DEFAULT_BOUNCE_DAMPENING = 0.5;

const defaultBodyState: BodyProps = {
  position: { x: 20, y: 20 },
  volume: { w: 50, h: 50 },
  mass: 50,
  velocity: { x: 0, y: 0 },
  acceleration: { x: 0, y: 0 },
  immovable: false,
  fill: "#1ce91f",
  canvasId: CANVAS_ID,
  uid: -1,
};

export const SandboxV2 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<ReactiveGameProps>({
    gravity: DEFAULT_GRAVITY,
    bounceDampening: DEFAULT_BOUNCE_DAMPENING,
  });
  const [bodiesState, setBodiesState] =
    useState<(ReactiveBodyProps & { clicked: boolean; uid: number })[]>();
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
        bounceDampening: DEFAULT_BOUNCE_DAMPENING,
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

  const createBody = (position: XY) => {
    const i = bodiesState?.length ?? 0;
    // const uid = gameRef.current.generateBodyUID();
    const defaultState = {
      ...defaultBodyState,
      position: position,
      fill: "#" + getRandomHexStr(6),
      clicked: false,
      // uid: uid,
      uid: i,
    };
    setBodiesState((prev) => [...(prev ?? []), { ...defaultState }]);
    const body = new Body(
      defaultState,
      (
        key: keyof ReactiveBodyProps,
        value: ReactiveBodyProps[keyof ReactiveBodyProps],
        uid: number,
      ) => {
        setBodiesState((prev) => {
          if (!prev) {
            return [{ ...defaultState, [key]: value }];
          }
          const copy = [...prev];
          // @ts-ignore TODO idk why typescript is mad
          copy[uid][key] = value;
          return copy;
        });
      },
    );
    body.ctx = body.initCtx();
    gameRef.current.addBody(body);
  };

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

  // useEffect(() => {
  //   console.log("bodiesState: ", bodiesState);
  // }, [bodiesState]);

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
          if (!gameRef.current.bodies || !bodiesState) {
            createBody({ x, y });
            return;
          }
          const f = gameRef.current.bodies.findIndex((b, i) => {
            const { left, right, top, bottom } = b.getBounds();
            return (
              left <= x &&
              right >= x &&
              top <= y &&
              bottom >= y &&
              !bodiesState[i].clicked
            );
          });
          if (f === -1 || bodiesState?.[f]?.clicked) {
            console.log("nothing found or already clicked");
            createBody({ x, y });
            return;
          }

          gameRef.current.bodies[f].reactive = true;
          setBodiesState((prev) => {
            if (!prev) throw new Error("this should be impossible");
            const copy = [...prev];
            copy[f].clicked = true;
            return copy;
          });
        }}
      ></canvas>
      <p className="text-muted-foreground">
        Click anywhere within the game canvas to add a body
      </p>
      <p className="text-muted-foreground">
        Click a body to access its properties
      </p>
      <GameControls gameState={gameState} gameRef={gameRef} />
      {!!bodiesState?.length &&
        bodiesState.map(
          (b, i) =>
            b.clicked && (
              <DragCard
                key={"draggable-body-controls-" + i}
                onClose={() => {
                  if (!gameRef.current.bodies) {
                    throw new Error(
                      "Drag card on close error. No bodies exist",
                    );
                  }
                  gameRef.current.bodies[i].reactive = false;
                  setBodiesState((prev) => {
                    if (!prev) return;
                    const copy = [...prev];
                    copy[i].clicked = false;
                    return copy;
                  });
                }}
              >
                <BodyControls
                  bodyState={b}
                  gameRef={gameRef}
                  destroyBody={() => {
                    const { bodies } = gameRef.current;
                    if (!bodies)
                      throw new Error(
                        "tried updating bodies when none exist in game",
                      );
                    const newBodies = bodies
                      .filter((_, j) => j !== i)
                      .map((b, j2) => {
                        b.setUID(j2);
                        return b;
                      });
                    gameRef.current.setBodies(newBodies);
                    setBodiesState((prev) => {
                      if (!prev) return;
                      const filtered = prev.filter((_, j) => j !== i);
                      const arr = filtered.map((pb, j) => {
                        pb.uid = newBodies[j].getUID();
                        return pb;
                      });
                      console.log("prev: ", prev);
                      console.log("arr: ", arr);
                      return arr;
                    });
                  }}
                />
              </DragCard>
            ),
        )}
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

  const ref = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragControls.start(e, { snapToCursor: false });
  };

  return (
    <motion.div
      ref={ref}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 overflow-hidden rounded-md border bg-background px-10"
    >
      <div className="absolute right-0 top-0 flex w-full items-center justify-between">
        <Button
          variant={"ghost"}
          className="rounded-bl-none rounded-tr-none"
          onPointerDown={startDrag}
        >
          <MoveIcon />
        </Button>
        <Button
          variant={"ghost"}
          className="rounded-br-none rounded-tl-none"
          onClick={onClose}
        >
          <Cross2Icon />
        </Button>
      </div>
      <div className="absolute bottom-0 right-0 flex w-full items-center justify-between">
        <motion.div
          drag={"x"}
          dragElastic={false}
          // dragMomentum={false}
          dragConstraints={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
          dragSnapToOrigin
          onDrag={(_, info) => {
            if (!ref.current) return;
            const w = ref.current.getBoundingClientRect().width;
            const adjusted = w - info.delta.x;
            ref.current.style.width = adjusted < 50 ? "50px" : adjusted + "px";
          }}
        >
          <Button variant={"ghost"} className="rounded-bl-none rounded-tr-none">
            <WidthIcon />
          </Button>
        </motion.div>
        <motion.div
          drag={"x"}
          dragElastic={false}
          // dragMomentum={false}
          dragConstraints={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
          dragSnapToOrigin
          onDrag={(_, info) => {
            if (!ref.current) return;
            const h = ref.current.getBoundingClientRect().height;
            const adjusted = h + info.delta.y;
            ref.current.style.height = adjusted < 50 ? "50px" : adjusted + "px";
          }}
        >
          <Button variant={"ghost"} className="rounded-bl-none rounded-tr-none">
            <HeightIcon />
          </Button>
        </motion.div>
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
      <div className="flex items-center gap-2 py-2">
        <Label htmlFor="bounce-dampening-slider" className="whitespace-nowrap">
          Bounce dampening
        </Label>
        <span className="text-muted-foreground">0</span>
        <Slider
          name="bounce-dampening-slider"
          id="bounce-dampening-slider"
          thumbLabel
          min={0}
          max={1}
          step={0.1}
          value={[gameState.bounceDampening]}
          onValueChange={(arr) => {
            gameRef.current.setBounceDampening(toNumber(arr[0]));
          }}
        />
        <span className="text-muted-foreground">1</span>
      </div>
    </div>
  );
};

const BodyControls = ({
  bodyState,
  gameRef,
  destroyBody,
}: {
  bodyState: ReactiveBodyProps;
  gameRef: React.MutableRefObject<Game>;
  destroyBody: () => void;
}) => {
  const { uid } = bodyState;

  return (
    <Collapsible defaultOpen className="flex flex-col gap-4 py-10">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold tracking-wide">Body controls</h3>
          <CollapsibleTrigger>
            <CaretSortIcon />
          </CollapsibleTrigger>
        </div>
        <p className="text-muted-foreground">uid: {bodyState.uid}</p>
      </div>
      <CollapsibleContent className="flex flex-col gap-2">
        <hr />
        <Collapsible defaultOpen>
          <div className="flex items-center">
            <h4 className="text-lg font-bold tracking-wide">
              <i>Color</i>
            </h4>
            <CollapsibleTrigger
            // className={buttonVariants({ variant: "ghost" })}
            >
              <CaretSortIcon />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="flex items-center pt-4">
            <Label className="sr-only" htmlFor={`fill-color-picker-` + uid}>
              Color
            </Label>
            <Input
              type={"color"}
              value={bodyState.fill}
              onChange={(e) => {
                const { bodies } = gameRef.current;
                if (!bodies)
                  throw new Error(
                    "tried updating bodies when none exist in game",
                  );
                bodies[uid].setFill(e.target.value);
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
                bodies[bodyState.uid].setFill("#" + getRandomHexStr(6));
              }}
            >
              randomize
            </Button>
          </CollapsibleContent>
        </Collapsible>
        <hr />
        <Collapsible defaultOpen>
          <div className="flex items-center">
            <h4 className="text-lg font-bold tracking-wide">
              <i>Position</i>
            </h4>
            <CollapsibleTrigger
            // className={buttonVariants({ variant: "ghost" })}
            >
              <CaretSortIcon />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="flex flex-col gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Label
                htmlFor={`x-position-slider-` + uid}
                className="whitespace-nowrap"
              >
                X
              </Label>
              <span className="text-muted-foreground">0</span>
              <Slider
                name={`x-position-slider-` + uid}
                id={`x-position-slider-` + uid}
                thumbLabel
                min={0}
                max={gameRef.current.getWidth() - bodyState.volume.w}
                step={1}
                value={[Number(bodyState.position.x.toFixed(2))]}
                onValueChange={(arr) => {
                  const { bodies } = gameRef.current;
                  if (!bodies)
                    throw new Error(
                      "tried updating bodies when none exist in game",
                    );
                  bodies[uid].updatePosition((prev) => ({
                    x: toNumber(arr[0]),
                    y: prev.y,
                  }));
                }}
              />
              <span className="text-muted-foreground">
                {gameRef.current.getWidth() - bodyState.volume.w}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor={`y-position-slider-` + uid}
                className="whitespace-nowrap"
              >
                Y
              </Label>
              <span className="text-muted-foreground">0</span>
              <Slider
                name={`y-position-slider-` + uid}
                id={`y-position-slider-` + uid}
                thumbLabel
                min={0}
                max={CANVAS_HEIGHT - bodyState.volume.h}
                step={1}
                value={[Number(bodyState.position.y.toFixed(2))]}
                onValueChange={(arr) => {
                  const { bodies } = gameRef.current;
                  if (!bodies)
                    throw new Error(
                      "tried updating bodies when none exist in game",
                    );
                  bodies[uid].updatePosition((prev) => ({
                    x: prev.x,
                    y: toNumber(arr[0]),
                  }));
                }}
              />
              <span className="text-muted-foreground">
                {CANVAS_HEIGHT - bodyState.volume.h}
              </span>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <hr />
        <Collapsible defaultOpen>
          <div className="flex items-center">
            <h4 className="text-lg font-bold tracking-wide">
              <i>Velocity</i>
            </h4>
            <CollapsibleTrigger>
              <CaretSortIcon />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="flex flex-col gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Label
                htmlFor={`x-velocity-slider-` + uid}
                className="whitespace-nowrap"
              >
                X
              </Label>
              <span className="text-muted-foreground">-50</span>
              <Slider
                name={`x-velocity-slider-` + uid}
                id={`x-velocity-slider-` + uid}
                thumbLabel
                min={-50}
                max={50}
                step={1}
                value={[Number(bodyState.velocity.x.toFixed(2))]}
                onValueChange={(arr) => {
                  const { bodies } = gameRef.current;
                  if (!bodies)
                    throw new Error(
                      "tried updating bodies when none exist in game",
                    );
                  bodies[uid].updateVelocity((prev) => ({
                    x: toNumber(arr[0]),
                    y: prev.y,
                  }));
                }}
              />
              <span className="text-muted-foreground">50</span>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor={`y-velocity-slider-` + uid}
                className="whitespace-nowrap"
              >
                Y
              </Label>
              <span className="text-muted-foreground">-50</span>
              <Slider
                name={`y-velocity-slider-` + uid}
                id={`y-velocity-slider-` + uid}
                thumbLabel
                min={-50}
                max={50}
                step={1}
                value={[Number(bodyState.velocity.y.toFixed(2))]}
                onValueChange={(arr) => {
                  const { bodies } = gameRef.current;
                  if (!bodies)
                    throw new Error(
                      "tried updating bodies when none exist in game",
                    );
                  bodies[uid].updateVelocity((prev) => ({
                    x: prev.x,
                    y: toNumber(arr[0]),
                  }));
                }}
              />
              <span className="text-muted-foreground">50</span>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible defaultOpen>
          <div className="flex items-center">
            <h4 className="text-lg font-bold tracking-wide">
              <i>Mass</i>
            </h4>
            <CollapsibleTrigger>
              <CaretSortIcon />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="flex flex-col gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Label
                htmlFor={`mass-slider-` + uid}
                className="sr-only whitespace-nowrap"
              >
                Mass slider
              </Label>
              <span className="text-muted-foreground">0</span>
              <Slider
                name={`mass-slider-` + uid}
                id={`mass-slider-` + uid}
                thumbLabel
                min={0}
                max={100}
                step={1}
                value={[bodyState.mass]}
                onValueChange={(arr) => {
                  const { bodies } = gameRef.current;
                  if (!bodies)
                    throw new Error(
                      "tried updating bodies when none exist in game",
                    );
                  bodies[uid].setMass(toNumber(arr[0]));
                }}
              />
              <span className="text-muted-foreground">50</span>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <div className="flex w-full justify-end">
          <Button variant={"destructive"} onClick={destroyBody}>
            destroy
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
