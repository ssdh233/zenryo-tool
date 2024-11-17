import "./App.css";
import Edit from "./Edit";

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const isEdit = urlParams.get("edit") === "1";
  return (
    <div className="App">
      {isEdit ? (
        <Edit />
      ) : (
        <div>
          Not in edit mode.{" "}
          <button
            onClick={() => {
              urlParams.set("edit", "1");
              window.location.search = urlParams.toString();
            }}
          >
            Go to Edit
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
