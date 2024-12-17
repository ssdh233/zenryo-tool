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

function readFromLocalStorage(key: string, setter: (value: any) => void) {
  let value;
  try {
    value = JSON.parse(localStorage.getItem(key) ?? "null");
    if (value) {
      setter(value);
    }
  } catch (e) {}
}

type Axis = { x: number; y: number };

function Edit() {
  // START, DOT1, DOT2
  // SELECTING (for copying, deleting)
  // SELECTING_DOT1, SELECTING_DOT2?
  const [state, setState] = useState<"DOT1" | "DOT2">("DOT1");
  const [dot1, setDot1] = useState<Axis | null>(null);
  const [dot2, setDot2] = useState<Axis | null>(null);

  const [blocks, setBlocks] = useState<{ dot1: Axis; dot2: Axis }[]>([]);
  const divEl = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useReducer(scaleReducer, 1);

  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      readFromLocalStorage("state", setState);
      readFromLocalStorage("state_dot1", setDot1);
      readFromLocalStorage("state_dot2", setDot2);
      readFromLocalStorage("state_blocks", setBlocks);
      readFromLocalStorage("state_scale", setScale);

      initRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (initRef.current) {
      localStorage.setItem("state", JSON.stringify(state));
      localStorage.setItem("state_dot1", JSON.stringify(dot1));
      localStorage.setItem("state_dot2", JSON.stringify(dot2));
      localStorage.setItem("state_blocks", JSON.stringify(blocks));
      localStorage.setItem("state_scale", JSON.stringify(scale));
    }
  }, [blocks, dot1, dot2, scale, state]);

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

      console.log(event.key, state);

      if (state === "DOT1") {
        event.preventDefault();
        if (event.key === "ArrowUp") {
          setDot1((dot1) => dot1 && { x: dot1.x, y: dot1.y - 1 });
        }

        if (event.key === "ArrowDown") {
          setDot1((dot1) => dot1 && { x: dot1.x, y: dot1.y + 1 });
        }

        if (event.key === "ArrowLeft") {
          setDot1((dot1) => dot1 && { x: dot1.x - 1, y: dot1.y });
        }

        if (event.key === "ArrowRight") {
          setDot1((dot1) => dot1 && { x: dot1.x + 1, y: dot1.y });
        }

        if (event.key === "Enter") {
          setState("DOT2");
        }
      }

      if (state === "DOT2") {
        event.preventDefault();
        if (event.key === "ArrowUp") {
          setDot2((dot2) => dot2 && { x: dot2.x, y: dot2.y - 1 });
        }

        if (event.key === "ArrowDown") {
          setDot2((dot2) => dot2 && { x: dot2.x, y: dot2.y + 1 });
        }

        if (event.key === "ArrowLeft") {
          setDot2((dot2) => dot2 && { x: dot2.x - 1, y: dot2.y });
        }

        if (event.key === "ArrowRight") {
          setDot2((dot2) => dot2 && { x: dot2.x + 1, y: dot2.y });
        }

        if (event.key === "Enter") {
          if (dot1 && dot2) {
            setBlocks((blocks) => [...blocks, { dot1, dot2 }]);
            setDot1(null);
            setDot2(null);
          }
        }
      }
    };
    window.addEventListener("keydown", keyBoardEvent);

    return () => window.removeEventListener("keydown", keyBoardEvent);
  }, [state]);

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
            switch (state) {
              case "DOT1": {
                const { x, y } = layoutRef.current.getBoundingClientRect();
                setDot1({
                  x: (event.clientX - x) / scale,
                  y: (event.clientY - y) / scale,
                });
                break;
              }
              case "DOT2": {
                const { x, y } = layoutRef.current.getBoundingClientRect();
                setDot2({
                  x: (event.clientX - x) / scale,
                  y: (event.clientY - y) / scale,
                });
                break;
              }
              // case "DOT1": {
              //   const { x, y } = layoutRef.current.getBoundingClientRect();
              //   setDot2({
              //     x: (event.clientX - x) / scale,
              //     y: (event.clientY - y) / scale,
              //   });
              //   setState("DOT2");
              //   break;
              // }
            }
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
            className={`absolute z-10 w-[3px] h-[3px] ${
              state === "DOT1" ? "bg-blue-700" : "bg-green-700"
            }`}
            style={{ top: dot1.y, left: dot1.x }}
          ></div>
        )}
        {dot2 && (
          <div
            className={`absolute z-10 w-[3px] h-[3px] ${
              state === "DOT2" ? "bg-blue-700" : "bg-green-700"
            }`}
            style={{ top: dot2.y, left: dot2.x }}
          ></div>
        )}
        {blocks.length > 0 &&
          blocks.map(({ dot1, dot2 }, i) => (
            <div
              className={`absolute z-10 border-2 border-blue-700 border-dashed box-content`}
              key={i}
              style={{
                left: dot1.x,
                top: dot1.y,
                width: dot2.x - dot1.x,
                height: dot2.y - dot1.y,
              }}
            >
              block
            </div>
          ))}
      </div>
    </>
  );
}

export default Edit;
