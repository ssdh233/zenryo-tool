import { Button } from "./components/ui/button";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowDownFromLine,
  ArrowRightFromLine,
  Blocks,
  Copy,
  ImagePlus,
  Minus,
  Pencil,
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

import { Input } from "./components/ui/input";
import { Axis, Block } from "./types";
import { bts } from "./lib/compress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Label } from "./components/ui/label";
import { readObjectFromLocalStorage } from "./lib/localStorage";

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

type ProjectSetting = {
  image: string;
  title: string;
  blocks: Block[];
  scale: number;
};

function saveToLocalStorage({ image, title, blocks, scale }: ProjectSetting) {
  localStorage.setItem(
    `umetool_edit_${title}`,
    JSON.stringify({ image, title, blocks, scale })
  );
}

function Edit() {
  // START, DOT1, DOT2
  // SELECTING (for copying, deleting)
  // SELECTING_DOT1, SELECTING_DOT2?
  const [state, setState] = useState<"DEFAULT" | "DOT1" | "DOT2">("DEFAULT");
  const [dot1, setDot1] = useState<Axis | null>(null);
  const [dot2, setDot2] = useState<Axis | null>(null);

  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [scale, setScale] = useReducer(scaleReducer, 1);
  const [selectedBlockIndexes, setSeletectBlocks] = useState<number[]>([]);

  const initRef = useRef(false);

  const [projects, setProjects] = useState<(ProjectSetting | null)[]>(
    Object.keys(localStorage)
      .filter((key) => key.startsWith("umetool_edit_"))
      .map((key) => readObjectFromLocalStorage(key))
  );

  const switchToProject = useCallback((title: string) => {
    try {
      const state = readObjectFromLocalStorage<{
        image: string;
        title: string;
        blocks: Block[];
        scale: number;
      }>(`umetool_edit_${title}`);
      if (state) {
        setImage(state.image);
        setTitle(state.title);
        setBlocks(state.blocks);
        setScale(state.scale);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;

      const firstTitleFromLocalStorage = projects[0]?.title;
      if (firstTitleFromLocalStorage) {
        switchToProject(firstTitleFromLocalStorage);
      }
    }
  }, [projects, switchToProject]);

  useEffect(() => {
    if (initRef.current && image) {
      saveToLocalStorage({ image, title, blocks, scale });
    }
  }, [blocks, image, scale, title]);

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
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setDot1((dot1) => dot1 && { x: dot1.x, y: dot1.y - 1 });
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setDot1((dot1) => dot1 && { x: dot1.x, y: dot1.y + 1 });
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setDot1((dot1) => dot1 && { x: dot1.x - 1, y: dot1.y });
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          setDot1((dot1) => dot1 && { x: dot1.x + 1, y: dot1.y });
        }

        if (event.key === "Enter") {
          event.preventDefault();
          setState("DOT2");
        }
      }

      if (state === "DOT2") {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setDot2((dot2) => dot2 && { x: dot2.x, y: dot2.y - 1 });
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setDot2((dot2) => dot2 && { x: dot2.x, y: dot2.y + 1 });
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setDot2((dot2) => dot2 && { x: dot2.x - 1, y: dot2.y });
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          setDot2((dot2) => dot2 && { x: dot2.x + 1, y: dot2.y });
        }

        if (event.key === "Enter") {
          event.preventDefault();
          if (dot1 && dot2) {
            setBlocks((blocks) => [...blocks, { dot1, dot2 }]);
            setDot1(null);
            setDot2(null);
            setState("DEFAULT");
          }
        }
      }

      if (state === "DEFAULT") {
        setBlocks((blocks) => {
          const newBlocks = [...blocks];
          selectedBlockIndexes.forEach((index) => {
            if (event.key === "ArrowUp") {
              event.preventDefault();
              newBlocks[index].dot1.y = newBlocks[index].dot1.y - 1;
              newBlocks[index].dot2.y = newBlocks[index].dot2.y - 1;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              newBlocks[index].dot1.y = newBlocks[index].dot1.y + 1;
              newBlocks[index].dot2.y = newBlocks[index].dot2.y + 1;
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              newBlocks[index].dot1.x = newBlocks[index].dot1.x - 1;
              newBlocks[index].dot2.x = newBlocks[index].dot2.x - 1;
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
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

  const exportLink =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    `?title=${title}&image=${encodeURIComponent(image)}&blocks=${bts(blocks)}`;

  const exportLinkInput = useRef<HTMLInputElement>(null);

  const [titleInput, setTitleInput] = useState("");
  const [imageInput, setImageInput] = useState("");

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isAddingTitle, setIsAddingTitle] = useState(initRef.current && !image);

  return (
    <>
      <div className="flex items-center border-b-2 p-1 fixed w-full z-50 bg-white top-0">
        <Dialog
          open={isAddingTitle || isEditingTitle}
          onOpenChange={(open) => {
            if (!open && isEditingTitle) setIsEditingTitle(false);
            if (!open && isAddingTitle) {
              setIsAddingTitle(false);
            }
          }}
        >
          <DialogTitle className="hidden">新規作成</DialogTitle>
          <DialogContent className="sm:max-w-md">
            <form
              id="titleForm"
              onSubmit={(event) => {
                event.preventDefault();

                if (isEditingTitle) {
                  setTitle(titleInput);
                  setImage(imageInput);
                  setIsEditingTitle(false);
                  return;
                }

                if (projects.some((project) => project?.title === titleInput)) {
                  alert("同じ名前のプロジェクトがすでに存在しています。");
                  return;
                }

                setTitle(titleInput);
                setImage(imageInput);
                setBlocks([]);
                setScale(1);

                setTitleInput("");
                setImageInput("");

                saveToLocalStorage({
                  image: imageInput,
                  title: titleInput,
                  blocks: [],
                  scale: 1,
                });

                setProjects(
                  Object.keys(localStorage)
                    .filter((key) => key.startsWith("umetool_edit_"))
                    .map((key) => readObjectFromLocalStorage(key))
                );

                setIsAddingTitle(false);
              }}
            >
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                value={titleInput}
                onChange={(event) => setTitleInput(event.target.value)}
              />
              <Label htmlFor="imageLink">画像リンク</Label>
              <Input
                id="imageLink"
                value={imageInput}
                onChange={(event) => setImageInput(event.target.value)}
              />
              <Button type="submit">新規作成</Button>
            </form>
          </DialogContent>
        </Dialog>
        <Select onValueChange={switchToProject}>
          <SelectTrigger className="w-[180px] mr-1">
            <SelectValue placeholder={title} />
          </SelectTrigger>
          <SelectContent>
            {projects.map(
              (project) =>
                project?.title && (
                  <SelectItem key={project.title} value={project.title}>
                    {project.title}
                  </SelectItem>
                )
            )}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setTitleInput(title);
            setImageInput(image);
            setIsEditingTitle(true);
          }}
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setTitleInput("");
            setImageInput("");
            setIsAddingTitle(true);
          }}
        >
          <ImagePlus />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-1" />
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
              <DialogTitle>共有</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  id="link"
                  defaultValue={exportLink}
                  readOnly
                  ref={exportLinkInput}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="px-3"
                onClick={() => {
                  exportLinkInput.current?.select();
                  exportLinkInput.current?.setSelectionRange(0, 99999);
                  navigator.clipboard.writeText(exportLink);
                }}
              >
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
        <img src={image} alt="target" />
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
