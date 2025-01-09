import { Block } from "../types";
import LZString from "lz-string";

function bts(blocks: Block[]): string {
  const blocksIntArray = blocks.flatMap((b) => [
    b.dot1.x,
    b.dot1.y,
    b.dot2.x,
    b.dot2.y,
  ]);

  return LZString.compressToEncodedURIComponent(blocksIntArray.join(","));
}

function stb(str: string): Block[] {
  let blocksIntArray =
    LZString.decompressFromEncodedURIComponent(str).split(",");
  let blocks = [];
  for (let i = 0; i < blocksIntArray.length / 4; i++) {
    blocks.push({
      dot1: {
        x: Number(blocksIntArray[i * 4]),
        y: Number(blocksIntArray[i * 4 + 1]),
      },
      dot2: {
        x: Number(blocksIntArray[i * 4 + 2]),
        y: Number(blocksIntArray[i * 4 + 3]),
      },
    });
  }

  return blocks;
}

export { bts, stb };
