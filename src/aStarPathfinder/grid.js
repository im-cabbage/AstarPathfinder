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
    pathFromStartingNode = [];
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

    let tempGridStructureArray = gridStructureArray;
    let openList = [];
    let closedList = [];

    const startNodeID = startCell;
    const startNodeRow = startNodeID.split("-")[0];
    const startNodeColumn = startNodeID.split("-")[1];

    const endNodeID = endCell;
    const endNodeRow = endNodeID.split("-")[0];
    const endNodeColumn = endNodeID.split("-")[1];

    openList.push(gridStructureArray[startNodeRow - 1][startNodeColumn - 1]); //openlist = [{id: , f_cost: , path: [first,..] }, ]

    
    //need to fix! temp not updated yet when called!
    function getGcost(row, column) {//path is an array of parentIDs
      // G cost: distance from starting node using path array
      
      const pathFromStartingNode = tempGridStructureArray[row - 1][column - 1].pathFromStartingNode;

      //path array empty / starting node immediate child
      if (pathFromStartingNode.length === 0) { 
        //straight
        if (row === startNodeRow || column === startNodeColumn) { 
          return 10;
          //diagonal
        } else { 
          return 14;
        }
      //path array not empty
      } else {
        return pathFromStartingNode.reduceRight((totalPathCost, currentNodeId, currentNodeIndex) => {
          //get row n col of parent
          //straight or diagonal

          let currentNodeRow = currentNodeId.split("-")[0];
          let currentNodecolumn = currentNodeId.split("-")[1];

          let parentNode;

          //if first child node after starting node
          if (currentNodeIndex === 0) {
            if (currentNodeRow === startNodeRow || currentNodecolumn === startNodeColumn) { 
              return totalPathCost + 10;
              //diagonal
            } else { 
              return totalPathCost + 14;
            }
          } else { 
            parentNode = pathFromStartingNode[currentNodeIndex - 1];
            const parentNodeRow = parentNode.split("-")[0];
            const parentNodeColumn = parentNode.split("-")[1];
            
            if (currentNodeRow === parentNodeRow || currentNodecolumn === parentNodeColumn) { 
              return totalPathCost + 10;
              //diagonal
            } else { 
              return totalPathCost + 14;
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

    function setFcost(row, column, currentNodeId) { //set f_cost for neighbour
      const id = `${row}-${column}`;
      const gCost = getGcost(row, column);
      const hCost = getHcost(row, column);
      const fCost = gCost + hCost;

      const newGridStructureArray = tempGridStructureArray.map((rowArray, rowIndex) => {
        if (rowIndex === parseInt(row) - 1) {
          const newRowArray = rowArray.map((cellObject, columnIndex) => {
            if(columnIndex === parseInt(column) - 1) {
              let newCellObject = new CellObject(cellObject.id, gCost, hCost, fCost);
              const currentNodeRow = parseInt(currentNodeId.split("-")[0]);
              const currentNodeColumn = parseInt(currentNodeId.split("-")[1]);
              const currentNodePathFromStartingNode = tempGridStructureArray[currentNodeRow - 1][currentNodeColumn - 1].pathFromStartingNode;
              
              //add currentNode as parent in pathFromStartingNode array
              if (currentNodeId !== startNodeID) {
                newCellObject.pathFromStartingNode = [...currentNodePathFromStartingNode, currentNodeId];
              }
              
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
      
      setGridStructureArray(newGridStructureArray); //setState is very slow!!
      tempGridStructureArray = newGridStructureArray; //use temporary array to store array to be used instead of gridStructureArray

      console.log(`${id} gcost: ${gCost} hcost: ${hCost} `)
      return fCost;
    }

    while (true) {
      let currentNode;
      var indexOfCurrentNode = 0;

      //find node with lowest f_cost in openlist
      if (openList.length > 1) {
        // currentNode = openList.reduce((minVal, curVal) => (curVal < minVal ? curVal : minVal), openList[0]);
        let min_f_cost = openList[0].f_cost;
        let index_min_f_cost = 0;

        for (let i = 0; i < openList.length; i++) {
          let current_f_cost = openList[i].f_cost;

          if (current_f_cost < min_f_cost) {
            min_f_cost = current_f_cost;
            index_min_f_cost = i;
          }
        }
        currentNode = openList[index_min_f_cost];
        console.log(currentNode)
        indexOfCurrentNode = index_min_f_cost;
      } else {
        currentNode = openList[0];
      }

      closedList.push(openList[indexOfCurrentNode]);
      document.getElementById(openList[indexOfCurrentNode].id).classList.remove("open"); //remove open class
      document.getElementById(openList[indexOfCurrentNode].id).classList.add("closed"); //add closed class
      openList.splice(indexOfCurrentNode, 1);
      console.log("closedList");
      console.log(closedList);
      console.log("openList")
      console.log(openList)
      console.log("currentNode");
      console.log(currentNode);

      //if end node is found
      if (currentNode.id === endNodeID) {
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

              //skip if neighbour is a wall or is in closed list
              if (
                wallCellArray.includes(id_to_be_searched) ||
                closedList.some(cellObject => cellObject.id === id_to_be_searched)
              )
                continue;

              //if new path to neighbour is shorter 
              // or neighbour is not in open, set fcost
              if (!openList.some(cellObject => cellObject.id === id_to_be_searched)) {
                //set fcost
                console.log(setFcost(row_to_be_searched, column_to_be_searched, currentNode.id));


                //set parent of neighbour to current




                //if neighbour is not in open
                if (!openList.some(cellObject => cellObject.id === id_to_be_searched)) {
                  // add neighbour to open
                  openList.push(tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1]);
                  document.getElementById(`${row_to_be_searched}-${column_to_be_searched}`).classList.add("open");
                  console.log(openList);
                }
                
              }
            }
          }
        }
      }
    }
  }

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
        />
      );
    }
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
