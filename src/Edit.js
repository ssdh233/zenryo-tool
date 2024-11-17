import { useState } from "react";

function Edit() {
  // START, DOT1, DOT2
  // SELECTING (for copying, deleting)
  // SELECTING_DOT1, SELECTING_DOT2?
  const [state, setState] = useState("START");
  const [dot1, setDot1] = useState(null);
  const [dot2, setDot2] = useState(null);

  const [blocks, setBlocks] = useState([]);
  return (
    <div className="" onClick={(event) => {
        console.log("TODO get x and y axis");
    }}>
      <img
        className="w-full"
        src="https://pbs.twimg.com/media/FH2n81tacAY4oxl?format=jpg&name=large"
        // src="https://pbs.twimg.com/media/GQmM9GtakAAC8lm?format=jpg&name=large"
        alt="target"
      />
    </div>
  );
}

export default Edit;
