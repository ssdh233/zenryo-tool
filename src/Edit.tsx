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

  useEffect(() => {
    window.addEventListener("resize", () => {
      console.log(divEl.current?.getBoundingClientRect().width);
    });
  });

  console.log({ state, dot1 });
  // TODO canvas or DOM?
  return (
    <>
      <Button variant="outline" size="icon">
        +
      </Button>
      <Button variant="outline" size="icon">
        -
      </Button>
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
        />
        {dot1 && <div></div>}
      </div>
    </>
  );
}

export default Edit;
