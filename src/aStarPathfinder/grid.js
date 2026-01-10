import { useState, useRef } from "react";
import { flushSync } from 'react-dom';
import Cell from "./cell";

class CellObject {
  id;
  row;
  column;
  g_cost;
  h_cost;
  f_cost;
  a_cost = -1; //-1 to represent infinity for accumulated cost for dijkstra's
  pathFromStartingNode = []; // contains IDs of all child nodes
  parentNode;

  constructor(id, g_cost, h_cost, f_cost) {
    this.id = id;
    this.row = id.split("-")[0];
    this.column = id.split("-")[1];
    this.g_cost = g_cost;
    this.h_cost = h_cost;
    this.f_cost = f_cost;
  }
}

export default function Grid({ 
  gridID,
  gridStructureArray,
  algorithm,
  gridIndex,
  gridSnapshotsRef,
  snapshotIndex,
  setGridSnapshot,
  autoplayer,
  settings,
  startNodeID,
  setStartNodeID,
  endNodeID,
  setEndNodeID,
  wallNodesIDArray,
  setWallNodesIDArray,
  completedSearch,
  searchTime
}) {
  const gridSize = settings.gridSize;
  const cellTypeSelector = settings.cellTypeSelector;
  const gridSnapshots = gridSnapshotsRef.current;
  const [autoplaySpeed, setAutoplaySpeed] = useState(30);
  

  function handleChangeCellType(e, id) {
    if (e.ctrlKey && e.type === "click") { //ctrl + lclick = add start node
      if (endNodeID === id) setEndNodeID("");
      if (wallNodesIDArray.includes(id)) {
        setWallNodesIDArray(wallNodesIDArray.filter((cellId) => cellId !== id));
      }
      setStartNodeID(id);
    } else if (e.altKey && e.type === "click") { //alt + lclick = add end node
      if (startNodeID === id) setStartNodeID("");
      if (wallNodesIDArray.includes(id)) {
        setWallNodesIDArray(wallNodesIDArray.filter((cellId) => cellId !== id));
      }
      setEndNodeID(id);
    } else {
      switch (cellTypeSelector) {
        case "start":
          if (endNodeID === id) setEndNodeID("");
          if (wallNodesIDArray.includes(id)) {
            setWallNodesIDArray(wallNodesIDArray.filter((cellId) => cellId !== id));
          }
          setStartNodeID(id);
          break;
        case "end":
          if (startNodeID === id) setStartNodeID("");
          if (wallNodesIDArray.includes(id)) {
            setWallNodesIDArray(wallNodesIDArray.filter((cellId) => cellId !== id));
          }
          setEndNodeID(id);
          break;
        case "wall":
          if (wallNodesIDArray.includes(id)) {
            setWallNodesIDArray(wallNodesIDArray.filter((cellId) => cellId !== id));
          } else {
            if (startNodeID === id) setStartNodeID("");
            if (endNodeID === id) setEndNodeID("");
            setWallNodesIDArray([...wallNodesIDArray, id]);
          }
          break;

        default:
          break;
      }
    }
  }

  function handleDrawWall(e, id) {
    if (cellTypeSelector === "wall") {
      if (startNodeID === id) setStartNodeID("");
      if (endNodeID === id) setEndNodeID("");
      setWallNodesIDArray([...wallNodesIDArray, id]);
    }
  }

  function findParentIndicator(row, column) {
    const pathFromStartingNode = gridStructureArray[row - 1][column - 1].pathFromStartingNode;
    const immediateParent = pathFromStartingNode[pathFromStartingNode.length - 1];

    // parent is top left - bottom right
    switch(immediateParent) {
      case `${row-1}-${column-1}`:
        return "topLeft";
      case `${row-1}-${column}`:
        return "top";
      case `${row-1}-${column+1}`:
        return "topRight";
      case `${row}-${column+1}`:
        return "right";
      case `${row+1}-${column+1}`:
        return "bottomRight";
      case `${row+1}-${column}`:
        return "bottom";
      case `${row+1}-${column-1}`:
        return "bottomLeft";
      case `${row}-${column-1}`:
        return "left";

      default:
        return undefined;
    }
  }

  function nextIteration(autoplay, autoplaySpeed) {
    const currentSnapshotIndex = snapshotIndex;
    setGridSnapshot(gridIndex, currentSnapshotIndex, autoplay, autoplaySpeed);
  }

  function handleAutoplayspeedChange(newAutoplayspeed) {
    setAutoplaySpeed(newAutoplayspeed);
    
    if (autoplayer) {
      clearInterval(autoplayer);
      nextIteration(true, newAutoplayspeed)
    }
  }

  return (
    <>
      <div
        id={"grid-" + gridID}
        className="grid"
        style={{
          "--gridSize": gridSize,
        }}
      >
        {gridStructureArray.map((rowArray, rowIndex) => {
          const row = rowIndex + 1;
          return rowArray.map((cellObject, colIndex) => {
            const column = colIndex + 1;
            
            const id = cellObject.id
            return (
              <Cell
                key={id}
                row={row}
                column={column}
                handleChangeCellType={(e, id) => {
                  handleChangeCellType(e, id);
                }}
                handleDrawWall={(e, id) => {
                  handleDrawWall(e, id);
                }}
                startCell={startNodeID === id}
                endCell={endNodeID === id}
                wallCell={wallNodesIDArray.includes(id)}
                gCost={cellObject.g_cost ? cellObject.g_cost : ""}
                hCost={cellObject.h_cost ? cellObject.h_cost : ""}
                fCost={cellObject.f_cost ? cellObject.f_cost : ""}
                aCost={cellObject.a_cost !== -1 ? cellObject.a_cost : ""}
                open={cellObject.cellType === "open"}
                closed={cellObject.cellType === "closed"}
                shortestPath={cellObject.cellType === "shortestPath"}
                parentIndicator={findParentIndicator(row, column)}
                currentCell={cellObject.isCurrent}
              />
            )
          })
        })}
      </div>
      <input className={completedSearch ? "autoplaySpeed" : "autoplaySpeed hidden"} type="range" min={10} max={1000} defaultValue={30} onChange={(e) => {handleAutoplayspeedChange(e.target.value)}}/>
      <div className={completedSearch ? "play" : "play hidden"} onClick={() => nextIteration(true, autoplaySpeed)}>
        Play {`(Every ${autoplaySpeed}ms)`}
      </div>
      <div className={completedSearch ? "next" : "next hidden"} onClick={() => nextIteration(false)}>
        Next
      </div>
      <div className={completedSearch ? "iterationStatus" : "iterationStatus hidden"}>
        {snapshotIndex === -1 ? gridSnapshots[gridIndex].length : snapshotIndex + 1} / {gridSnapshots[gridIndex].length}
      </div>
      <div className={completedSearch ? "timer" : "timer hidden"}>
        Completed in: {searchTime}ms
      </div>
    </>
  );
}
