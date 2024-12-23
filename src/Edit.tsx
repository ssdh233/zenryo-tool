import { Button } from "./components/ui/button";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowDownFromLine,
  ArrowRightFromLine,
  Blocks,
  Copy,
  Minus,
  Plus,
  SquareArrowOutUpRight,
  SquareDashed,
  Trash2,
  X,
} from "lucide-react";
import { Separator } from "./components/ui/separator";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import LZString from "lz-string";

import { Input } from "./components/ui/input";
import { Axis, Block } from "./types";
import { bts } from "./lib/compress";

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

function Edit() {
  // START, DOT1, DOT2
  // SELECTING (for copying, deleting)
  // SELECTING_DOT1, SELECTING_DOT2?
  const [state, setState] = useState<"DEFAULT" | "DOT1" | "DOT2">("DEFAULT");
  const [dot1, setDot1] = useState<Axis | null>(null);
  const [dot2, setDot2] = useState<Axis | null>(null);

  const [blocks, setBlocks] = useState<Block[]>([]);

  const [scale, setScale] = useReducer(scaleReducer, 1);
  const [selectedBlockIndexes, setSeletectBlocks] = useState<number[]>([]);

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
            setState("DEFAULT");
          }
        }
      }

      if (state === "DEFAULT") {
        event.preventDefault();
        setBlocks((blocks) => {
          const newBlocks = [...blocks];
          selectedBlockIndexes.forEach((index) => {
            if (event.key === "ArrowUp") {
              newBlocks[index].dot1.y = newBlocks[index].dot1.y - 1;
              newBlocks[index].dot2.y = newBlocks[index].dot2.y - 1;
            }
            if (event.key === "ArrowDown") {
              newBlocks[index].dot1.y = newBlocks[index].dot1.y + 1;
              newBlocks[index].dot2.y = newBlocks[index].dot2.y + 1;
            }
            if (event.key === "ArrowLeft") {
              newBlocks[index].dot1.x = newBlocks[index].dot1.x - 1;
              newBlocks[index].dot2.x = newBlocks[index].dot2.x - 1;
            }
            if (event.key === "ArrowRight") {
              newBlocks[index].dot1.x = newBlocks[index].dot1.x + 1;
              newBlocks[index].dot2.x = newBlocks[index].dot2.x + 1;
            }
          });
          return newBlocks;
        });
      }
    };
    window.addEventListener("keydown", keyBoardEvent);

    return () => window.removeEventListener("keydown", keyBoardEvent);
  }, [dot1, dot2, selectedBlockIndexes, state]);

  useEffect(() => {
    const mouseWheelEvent = (event: WheelEvent) => {
      if (event.altKey) {
        event.preventDefault();

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
      <div className="flex items-center border-b-2 p-1 fixed w-full z-50 bg-white top-0">
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
        <Separator orientation="vertical" className="h-5 mx-1" />
        {selectedBlockIndexes.length === 0 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (state === "DEFAULT") {
                  setState("DOT1");
                }

                if (state === "DOT1" || state === "DOT2") {
                  setState("DEFAULT");
                  setDot1(null);
                  setDot2(null);
                }
              }}
              className={
                state === "DOT1" || state === "DOT2"
                  ? "bg-gray-300 hover:bg-gray-300"
                  : ""
              }
            >
              <SquareDashed />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSeletectBlocks(
                  new Array(blocks.length).fill(0).map((_, i) => i)
                );
              }}
            >
              <Blocks />
            </Button>
          </>
        )}
        {selectedBlockIndexes.length > 0 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSeletectBlocks([]);
              }}
            >
              <X />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setBlocks((blocks) => {
                  const newSelectedBlocks = [] as number[];
                  const newBlocks = [...blocks];
                  selectedBlockIndexes.forEach((i) => {
                    const selectedBlock = blocks[i];
                    const newBlockIndex =
                      newBlocks.push({
                        dot1: {
                          x: selectedBlock.dot1.x,
                          y: selectedBlock.dot2.y,
                        },
                        dot2: {
                          x: selectedBlock.dot2.x,
                          y: selectedBlock.dot2.y * 2 - selectedBlock.dot1.y,
                        },
                      }) - 1;
                    newSelectedBlocks.push(newBlockIndex);
                  });
                  setSeletectBlocks(newSelectedBlocks);

                  return newBlocks;
                });
              }}
            >
              <ArrowDownFromLine />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setBlocks((blocks) => {
                  const newSelectedBlocks = [] as number[];
                  const newBlocks = [...blocks];
                  selectedBlockIndexes.forEach((i) => {
                    const selectedBlock = blocks[i];
                    const newBlockIndex =
                      newBlocks.push({
                        dot1: {
                          x: selectedBlock.dot2.x,
                          y: selectedBlock.dot1.y,
                        },
                        dot2: {
                          x: selectedBlock.dot2.x * 2 - selectedBlock.dot1.x,
                          y: selectedBlock.dot2.y,
                        },
                      }) - 1;
                    newSelectedBlocks.push(newBlockIndex);
                  });
                  setSeletectBlocks(newSelectedBlocks);

                  return newBlocks;
                });
              }}
            >
              <ArrowRightFromLine />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setBlocks(() => {
                  const newBlocks = blocks.slice(0);
                  selectedBlockIndexes.forEach((i) => {
                    delete newBlocks[i];
                  });
                  return newBlocks.filter((x) => x);
                });
                setSeletectBlocks([]);
              }}
            >
              <Trash2 />
            </Button>
          </>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <SquareArrowOutUpRight />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share link</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  id="link"
                  defaultValue={
                    window.location.protocol +
                    "//" +
                    window.location.host +
                    window.location.pathname +
                    `?blocks=${bts(blocks)}`
                  }
                  readOnly
                />
              </div>
              <Button type="submit" size="sm" className="px-3">
                <span className="sr-only">Copy</span>
                <Copy />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div
        className="relative mt-[46px]"
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
                  x: Math.round((event.clientX - x) / scale),
                  y: Math.round((event.clientY - y) / scale),
                });
                break;
              }
              case "DOT2": {
                const { x, y } = layoutRef.current.getBoundingClientRect();
                setDot2({
                  x: Math.round((event.clientX - x) / scale),
                  y: Math.round((event.clientY - y) / scale),
                });
                break;
              }
            }
          }
        }}
      >
        <img
          src="https://pbs.twimg.com/media/FH2n81tacAY4oxl?format=jpg&name=large"
          // src="https://pbs.twimg.com/media/GQmM9GtakAAC8lm?format=jpg&name=large"
          alt="target"
        />
        {dot1 && (
          <div
            className={`absolute z-10 w-[3px] h-[3px] border-[1px] ${
              state === "DOT1" ? "border-blue-700" : "border-green-700"
            }`}
            style={{ top: dot1.y - 1, left: dot1.x - 1 }}
          ></div>
        )}
        {dot2 && (
          <div
            className={`absolute z-10 w-[3px] h-[3px] border-[1px]  ${
              state === "DOT2" ? "border-blue-700" : "border-green-700"
            }`}
            style={{ top: dot2.y - 1, left: dot2.x - 1 }}
          ></div>
        )}
        {dot1 && dot2 && state === "DOT2" && (
          <div
            className={`absolute z-10 border-[1px] border-blue-700 border-dashed box-border`}
            style={{
              left: dot1.x,
              top: dot1.y,
              width: dot2.x - dot1.x + 1,
              height: dot2.y - dot1.y + 1,
            }}
          ></div>
        )}
        {blocks.length > 0 &&
          blocks.map(({ dot1, dot2 }, i) => (
            <div
              className={`absolute border-[1px] ${
                selectedBlockIndexes.includes(i)
                  ? "border-yellow-300 z-20"
                  : "border-green-700 z-10"
              } border-dashed box-border`}
              key={i}
              style={{
                left: dot1.x,
                top: dot1.y,
                width: dot2.x - dot1.x + 1,
                height: dot2.y - dot1.y + 1,
              }}
              onClick={() => {
                if (state === "DEFAULT") {
                  setSeletectBlocks((blocks) => {
                    const index = blocks.indexOf(i);
                    console.log({ index });
                    if (index > -1) {
                      return blocks.toSpliced(index, 1);
                    } else {
                      return [...blocks, i];
                    }
                  });
                }
              }}
            ></div>
          ))}
      </div>
    </>
  );
}

export default Edit;
