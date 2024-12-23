import { useMemo, useState } from "react";
import { Block } from "./types";
import { stb } from "./lib/compress";

function View() {
  const blocks = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const blocksData = searchParams.get("blocks");

    let blocks: Block[] = [];

    if (blocksData) {
      blocks = stb(blocksData);
    }

    return blocks;
  }, []);

  const [blockState, setBlockState] = useState<(number | undefined)[]>([]);

  return (
    <div className="relative">
      <img
        src="https://pbs.twimg.com/media/FH2n81tacAY4oxl?format=jpg&name=large"
        alt="target"
      />
      {blocks.length > 0 &&
        blocks.map(({ dot1, dot2 }, i) => (
          <div
            className={`absolute z-10 ${
              blockState[i] ? "bg-yellow-300/50" : ""
            }`}
            key={i}
            style={{
              left: dot1.x,
              top: dot1.y,
              width: dot2.x - dot1.x + 1,
              height: dot2.y - dot1.y + 1,
            }}
            onClick={() =>
              setBlockState((state) => {
                const newState = [...state];
                newState[i] = newState[i] ? 0 : 1;
                return newState;
              })
            }
          ></div>
        ))}
    </div>
  );
}

export default View;
