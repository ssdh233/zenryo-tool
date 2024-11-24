import { Button } from "./components/ui/button";
import { useEffect, useRef, useState } from "react";

function Edit() {
  // START, DOT1, DOT2
  // SELECTING (for copying, deleting)
  // SELECTING_DOT1, SELECTING_DOT2?
  const [state, setState] = useState("START");
  const [dot1, setDot1] = useState<{ x: number; y: number } | null>(null);
  const [dot2, setDot2] = useState<{ x: number; y: number } | null>(null);

  const [blocks, setBlocks] = useState([]);
  const divEl = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);

  const [isAltPressing, setIsALtPressing] = useState(false);
  useEffect(() => {
    window.addEventListener("resize", () => {
      console.log(divEl.current?.getBoundingClientRect().width);
    });
  });

  useEffect(() => {
    const keyBoardEvent = (event: KeyboardEvent) => {
      if (event.key === ".") {
        setScale((x) => x + 0.1);
      }

      if (event.key === ",") {
        setScale((x) => x - 0.1);
      }
    };
    window.addEventListener("keydown", keyBoardEvent);

    return () => window.removeEventListener("keydown", keyBoardEvent);
  }, []);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === "Alt") {
        event.preventDefault();
        setIsALtPressing(true);
      }
    };

    const keyUp = (event: KeyboardEvent) => {
      if (event.key === "Alt") {
        event.preventDefault();
        setIsALtPressing(false);
      }
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  useEffect(() => {
    const mouseWheelEvent = (event: WheelEvent) => {
      if (isAltPressing) {
        event.preventDefault();
        if (event.deltaY > 0) {
          setScale((x) => x - 0.1);
        }

        if (event.deltaY < 0) {
          setScale((x) => x + 0.1);
        }
      }
    };
    window.addEventListener("wheel", mouseWheelEvent, { passive: false });

    return () => window.removeEventListener("wheel", mouseWheelEvent);
  }, [isAltPressing]);

  console.log({ state, dot1 });
  // TODO canvas or DOM?
  return (
    <>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale((x) => x - 1)}
        >
          -
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale((x) => x - 0.1)}
        >
          -
        </Button>
        {Math.round(Math.floor(scale * 1000) / 10)}%
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale((x) => x + 0.1)}
        >
          +
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale((x) => x + 1)}
        >
          +
        </Button>
      </div>
      <div
        className=""
        onClick={(event) => {
          if (state === "START") {
            setDot1({
              x: event.clientX,
              y: event.clientY,
            });
            setState("DOT1");
          }
          console.log("TODO get x and y axis");
        }}
        ref={divEl}
      >
        <img
          src="https://pbs.twimg.com/media/FH2n81tacAY4oxl?format=jpg&name=large"
          // src="https://pbs.twimg.com/media/GQmM9GtakAAC8lm?format=jpg&name=large"
          alt="target"
          style={{
            width: `${Math.round(Math.floor(scale * 1000) / 10)}%`,
            maxWidth: `${Math.round(Math.floor(scale * 1000) / 10)}%`,
          }}
        />
        {dot1 && <div></div>}
      </div>
    </>
  );
}

export default Edit;
