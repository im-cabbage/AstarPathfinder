import { useState } from "react";
import Cell from "./cell";

export default function Grid({ settings, setSettings }) {
  //cellType: start, end, wall, blank, open, closed
  let gridStructureArray = [];
  const [startCell, setStartCell] = useState("");
  const [endCell, setEndCell] = useState("");
  const [wallCellArray, setWallCellArray] = useState([]);
  const gridSize = settings.gridSize;
  const cellTypeSelector = settings.cellTypeSelector;

  class CellObject {
    id;
    row;
    width;
    f_cost;
    pathFromStartingNode = [];
    parentNode;

    constructor(id) {
      this.id = id;
      this.row = id.split("-")[0];
      this.width = id.split("-")[1];
    }
  }

  function handleChangeCellType(id) {
    switch (cellTypeSelector) {
      case "start":
        if (endCell === id) setEndCell("");
        if (wallCellArray.includes(id)) {
          setWallCellArray(wallCellArray.filter((cellId) => cellId !== id));
        }
        setStartCell(id);
        break;
      case "end":
        if (startCell === id) setStartCell("");
        if (wallCellArray.includes(id)) {
          setWallCellArray(wallCellArray.filter((cellId) => cellId !== id));
        }
        setEndCell(id);
        break;
      case "wall":
        if (wallCellArray.includes(id)) {
          setWallCellArray(wallCellArray.filter((cellId) => cellId !== id));
        } else {
          if (startCell === id) setStartCell("");
          if (endCell === id) setEndCell("");
          setWallCellArray([...wallCellArray, id]);
        }
        break;

      default:
        break;
    }
  }

  function startSearch() {
    /*
    G cost: distance from starting node
    H cost: distance from end node (Heuristic)
    F cost: G + H (chooses lowest F cost)

    CLOSED cell = searched already
    */

    let openList = [];
    let closedList = [];

    const startNodeID = startCell;
    const startNodeRow = startNodeID.split("-")[0];
    const startNodeColumn = startNodeID.split("-")[1];

    const endNodeID = endCell;
    const endNodeRow = endNodeID.split("-")[0];
    const endNodeColumn = endNodeID.split("-")[1];

    openList.push(gridStructureArray[startNodeRow - 1][startNodeColumn - 1]); //openlist = [{id: , f_cost: , path: [first,..] }, ]

    //path is an array of parentIDs
    function getGcost(row, column) {
      // G cost: distance from starting node using path array
      const pathFromStartingNode = gridStructureArray[row - 1][column - 1].pathFromStartingNode;
      if (pathFromStartingNode.length === 0) {
        if (row === startNodeRow || column === startNodeColumn) {
          return 10;
        }
      } else {
        return pathFromStartingNode.reduce((totalPathCost, currentNodeId, currentNodeIndex) => {
          let childNode;

          if (currentNodeIndex !== 0) {
            childNode = pathFromStartingNode[currentNodeIndex + 1];
            return false
          } else { //if first child
            let row = currentNodeId.split("-")[0];
            let column = currentNodeId.split("-")[1];

            if (row === startNodeRow || column === startNodeColumn) {
              return totalPathCost + 10;
            }
          }
        }, 0)
      }
    }

    function getHcost(row, column) {
      const columnDifference = Math.abs(endNodeColumn - column);
      const rowDifference = Math.abs(endNodeRow - row);

      //if same row / column
      if (row == endNodeRow) {
        return 10 * Math.abs(endNodeColumn - column);
      }
      if (column == endNodeColumn) {
        return 10 * Math.abs(endNodeRow - row);
      }
      //if diagonal
      if (columnDifference == rowDifference) {
        return 14 * columnDifference;
      }
      //if x > y
      if (columnDifference > rowDifference) {
        return 14 * rowDifference + 10 * (columnDifference - rowDifference);
      }
      //if y > x
      if (rowDifference > columnDifference) {
        return 14 * columnDifference + 10 * (rowDifference - columnDifference);
      }
    }

    function getFcost(row, column) {
      return getGcost(row, column) + getHcost(row, column);
    }

    while (true) {
      let currentNode;
      var indexOfCurrentNode = 0;

      //find node with lowest f_cost in openlist
      if (openList.length > 1) {
        // currentNode = openList.reduce((minVal, curVal) => (curVal < minVal ? curVal : minVal), openList[0]);
        let min_f_cost = 0;
        let index_min_f_cost = 0;

        for (let i = 0; i < openList.length; i++) {
          let current_f_cost = openList[i].f_cost;

          if (current_f_cost < min_f_cost) {
            min_f_cost = current_f_cost;
            index_min_f_cost = i;
          }
        }
        currentNode = openList[index_min_f_cost];
        indexOfCurrentNode = index_min_f_cost;
        console.log(currentNode);
      } else {
        currentNode = openList[0];
        console.log(currentNode)
      }

      closedList.push(openList[indexOfCurrentNode]);
      openList.splice(indexOfCurrentNode, 1);
      console.log(closedList);
      console.log(openList)
      console.log(currentNode);

      //if end node is found
      if (currentNode.id === endNodeID) {
        return;
      }

      let id_of_neighbour_nodes = [];
      const current_row = currentNode.id.split("-")[0];
      const current_column = currentNode.id.split("-")[1];

      //search neighbours from top left to bottom right
      for (let i = -1; i < 2; i++) {
        let row_to_be_searched = parseInt(current_row) + i;
        
        if (row_to_be_searched > 0 && row_to_be_searched <= gridSize) {
          
          for (let j = -1; j < 2; j++) {
            let column_to_be_searched = parseInt(current_column) + j;

            if (
              column_to_be_searched > 0 &&
              column_to_be_searched <= gridSize
            ) {
              let id_to_be_searched = `${row_to_be_searched}-${column_to_be_searched}`;

              if (
                wallCellArray.includes(id_to_be_searched) ||
                closedList.includes(id_to_be_searched)
              )
                continue;

              //if new path to neighbour is shorter or neighbour is not in open, set fcost
              if (!openList.includes(id_to_be_searched)) {
                getFcost(row_to_be_searched, column_to_be_searched);
              }
            }
          }
        }
      }
      console.log(id_of_neighbour_nodes);

      break;
    }
  }

  let cells = [];
  for (let row = 1; row <= gridSize; row++) {
    let rowArray = [];
    for (let column = 1; column <= gridSize; column++) {
      const id = `${row}-${column}`;
      rowArray.push(new CellObject(id));
      cells.push(
        <Cell
          key={id}
          row={row}
          column={column}
          handleChangeCellType={(id) => {
            handleChangeCellType(id);
          }}
          startCell={startCell === id}
          endCell={endCell === id}
          wallCell={wallCellArray.includes(id)}
        />
      );
    }
    gridStructureArray.push(rowArray);
  }

  console.log(gridStructureArray);

  return (
    <>
      <div id="startSearch" onClick={startSearch}>
        Search
      </div>
      <div
        id="grid"
        style={{
          "--gridSize": gridSize,
        }}
      >
        {cells}
      </div>
    </>
  );
}
