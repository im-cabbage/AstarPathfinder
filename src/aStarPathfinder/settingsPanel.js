import { useState, useRef } from "react";
import Grid from "./grid";

export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    gridSize: 10,
    cellTypeSelector: "",
  });
  const [startCell, setStartCell] = useState("");
  const [endCell, setEndCell] = useState("");
  const [wallCellArray, setWallCellArray] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("astar");
  const searchAlgorithmFunctionsRef = useRef(null);
  const [searchCompleted, setSearchCompleted] = useState(false);

  function changeCellTypeSelector(selector) {
    switch (selector) {
      case "start":
        setSettings({
          ...settings,
          cellTypeSelector: "start",
        });
        break;
      case "end":
        setSettings({
          ...settings,
          cellTypeSelector: "end",
        });
        break;
      case "wall":
        setSettings({
          ...settings,
          cellTypeSelector: "wall",
        });
        break;

      default:
        break;
    }
  }

  return (
    <>
      <div id="settingsPanel">
        <div id="cellSelector">
          <select 
            id="algorithmSelector"
            onChange={(e) =>
              setSelectedAlgorithm(e.target.value)
            }
          >
            <optgroup label="Weighted Graph">
              <option value="astar">A* Search Algorithm</option>
              <option value="dijkstras">Dijkstra's Algorithm</option>
            </optgroup>
            <hr />
            <optgroup label="Unweighted Graph">
              <option value="bfs">Breadth-First Search</option>
              <option value="dfs">Depth-First Search</option>
            </optgroup>
          </select>
          <input
            id="gridSize"
            type="number"
            defaultValue={10}
            onChange={(e) =>
              setSettings({
                ...settings,
                gridSize: e.target.value,
              })
            }
          />
          <div
            id="start"
            onClick={() => {
              changeCellTypeSelector("start");
            }}
            className={settings.cellTypeSelector === "start" ? "selected" : ""}
          >
            Start
          </div>
          <div
            id="end"
            onClick={() => {
              changeCellTypeSelector("end");
            }}
            className={settings.cellTypeSelector === "end" ? "selected" : ""}
          >
            End
          </div>
          <div
            id="wall"
            onClick={() => {
              changeCellTypeSelector("wall");
            }}
            className={settings.cellTypeSelector === "wall" ? "selected" : ""}
          >
            Wall
          </div>
          <div
            id="startSearch"
            onClick={() => {
              switch (selectedAlgorithm) {
                case "astar":
                  searchAlgorithmFunctionsRef.current.astarSearch();
                  setSearchCompleted(true);
                  break;
                case "dijkstras":
                  searchAlgorithmFunctionsRef.current.dijkstrasSearch();
                  setSearchCompleted(true);
                  break;
                case "bfs":
                  searchAlgorithmFunctionsRef.current.breadthFirstSearch();
                  setSearchCompleted(true);
                  break;
                case "dfs":
                  searchAlgorithmFunctionsRef.current.depthFirstSearch();
                  setSearchCompleted(true);
                  break;
                default:
                  break;
              }
            }}>
            Search
          </div>
        </div>
      </div>
      {/* using key attribute on grid resets the entire grid state when gridsize changes*/}
      <Grid 
        key={settings.gridSize}
        searchAlgorithmFunctionsRef={searchAlgorithmFunctionsRef}
        settings={settings}
        startCell={startCell}
        setStartCell={setStartCell}
        endCell={endCell}
        setEndCell={setEndCell}
        wallCellArray={wallCellArray}
        setWallCellArray={setWallCellArray}
        />
    </>
  );
}
