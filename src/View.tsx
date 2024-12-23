import LZString from "lz-string";
import { useMemo, useState } from "react";
import { Block } from "./types";

function View() {
  const blocks = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const blocksRawBase64 = searchParams.get("blocks");

    let blocks: Block[] = [];
    if (blocksRawBase64) {
      const blocksRaw = blocksRawBase64?.split(",");

      if (blocksRaw) {
        for (let i = 0; i < blocksRaw.length / 4; i++) {
          blocks.push({
            dot1: {
              x: Number(blocksRaw[i * 4]),
              y: Number(blocksRaw[i * 4 + 1]),
            },
            dot2: {
              x: Number(blocksRaw[i * 4 + 2]),
              y: Number(blocksRaw[i * 4 + 3]),
            },
          });
        }
      }
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
            className={`absolute z-10 ${blockState[i] ? "bg-yellow-300/50" : ""}`}
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
