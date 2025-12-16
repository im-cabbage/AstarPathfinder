import { useState } from "react";
import Grid from "./grid";

//settings :
//algorithm(a*, bfs, dfs, dijkstra)
//gridsize
//cell type selector / cellType: start, end, wall, blank
//search button
export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    gridSize: 10,
    cellTypeSelector: "",
  });

  function changeCellTypeSelector(selector) {
    switch (selector) {
      case "start":
        setSettings({
          ...settings,
          cellTypeSelector: "start",
        });
        document.getElementById("start").classList.add("selected");
        document.getElementById("end").classList.remove("selected");
        document.getElementById("wall").classList.remove("selected");
        break;
      case "end":
        setSettings({
          ...settings,
          cellTypeSelector: "end",
        });
        document.getElementById("start").classList.remove("selected");
        document.getElementById("end").classList.add("selected");
        document.getElementById("wall").classList.remove("selected");
        break;
      case "wall":
        setSettings({
          ...settings,
          cellTypeSelector: "wall",
        });
        document.getElementById("start").classList.remove("selected");
        document.getElementById("end").classList.remove("selected");
        document.getElementById("wall").classList.add("selected");
        break;

      default:
        break;
    }
  }

  return (
    <>
      <div id="settingsPanel">
        <div id="cellSelector">
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
          >
            Start
          </div>
          <div
            id="end"
            onClick={() => {
              changeCellTypeSelector("end");
            }}
          >
            End
          </div>
          <div
            id="wall"
            onClick={() => {
              changeCellTypeSelector("wall");
            }}
          >
            Wall
          </div>
        </div>
      </div>
      {/* using key attribute on grid resets the entire grid state when gridsize changes*/}
      <Grid key={settings.gridSize} settings={settings}/> 
    </>
  );
}
