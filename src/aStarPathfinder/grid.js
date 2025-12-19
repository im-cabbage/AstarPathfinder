import { useState } from "react";
import Cell from "./cell";

export default function Grid({ settings }) {
  class CellObject {
    id;
    row;
    width;
    g_cost;
    h_cost;
    f_cost;
    pathFromStartingNode = []; // contains IDs of all child nodes
    parentNode;

    constructor(id, g_cost, h_cost, f_cost) {
      this.id = id;
      this.row = id.split("-")[0];
      this.width = id.split("-")[1];
      this.g_cost = g_cost;
      this.h_cost = h_cost;
      this.f_cost = f_cost;
    }
  }

  //cellType: start, end, wall, blank, open, closed
  // let gridStructureArray = [];
  const [startCell, setStartCell] = useState("");
  const [endCell, setEndCell] = useState("");
  const [wallCellArray, setWallCellArray] = useState([]);
  const gridSize = settings.gridSize;
  const cellTypeSelector = settings.cellTypeSelector;
  const [openNodes, setOpenNodes] = useState([]);
  const [closedNodes, setClosedNodes] = useState([]);
  const [shortestPath, setShortestPath] = useState([]);
  const [gridStructureArray, setGridStructureArray] = useState(() => initGridStructureArray());


  function initGridStructureArray() {
    let tempGridStructureArray = [];
    for (let row = 1; row <= gridSize; row++) {
      let rowArray = [];
      for (let column = 1; column <= gridSize; column++) {
        const id = `${row}-${column}`;
        rowArray.push(new CellObject(id));
      }
      tempGridStructureArray.push(rowArray);
    }
    return tempGridStructureArray;
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

    // spread syntax to create a copy of the original array first
    // However, even if you copy an array, you can’t mutate existing items inside of it directly. 
    // This is because copying is shallow— the new array will contain the same items as the original one. 
    // So if you modify an object inside the copied array, you are mutating the existing state.
    let tempGridStructureArray = [...gridStructureArray]; //still points to the gridStructureArray object, it still can be mutated, hence need to create a new copy and replace!
    let openList = [];
    let closedList = [];

    const startNodeID = startCell;
    const startNodeRow = startNodeID.split("-")[0];
    const startNodeColumn = startNodeID.split("-")[1];

    const endNodeID = endCell;
    const endNodeRow = endNodeID.split("-")[0];
    const endNodeColumn = endNodeID.split("-")[1];

    openList.push(gridStructureArray[startNodeRow - 1][startNodeColumn - 1]); //openlist = [{id: , f_cost: , path: [first,..] }, ]

    

    function getGcost(row, column, currentNodeId) {
      //path is an array of parentIDs
      // G cost: distance from starting node using path array

      //if new path to neighbour is shorter, use parents path
      let pathFromStartingNode = [...tempGridStructureArray[row - 1][column - 1].pathFromStartingNode]; //create shallow copy to avoid mutation
      const parentNode = pathFromStartingNode[pathFromStartingNode.length - 1];
      
      if (parentNode !== currentNodeId) {
        const [currentNodeRow, currentNodeColumn] = currentNodeId.split("-");
        const currentNodePathFromStartingNode = tempGridStructureArray[currentNodeRow - 1][currentNodeColumn - 1].pathFromStartingNode;
        pathFromStartingNode = [...currentNodePathFromStartingNode, currentNodeId];
      }
      
      if (pathFromStartingNode.length === 1) { //only contains startNode
        if (row == startNodeRow || column == startNodeColumn) { //straight
          return 10;
        } else { //diagonal
          return 14;
        }
      } else {
        return pathFromStartingNode.reduceRight((totalPathCost, currentNodeId, currentNodeIndex) => {
          //get row n col of parent
          //straight or diagonal?

          let currentNodeRow = currentNodeId.split("-")[0];
          let currentNodecolumn = currentNodeId.split("-")[1];

          let parentNode;
          
          if (currentNodeId === startNodeID) { //skip if startCell
            return totalPathCost 
          } else {
            parentNode = pathFromStartingNode[currentNodeIndex - 1];
            const [ parentNodeRow, parentNodeColumn] = parentNode.split("-");

            if (currentNodeIndex === pathFromStartingNode.length - 1) { //if last index, calculate distance from current neighbour to currentNode
              if (row == currentNodeRow || column == currentNodecolumn) { //current neighbour to currentNode is straight, +10
                if (currentNodeRow == parentNodeRow || currentNodecolumn == parentNodeColumn) { 
                  return totalPathCost + 10 + 10;
                } else { //diagonal
                  return totalPathCost + 14 + 10;
                }
              } else { //current neighbour to currentNode is diagonal, +14
                if (currentNodeRow == parentNodeRow || currentNodecolumn == parentNodeColumn) { 
                  return totalPathCost + 10 + 14;
                } else { //diagonal
                  return totalPathCost + 14 + 14;
                }
              }
            } else {
              if (currentNodeRow == parentNodeRow || currentNodecolumn == parentNodeColumn) { 
                return totalPathCost + 10;
              } else { //diagonal
                return totalPathCost + 14;
              }
            }
          }
        }, 0)
      }
    }

    function getHcost(row, column) {
      const columnDifference = Math.abs(endNodeColumn - column);
      const rowDifference = Math.abs(endNodeRow - row);

      //if same row
      if (row == endNodeRow) {
        return 10 * Math.abs(endNodeColumn - column);
      }
      //if same column
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

    function getFcost(row, column, currentNodeId) {
      return getGcost(row, column, currentNodeId) + getHcost(row, column);
    }

    function setFcost(row, column, currentNodeId) { //set f_cost for neighbour
      const id = `${row}-${column}`;

      const newGridStructureArray = tempGridStructureArray.map((rowArray, rowIndex) => {//add currentNode as parent into pathFromStartingNode before calling getGcost func
        if (rowIndex === parseInt(row) - 1) {
          const newRowArray = rowArray.map((cellObject, columnIndex) => {
            if(columnIndex === parseInt(column) - 1) {
              let newCellObject = new CellObject(cellObject.id); //create deep copy

              const [ parentRow, parentColumn ] = currentNodeId.split("-");
              const parentNodePathFromStartingNode = tempGridStructureArray[parentRow - 1][parentColumn - 1].pathFromStartingNode;
              
              //add currentNode as parent in pathFromStartingNode array
              newCellObject.pathFromStartingNode = [...parentNodePathFromStartingNode, currentNodeId];

              return newCellObject;
            } else {
              return cellObject;
            }
          });
          return newRowArray;
        } else {
          return rowArray;
        }
      });
      tempGridStructureArray = newGridStructureArray;

      const gCost = getGcost(row, column, currentNodeId);
      const hCost = getHcost(row, column);
      const fCost = gCost + hCost;

      //does not mutate original gridStructureArray since the child object has been replaced
      tempGridStructureArray[row - 1][column - 1].g_cost = gCost;
      tempGridStructureArray[row - 1][column - 1].h_cost = hCost;
      tempGridStructureArray[row - 1][column - 1].f_cost = fCost;

      return fCost;
    }

    function isOppositeDiagonalWall(current_row, current_column, row_to_be_searched, column_to_be_searched, searchedRow, searchedColumn) {
      //can only be opposite diagonal wall if neighbour is a corner node
      if (row_to_be_searched == current_row || column_to_be_searched == current_column) { // if not corner node, return false
        return false;
      } else { // if corner node
        current_row = parseInt(current_row);
        current_column = parseInt(current_column);

        if (searchedRow === -1 && searchedColumn === -1) { //if top left
          if (wallCellArray.includes(`${current_row - 1}-${current_column}`) && wallCellArray.includes(`${current_row}-${current_column - 1}`)) {
            return true;
          } else {
            return false;
          }
        }
        if (searchedRow === -1 && searchedColumn === 1) { //if top right
          if (wallCellArray.includes(`${current_row - 1}-${current_column}`) && wallCellArray.includes(`${current_row}-${current_column + 1}`)) {
            return true;
          } else {
            return false;
          }
        }
        if (searchedRow === 1 && searchedColumn === 1) { //if bottom right
          console.log(`${current_row + 1}-${current_column}`)
          if (wallCellArray.includes(`${current_row + 1}-${current_column}`) && wallCellArray.includes(`${current_row}-${current_column + 1}`)) {
            return true;
          } else {
            return false;
          }
        }
        if (searchedRow === 1 && searchedColumn === -1) { //if bottom left
          if (wallCellArray.includes(`${current_row + 1}-${current_column}`) && wallCellArray.includes(`${current_row}-${current_column - 1}`)) {
            return true;
          } else {
            return false;
          }
        }
      }
    }

    while (true) {
      let currentNode;
      var indexOfCurrentNode = 0;

      //find node with lowest f_cost in openlist
      if (openList.length > 1) {
        // currentNode = openList.reduce((minVal, curVal) => (curVal < minVal ? curVal : minVal), openList[0]);
        let min_f_cost = openList[0].f_cost;
        let min_h_cost = openList[0].h_cost;
        let index_min_f_cost = 0;

        for (let i = 0; i < openList.length; i++) {
          let current_f_cost = openList[i].f_cost;
          let current_h_cost = openList[i].h_cost;

          if (current_f_cost < min_f_cost) {
            min_f_cost = current_f_cost;
            min_h_cost = current_h_cost;
            index_min_f_cost = i;
          } else if (current_f_cost === min_f_cost) {
            if (current_h_cost < min_h_cost) { //if same fCost, find lower hCost
              min_h_cost = current_h_cost;
              index_min_f_cost = i;
            }

          }
        }
        currentNode = openList[index_min_f_cost];
        indexOfCurrentNode = index_min_f_cost;
      } else { //at startNode
        currentNode = openList[0];
      }

      closedList.push(openList[indexOfCurrentNode]);
      openList.splice(indexOfCurrentNode, 1);

      //if no possible path to endNode
      if (!currentNode) {
        setGridStructureArray(tempGridStructureArray);
        console.log("Not possible to reach end Node")
        break;
      }

      //if end node is found
      if (currentNode.id === endNodeID) {
        const [endNodeRow, endNodeColumn] = endNodeID.split("-");
        
        setGridStructureArray(tempGridStructureArray);
        setOpenNodes(openList);
        setClosedNodes(closedList);
        setShortestPath([...tempGridStructureArray[endNodeRow - 1][endNodeColumn - 1].pathFromStartingNode])
        break;
      }


      const current_row = currentNode.id.split("-")[0];
      const current_column = currentNode.id.split("-")[1];

      //search neighbours from top left to bottom right
      for (let i = -1; i < 2; i++) {
        let row_to_be_searched = parseInt(current_row) + i;
        
        if (row_to_be_searched > 0 && row_to_be_searched <= gridSize) {
          
          for (let j = -1; j < 2; j++) {
            let column_to_be_searched = parseInt(current_column) + j;
            let id_to_be_searched = `${row_to_be_searched}-${column_to_be_searched}`;

            if (id_to_be_searched === startNodeID) continue;

            if (
              column_to_be_searched > 0 &&
              column_to_be_searched <= gridSize
            ) {

              //skip if neighbour is a wall or 
              //is in closed list or
              //is Opposite Diagonal Wall
              if (
                wallCellArray.includes(id_to_be_searched) ||
                closedList.some(cellObject => cellObject.id === id_to_be_searched) ||
                isOppositeDiagonalWall(current_row, current_column, row_to_be_searched, column_to_be_searched, i, j)
              )
                continue;

              //if new path to neighbour is shorter 
              const newFCost = getFcost(row_to_be_searched, column_to_be_searched, currentNode.id);
              // or neighbour is not in open, set fcost
              if (
                !openList.some(cellObject => cellObject.id === id_to_be_searched) || 
                newFCost < tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1].f_cost
              ) {
                //set fcost
                setFcost(row_to_be_searched, column_to_be_searched, currentNode.id);

                //set parent of neighbour to current


                //if neighbour is not in open
                if (!openList.some(cellObject => cellObject.id === id_to_be_searched)) {
                  // add neighbour to open
                  openList.push(tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1]);
                } else { //update cellObject in openList if new path to neighbour is shorter
                  openList.splice(openList.findIndex(cellObject => cellObject.id === id_to_be_searched), 1, tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1]);
                }
                
              }
            }
          }
        }
      }
    }
  }

  function startSearchIterative() { // stop after every step

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

  console.log(gridStructureArray);

  let cells = [];
  for (let row = 1; row <= gridSize; row++) {
    for (let column = 1; column <= gridSize; column++) {
      const id = `${row}-${column}`;
      const cellObject = gridStructureArray[row - 1][column - 1];
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
          gCost={cellObject.g_cost ? cellObject.g_cost : ""}
          hCost={cellObject.h_cost ? cellObject.h_cost : ""}
          fCost={cellObject.f_cost ? cellObject.f_cost : ""}
          open={openNodes.some(nodeObject => nodeObject.id === id)}
          closed={closedNodes.some(nodeObject => nodeObject.id === id)}
          shortestPath={shortestPath.includes(id)}
          parentIndicator={findParentIndicator(row, column)}
        />
      );
    }
  }

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
