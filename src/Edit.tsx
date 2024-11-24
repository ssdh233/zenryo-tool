import { Button } from "./components/ui/button";
import { useEffect, useReducer, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";

type ScaleAction = "+0.1" | "+1" | "-0.1" | "-1" | number;
function scaleReducer(x: number, actionOrValue: ScaleAction) {
  switch (actionOrValue) {
    case "+1":
      return x + 1;
    case "+0.1":
      return x + 0.1;
    case "-1":
      return x > 1.01 ? x - 1 : x;
    case "-0.1":
      return x > 0.11 ? x - 0.1 : x;
    default:
      return actionOrValue;
  }
}

function Edit() {
  // START, DOT1, DOT2
  // SELECTING (for copying, deleting)
  // SELECTING_DOT1, SELECTING_DOT2?
  const [state, setState] = useState("START");
  const [dot1, setDot1] = useState<{ x: number; y: number } | null>(null);
  const [dot2, setDot2] = useState<{ x: number; y: number } | null>(null);

  const [blocks, setBlocks] = useState([]);
  const divEl = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useReducer(scaleReducer, 1);

  useEffect(() => {
    window.addEventListener("resize", () => {
      console.log(divEl.current?.getBoundingClientRect().width);
    });
  });

  useEffect(() => {
    const keyBoardEvent = (event: KeyboardEvent) => {
      if (event.key === ".") {
        setScale("+0.1");
      }

      if (event.key === ",") {
        setScale("-0.1");
      }

      if (event.key === "0" && event.altKey) {
        setScale(1);
      }
    };
    window.addEventListener("keydown", keyBoardEvent);

    return () => window.removeEventListener("keydown", keyBoardEvent);
  }, []);

  useEffect(() => {
    const mouseWheelEvent = (event: WheelEvent) => {
      event.preventDefault();

      if (event.altKey) {
        if (event.deltaY > 0) {
          if (event.ctrlKey) {
            setScale("-1");
          } else {
            setScale("-0.1");
          }
        }

        if (event.deltaY < 0) {
          if (event.ctrlKey) {
            setScale("+1");
          } else {
            setScale("+0.1");
          }
        }
      }
    };
    window.addEventListener("wheel", mouseWheelEvent, { passive: false });

    return () => window.removeEventListener("wheel", mouseWheelEvent);
  }, []);

  const layoutRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="flex items-center border-b-2 p-1">
        <Button variant="ghost" size="icon" onClick={() => setScale("-1")}>
          <Minus />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setScale("-0.1")}>
          <Minus />
        </Button>
        <span className="text-sm">
          {Math.round(Math.floor(scale * 1000) / 10)}%
        </span>
        <Button variant="ghost" size="icon" onClick={() => setScale("+0.1")}>
          <Plus />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setScale("+1")}>
          <Plus />
        </Button>
      </div>
      <div
        className="relative"
        ref={layoutRef}
        style={{
          transformOrigin: "top left",
          transform: `scale(${scale})`,
        }}
        onClick={(event) => {
          if (layoutRef.current) {
            const { x, y } = layoutRef.current.getBoundingClientRect();
            setDot1({
              x: (event.clientX - x) / scale,
              y: (event.clientY - y) / scale,
            });
            setState("DOT1");
          }
        }}
      >
        <img
          src="https://pbs.twimg.com/media/FH2n81tacAY4oxl?format=jpg&name=large"
          // src="https://pbs.twimg.com/media/GQmM9GtakAAC8lm?format=jpg&name=large"
          alt="target"
          style={
            {
              // width: `${Math.round(Math.floor(scale * 1000) / 10)}%`,
              // maxWidth: `${Math.round(Math.floor(scale * 1000) / 10)}%`,
            }
          }
        />
        {dot1 && (
          <div
            className="absolute z-10 border-2"
            style={{ top: dot1.y, left: dot1.x }}
          >
            dot1
          </div>
        )}
      </div>
    </>
  );
}

export default Edit;
