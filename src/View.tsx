import { useEffect, useMemo, useRef, useState } from "react";
import { Block } from "./types";
import { stb } from "./lib/compress";
import { Camera } from "lucide-react";
import { Button } from "./components/ui/button";
import { readObjectFromLocalStorage } from "./lib/localStorage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

type Project = {
  title: string;
  image: string;
  blocks: Block[];
};

function View() {
  const [project, setProject] = useState<Project | null>(null);
  const [blockState, setBlockState] = useState<(number | undefined)[]>([]);

  const imageDivRef = useRef<HTMLDivElement>(null);

  const projects = useMemo(
    () =>
      Object.keys(localStorage)
        .filter((key) => key.startsWith("umetool_data_"))
        .map((key) =>
          readObjectFromLocalStorage<{
            title: string;
            image: string;
            blocks: Block[];
          }>(key)
        ),
    []
  );

  const initRef = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const blocksData = searchParams.get("blocks");
    const image = searchParams.get("image");
    const title = searchParams.get("title");

    let blocks: Block[] = [];

    if (title && image && blocksData) {
      blocks = stb(blocksData);

      localStorage.setItem(
        "umetool_data_" + title,
        JSON.stringify({
          title,
          image,
          blocks,
        })
      );

      setProject({ title, image, blocks });
    }
  }, []);

  useEffect(() => {
    if (initRef.current && project) {
      localStorage.setItem(
        "umetool_state_" + project.title,
        JSON.stringify(blockState)
      );
    }
  }, [blockState, project]);

  useEffect(() => {
    if (!initRef.current && project) {
      initRef.current = true;
      const stateFromLocalStorage = localStorage.getItem(
        "umetool_state_" + project.title
      );
      if (stateFromLocalStorage) {
        setBlockState(JSON.parse(stateFromLocalStorage));
      }
    }
  }, [project]);

  return (
    <div className="relative">
      <div className="flex items-center border-b-2 p-1 fixed w-full z-50 bg-white top-0">
        <Select
          onValueChange={(value) => {
            initRef.current = false;
            setProject(
              (current) =>
                projects.find((project) => project?.title === value) ?? current
            );
          }}
        >
          <SelectTrigger className="w-[180px] mr-1">
            <SelectValue placeholder={project?.title} />
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
            if (imageDivRef.current && project?.image) {
              const rect = imageDivRef.current.getBoundingClientRect();
              const canvas = document.createElement("canvas");
              canvas.width = rect.width;
              canvas.height = rect.height;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                const img = new Image();
                img.src = project.image;

                img.setAttribute("crossorigin", "anonymous");

                img.onload = () => {
                  ctx?.drawImage(img, 0, 0);

                  blockState.forEach((state, i) => {
                    if (state) {
                      ctx.fillStyle =
                        state === 1
                          ? "rgb(253 224 71 / 0.5)"
                          : state === 2
                          ? "rgb(55 65 81 / 0.7)"
                          : "rgb(239 68 68 / 0.7)";
                      const { dot1, dot2 } = project.blocks[i];
                      const left = dot1.x;
                      const top = dot1.y;
                      const width = dot2.x - dot1.x + 1;
                      const height = dot2.y - dot1.y + 1;

                      ctx.fillRect(left, top, width, height);
                    }
                  });
                  const output = canvas.toDataURL("image/png");

                  const aDownloadLink = document.createElement("a");
                  aDownloadLink.download = "canvas_image.png";
                  aDownloadLink.href = output;
                  aDownloadLink.click();
                };
              }
            }
          }}
        >
          <Camera />
        </Button>
      </div>
      <div className="mt-[46px]" ref={imageDivRef}>
        {project?.image && <img src={project.image} alt="target" />}
        {project?.blocks.length &&
          project.blocks.map(({ dot1, dot2 }, i) => {
            const left = dot1.x;
            const top = dot1.y;
            const width = dot2.x - dot1.x + 1;
            const height = dot2.y - dot1.y + 1;

            return (
              <div
                key={i}
                className={`absolute z-10 ${
                  blockState[i] === 1
                    ? "bg-yellow-400/50"
                    : blockState[i] === 2
                    ? "bg-gray-700/70"
                    : blockState[i] === 3
                    ? "bg-red-500/70"
                    : ""
                }`}
                style={{
                  left,
                  top,
                  width,
                  height,
                }}
                onClick={() =>
                  setBlockState((state) => {
                    const newState = [...state];
                    newState[i] = ((newState[i] ?? 0) + 1) % 4;
                    return newState;
                  })
                }
              ></div>
            );
          })}
      </div>
    </div>
  );
}

export default View;
