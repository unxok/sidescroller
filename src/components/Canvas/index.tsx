import { CanvasHTMLAttributes, forwardRef } from "react";

export const Canvas = forwardRef<
  HTMLCanvasElement,
  CanvasHTMLAttributes<HTMLCanvasElement>
>(({ id, width, height, className }, ref) => {
  //
  return (
    <div className="">
      <div className="w-full px-2 text-start">
        (0,0)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x→
      </div>
      <div className="flex">
        <span className="h-full w-fit px-2">
          <br />
          y↓
        </span>
        <canvas
          id={id}
          ref={ref}
          width={width}
          height={height}
          className={className}
        ></canvas>
        <span className="h-full">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span>
      </div>
      <div className="w-full px-2 text-end">
        ({width},{height})
      </div>
    </div>
  );
});
