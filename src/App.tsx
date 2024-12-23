import "./App.css";
import Edit from "./Edit";
import View from "./View";

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const isEdit = urlParams.get("edit") === "1";
  return (
    <div className="App">
      {isEdit ? (
        <Edit />
      ) : (
        <View />
      )}
    </div>
  );
}

export default App;
