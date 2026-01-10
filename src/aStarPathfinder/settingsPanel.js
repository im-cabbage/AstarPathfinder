import { useState, useRef } from "react";
import Grid from "./grid";

class CellObject {
  id;
  row;
  column;
  g_cost;
  h_cost;
  f_cost;
  a_cost = -1; //-1 to represent infinity for accumulated cost for dijkstra's
  pathFromStartingNode = []; // contains IDs of all child nodes
  parentID;
  cellType; // start, end, wall, open, visited, shortestPath
  isCurrent = false;

  constructor(id, a_cost, g_cost, h_cost, f_cost, cellType, pathFromStartingNode, isCurrent) {
    this.id = id;
    this.row = id.split("-")[0];
    this.column = id.split("-")[1];

    if (a_cost) this.a_cost = a_cost;
    if (g_cost) this.g_cost = g_cost;
    if (h_cost) this.h_cost = h_cost;
    if (h_cost) this.f_cost = f_cost;
    if (cellType) this.cellType = cellType;
    if (pathFromStartingNode) this.pathFromStartingNode = pathFromStartingNode;
    if (isCurrent) this.isCurrent = isCurrent;
  }
}

function initGridStructureArray(gridSize) {
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

class GridObject {
  algorithm;
  completedSearch = false;
  snapshotIndex = -1;
  searchTime;

  gridStructureArray = [];

  constructor(gridSize, algorithm, newGridStructureArray, completedSearch, searchTime, snapshotIndex) {
    this.algorithm = algorithm;

    if (newGridStructureArray) {
      this.gridStructureArray = newGridStructureArray;
    } else {
      this.gridStructureArray = initGridStructureArray(gridSize);
    }

    if (completedSearch) {
      this.completedSearch = completedSearch;
      this.searchTime = searchTime;
      if (snapshotIndex !== undefined) {
        this.snapshotIndex = snapshotIndex;
      }
    }
  }
}



export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    gridSize: 10,
    cellTypeSelector: "",
  });
  const [startNodeID, setStartNodeID] = useState("");
  const [endNodeID, setEndNodeID] = useState("");
  const [wallNodesIDArray, setWallNodesIDArray] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("astar");
  const gridSnapshotsRef = useRef([]);
  const gridSnapshots = gridSnapshotsRef.current;
  const autoplayersRef = useRef([null]);
  const autoplayers = autoplayersRef.current;
  const [grids, setGrids] = useState(() => initGrids());
  let searchTimeStart;
  const [startNodeRow, startNodeColumn] = startNodeID.split("-");
  const [endNodeRow, endNodeColumn] = endNodeID.split("-");

  function initGrids() {
    gridSnapshotsRef.current = [[]];
    autoplayersRef.current = [[]];

    return [new GridObject(settings.gridSize, selectedAlgorithm)];
  }

  

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

  //get back
  function handleChangeAlgorithm(newAlgorithm) {
    setSelectedAlgorithm(newAlgorithm);
    setGrids(grids.map((grid, gridIndex) => {
      if (gridIndex === 0) {
        return new GridObject(grid.gridSize, newAlgorithm, grid.gridStructureArray, grid.completedSearch, grid.searchTime);
      } else {
        return grid;
      }
    }))
  }

  function isOppositeDiagonalWall(current_row, current_column, row_to_be_searched, column_to_be_searched, searchedRow, searchedColumn) {
    //can only be opposite diagonal wall if neighbour is a corner node
    if (row_to_be_searched == current_row || column_to_be_searched == current_column) { // if not corner node, return false
      return false;
    } else { // if corner node
      current_row = parseInt(current_row);
      current_column = parseInt(current_column);

      if (searchedRow === -1 && searchedColumn === -1) { //if top left
        if (wallNodesIDArray.includes(`${current_row - 1}-${current_column}`) && wallNodesIDArray.includes(`${current_row}-${current_column - 1}`)) {
          return true;
        } else {
          return false;
        }
      }
      if (searchedRow === -1 && searchedColumn === 1) { //if top right
        if (wallNodesIDArray.includes(`${current_row - 1}-${current_column}`) && wallNodesIDArray.includes(`${current_row}-${current_column + 1}`)) {
          return true;
        } else {
          return false;
        }
      }
      if (searchedRow === 1 && searchedColumn === 1) { //if bottom right
        if (wallNodesIDArray.includes(`${current_row + 1}-${current_column}`) && wallNodesIDArray.includes(`${current_row}-${current_column + 1}`)) {
          return true;
        } else {
          return false;
        }
      }
      if (searchedRow === 1 && searchedColumn === -1) { //if bottom left
        if (wallNodesIDArray.includes(`${current_row + 1}-${current_column}`) && wallNodesIDArray.includes(`${current_row}-${current_column - 1}`)) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  function getDeepCopyTempGridStructureArray(tempGridStructureArray) {
    return JSON.parse(JSON.stringify(tempGridStructureArray));
  }

  function takeGridSnapshot(gridIndex, gridStructureArray) {
    const newGridStructureArray = getDeepCopyTempGridStructureArray(gridStructureArray);
    gridSnapshots[gridIndex].push(newGridStructureArray);
  }

  function resetGridSnapshot(gridIndex) {
    gridSnapshots[gridIndex] = [];
  }

  function setGrid(gridIndexParam, newGridStructureArray, searchTime) {
    const completedSearch = true;

    setGrids(grids.map((grid, gridIndex) => {
      if (gridIndex === gridIndexParam) {
        return new GridObject(grid.gridSize, grid.algorithm, newGridStructureArray, completedSearch, searchTime);
      } else {
        return grid;
      }
    }))
  }

  function updateTempGridStructureArray( tempGridStructureArray, isSearchCompleted, openList, visitedList, currentNode) {
    openList.forEach((cellObject) => {
      const row = cellObject.row;
      const column = cellObject.column;

      tempGridStructureArray[row - 1][column - 1].cellType = "open";
    })

    visitedList.forEach((cellObject) => {
      const row = cellObject.row;
      const column = cellObject.column;

      tempGridStructureArray[row - 1][column - 1].cellType = "closed";
      tempGridStructureArray[row - 1][column - 1].isCurrent = false;
    })

    if (isSearchCompleted) {
      const endNodePathFromStartingNode = tempGridStructureArray[endNodeRow - 1][endNodeColumn - 1].pathFromStartingNode; //used for finding shortestPath
      endNodePathFromStartingNode.forEach((id) => {
        const [row, column] = id.split("-");

        tempGridStructureArray[row - 1][column - 1].cellType = "shortestPath";
      })
    }

    tempGridStructureArray[currentNode.row - 1][currentNode.column - 1].isCurrent = true;
  }

  function astarSearch(gridIndex) {
    // G cost: distance from starting node
    // H cost: distance from end node (Heuristic)
    // F cost: G + H (chooses lowest F cost)

    // OPEN cell = queued to be searched
    // CLOSED cell = visited already
    
    startTimer();
    resetGridSnapshot(gridIndex);

    let isSearchCompleted = false;
    let tempGridStructureArray = initGridStructureArray(settings.gridSize);
    let openList = [];
    let closedList = [];

    let currentNode;

    openList.push(tempGridStructureArray[startNodeRow - 1][startNodeColumn - 1]); //openlist = [{id: , f_cost: , path: [first,..] }, ]

    function minHeapify(arr, heapSize, i) {
      let l = 2*i + 1;
      let r = 2*i + 2;

      let smallest = i;

      if (l < heapSize && arr[l].f_cost <= arr[smallest].f_cost) { // If left child exists and is smaller than root
        if (arr[l].f_cost < arr[smallest].f_cost) {
          smallest = l;
        } else { //if same fCost, lower hCost is smaller 
          if (arr[l].h_cost < arr[smallest].h_cost) {
            smallest = l;
          }
        }
      }

      if (r < heapSize && arr[r].f_cost <= arr[smallest].f_cost) { // If left child exists and is smaller than root
        if (arr[r].f_cost < arr[smallest].f_cost) {
          smallest = r;
        } else { //if same fCost, lower hCost is smaller 
          if (arr[r].h_cost < arr[smallest].h_cost) {
            smallest = r;
          }
        }
      }

      // If smallest is not root, 
      // swap and recursively heapify
      if (smallest !== i) {
        let temp = arr[i];
        arr[i] = arr[smallest];
        arr[smallest] = temp;
      
        minHeapify(arr, heapSize, smallest);
      }
    }

    function buildMinHeap(arr) {
      let heapSize = arr.length;

      //formula to get leaf node: arr[floor(heapSize/2)] to arr[heapSize - 1]
      //perform heapify from last non-leaf node up to root 
      for(let i = Math.floor(heapSize / 2) - 1 ; i >= 0; i--) {
        minHeapify(arr, heapSize, i);
      }
    }

    function heapInsert(heap, value) {
      heap.push(value); // Add the new element to the end of the heap

      buildMinHeap(heap);
    }

    function heapDeleteMin(heap) {
      heap[0] = heap[heap.length - 1];
      heap.pop();

      buildMinHeap(heap);
    }

    function heapDelete(heap, id) {
      // Find the index of the element to be deleted
      let index = -1;
      for (let i = 0; i < heap.length; i++) {
          if (heap[i].id === id) {
              index = i;
              break;
          }
      }

      // Replace the element to be deleted with the last element
      heap[index] = heap[heap.length - 1];
      
      heap.pop();

      buildMinHeap(heap);
    }

    function getGcost(row, column, parentNodeID) { // G cost: distance from starting node using path array

      //if new path to neighbour is shorter, use parents path
      let pathFromStartingNode = tempGridStructureArray[row - 1][column - 1].pathFromStartingNode;
      const parentNode = pathFromStartingNode[pathFromStartingNode.length - 1];
      
      if (parentNode !== parentNodeID) {
        const [parentNodeRow, parentNodeColumn] = parentNodeID.split("-");
        const parentNodePathFromStartingNode = tempGridStructureArray[parentNodeRow - 1][parentNodeColumn - 1].pathFromStartingNode;
        pathFromStartingNode = [...parentNodePathFromStartingNode, parentNodeID];
      }
      
      if (pathFromStartingNode.length === 1) { //only contains startNode
        if (row == startNodeRow || column == startNodeColumn) { //straight
          return 10;
        } else { //diagonal
          return 14;
        }
      } else {
        return pathFromStartingNode.reduceRight((totalPathCost, parentNodeID, currentNodeIndex) => {
          //get row n col of parent
          //straight or diagonal?

          let [currentNodeRow, currentNodecolumn] = parentNodeID.split("-");

          let parentNode;
          
          if (parentNodeID === startNodeID) { //skip if startNode
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

    function getCosts(row, column, parentNodeID) { // returns an array [f_cost, g_cost, h_cost]
      const g_cost = getGcost(row, column, parentNodeID);
      const h_cost = getHcost(row, column);
      const f_cost = g_cost + h_cost;
      return [f_cost, g_cost, h_cost];
    }

    function setCosts(row, column, parentNodeID) { //set f_cost, g_cost, h_cost for neighbour
      //add parentNode as parent into pathFromStartingNode before calling getGcost func
      const currentNode = tempGridStructureArray[row - 1][column - 1];
      const [ parentRow, parentColumn ] = parentNodeID.split("-");
      const parentNodePathFromStartingNode = tempGridStructureArray[parentRow - 1][parentColumn - 1].pathFromStartingNode;
      currentNode.pathFromStartingNode = [...parentNodePathFromStartingNode, parentNodeID];

      const [fCost, gCost, hCost] = getCosts(row, column, parentNodeID);

      currentNode.g_cost = gCost;
      currentNode.h_cost = hCost;
      currentNode.f_cost = fCost;
    }

    while (true) {
      buildMinHeap(openList);
      currentNode = openList[0];

      if (currentNode !== undefined) {
        closedList.push(currentNode);
        heapDeleteMin(openList);
      }

      //if no possible path to endNode
      if (!currentNode) {
        setGrid(gridIndex, tempGridStructureArray);
        console.log("Not possible to reach end Node");
        window.alert("Not possible to reach end Node");
        break;
      }

      updateTempGridStructureArray(tempGridStructureArray, isSearchCompleted, openList, closedList, currentNode);
      takeGridSnapshot(gridIndex, tempGridStructureArray); //add snapshot for the iteration feature

      //if end node is found
      if (currentNode.id === endNodeID) {
        isSearchCompleted = true;
        updateTempGridStructureArray(tempGridStructureArray, isSearchCompleted, openList, closedList, currentNode);
        takeGridSnapshot(gridIndex, tempGridStructureArray); //add snapshot for the iteration feature
        setGrid(gridIndex, tempGridStructureArray, getSearchTime());
        break;
      }


      const [current_row, current_column] = currentNode.id.split("-");
      const gridSize = settings.gridSize;

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
              //is Opposite Diagonal Wall / no crossing diagonal walls
              if (
                wallNodesIDArray.includes(id_to_be_searched) ||
                closedList.some(cellObject => cellObject.id === id_to_be_searched) ||
                isOppositeDiagonalWall(current_row, current_column, row_to_be_searched, column_to_be_searched, i, j)
              )
                continue;

              //if neighbour is not in open or new path to neighbour is shorter , set fcost
              const newFCost = getCosts(row_to_be_searched, column_to_be_searched, currentNode.id)[0];
              
              if (
                !openList.some(cellObject => cellObject.id === id_to_be_searched) || 
                newFCost < tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1].f_cost
              ) {
                setCosts(row_to_be_searched, column_to_be_searched, currentNode.id);//set costs

                //if neighbour is not in open
                if (!openList.some(cellObject => cellObject.id === id_to_be_searched)) {
                  heapInsert(openList, tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1]);// add neighbour to open
                } else { //update cellObject in openList if new path to neighbour is shorter
                  heapDelete(openList, id_to_be_searched);
                  heapInsert(openList, tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1]);
                }

                updateTempGridStructureArray(tempGridStructureArray, isSearchCompleted, openList, closedList, currentNode);
                takeGridSnapshot(gridIndex, tempGridStructureArray); //add snapshot for the iteration feature
              } 
            }
          }
        }
      }
    }
  }

  function dijkstrasSearch(gridIndex) { //uses min-heap priority queue (FIFO)
    startTimer();
    resetGridSnapshot(gridIndex);

    let isSearchCompleted = false;
    let tempGridStructureArray = initGridStructureArray(settings.gridSize);
    let queue = [];
    let closedList = [];

    let currentNode;

    queue.push(tempGridStructureArray[startNodeRow - 1][startNodeColumn - 1]); //[{id: , a_cost: , path: [first,..] }, ]
    
    function minHeapify(arr, heapSize, i) {
      let l = 2*i + 1;
      let r = 2*i + 2;

      let smallest = i;

      if (l < heapSize && arr[l].a_cost <= arr[smallest].a_cost) { // If left child exists and is smaller than root
        if (arr[l].a_cost < arr[smallest].a_cost) {
          smallest = l;
        } else { //if same aCost, smaller row/col is smaller 
          if (arr[l].row <= arr[smallest].row) {
            if (arr[l].row < arr[smallest].row) {
              smallest = l;
            } else { //if same row, lower col is smaller
              if (arr[l].column < arr[smallest].column) {
                smallest = l;
              }
            }
          }
        }
      }

      if (r < heapSize && arr[r].a_cost <= arr[smallest].a_cost) { // If left child exists and is smaller than root
        if (arr[r].a_cost < arr[smallest].a_cost) {
          smallest = r;
        } else { //if same aCost, smaller row/col is smaller 
          if (arr[r].row <= arr[smallest].row) {
            if (arr[r].row < arr[smallest].row) {
              smallest = r;
            } else { //if same row, lower col is smaller
              if (arr[r].column < arr[smallest].column) {
                smallest = r;
              }
            }
          }
        }
      }

      // If smallest is not root, 
      // swap and recursively heapify
      if (smallest !== i) {
        let temp = arr[i];
        arr[i] = arr[smallest];
        arr[smallest] = temp;
      
        minHeapify(arr, heapSize, smallest);
      }
    }

    function buildMinHeap(arr) {
      let heapSize = arr.length;

      //formula to get leaf node: arr[floor(heapSize/2)] to arr[heapSize - 1]
      //perform heapify from last non-leaf node up to root 
      for(let i = Math.floor(heapSize / 2) - 1 ; i >= 0; i--) {
        minHeapify(arr, heapSize, i);
      }
    }

    function heapInsert(heap, value) {
      heap.push(value); // Add the new element to the end of the heap

      buildMinHeap(heap);
    }

    function heapDeleteMin(heap) {
      heap[0] = heap[heap.length - 1];
      heap.pop();

      buildMinHeap(heap);
    }

    function heapDelete(heap, id) {
      // Find the index of the element to be deleted
      let index = -1;
      for (let i = 0; i < heap.length; i++) {
          if (heap[i].id === id) {
              index = i;
              break;
          }
      }

      // Replace the element to be deleted with the last element
      heap[index] = heap[heap.length - 1];
      
      heap.pop();

      buildMinHeap(heap);
    }
    
    function getAcost(row, column, parentNodeId) {
      let [currentNodeRow, currentNodeColumn] = parentNodeId.split("-").map((e)=>parseInt(e));
      const currentNodeAcost = tempGridStructureArray[currentNodeRow - 1][currentNodeColumn - 1].a_cost;

      if (row === currentNodeRow || column === currentNodeColumn) { //if straight path, add 10 to a_cost
        if (currentNodeAcost === -1) {
          return 10;
        } else {
          return currentNodeAcost + 10;
        }
      } else { //if diagonal path, add 14 to a_cost
        if (currentNodeAcost === -1) {
          return 14;
        } else {
          return currentNodeAcost + 14;
        }
      }
    }

    function setAcost(row, column, parentNodeID) {
      const currentNode = tempGridStructureArray[row - 1][column - 1];
      const [ parentRow, parentColumn ] = parentNodeID.split("-");
      const parentNodePathFromStartingNode = tempGridStructureArray[parentRow - 1][parentColumn - 1].pathFromStartingNode;
      currentNode.pathFromStartingNode = [...parentNodePathFromStartingNode, parentNodeID];

      currentNode.a_cost = getAcost(row, column, parentNodeID);
    }

    while (true) {
      buildMinHeap(queue);
      currentNode = queue[0];

      if (currentNode !== undefined) {
        closedList.push(currentNode);
        heapDeleteMin(queue);
      }

      //if no possible path to endNode
      if (!currentNode) {
        setGrid(gridIndex, tempGridStructureArray);
        console.log("Not possible to reach end Node");
        window.alert("Not possible to reach end Node");
        break;
      }

      updateTempGridStructureArray(tempGridStructureArray, isSearchCompleted, queue, closedList, currentNode);
      takeGridSnapshot(gridIndex, tempGridStructureArray); //add snapshot for the iteration feature

      //if end node is found
      if (currentNode.id === endNodeID) {
        isSearchCompleted = true;
        updateTempGridStructureArray(tempGridStructureArray, isSearchCompleted, queue, closedList, currentNode);
        takeGridSnapshot(gridIndex, tempGridStructureArray); //add snapshot for the iteration feature
        setGrid(gridIndex, tempGridStructureArray, getSearchTime());
        break;
      }


      const [current_row, current_column] = currentNode.id.split("-");
      const gridSize = settings.gridSize;

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
              //is Opposite Diagonal Wall / no crossing diagonal walls
              if (
                wallNodesIDArray.includes(id_to_be_searched) ||
                closedList.some(cellObject => cellObject.id === id_to_be_searched) ||
                isOppositeDiagonalWall(current_row, current_column, row_to_be_searched, column_to_be_searched, i, j)
              )
                continue;

              //if neighbour is not in open or new path to neighbour is shorter , set acost
              const newAcost = getAcost(row_to_be_searched, column_to_be_searched, currentNode.id);
              
              if (
                !queue.some(cellObject => cellObject.id === id_to_be_searched) || 
                newAcost < tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1].a_cost
              ) {
                setAcost(row_to_be_searched, column_to_be_searched, currentNode.id);//set acost

                //if neighbour is not in open
                if (!queue.some(cellObject => cellObject.id === id_to_be_searched)) {
                  heapInsert(queue, tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1]);// add neighbour to open
                } else { //update cellObject in openList if new path to neighbour is shorter
                  heapDelete(queue, id_to_be_searched);
                  heapInsert(queue, tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1]);
                }

                updateTempGridStructureArray(tempGridStructureArray, isSearchCompleted, queue, closedList, currentNode);
                takeGridSnapshot(gridIndex, tempGridStructureArray); //add snapshot for the iteration feature
              } 
            }
          }
        }
      }
    }
  }

  function breadthFirstSearch(gridIndex) {
    //BFS uses 4 directional movement (no diagonal travel)
    //unweighted graph, cannot compare to astar
    //queue is FIFO first in first out

    startTimer();
    resetGridSnapshot(gridIndex);

    let isSearchCompleted = false;
    let tempGridStructureArray = initGridStructureArray(settings.gridSize);
    let queue = [];
    let visitedList = [];

    let currentNode;

    queue.push(tempGridStructureArray[startNodeRow - 1][startNodeColumn - 1]); //[{id: , a_cost: , path: [first,..] }, ]

    while (true) {
      currentNode = queue[0];
      visitedList.push(queue[0]); //add first element to visited list
      queue.shift(); //remove first element

      //if no possible path to endNode
      if (!currentNode) {
        setGrid(gridIndex, tempGridStructureArray);
        console.log("Not possible to reach end Node");
        window.alert("Not possible to reach end Node");
        break;
      }

      updateTempGridStructureArray(tempGridStructureArray, isSearchCompleted, queue, visitedList, currentNode);
      takeGridSnapshot(gridIndex, tempGridStructureArray); //add snapshot for the iteration feature

      //if end node is found
      if (currentNode.id === endNodeID) {
        isSearchCompleted = true;
        updateTempGridStructureArray(tempGridStructureArray, isSearchCompleted, queue, visitedList, currentNode);
        takeGridSnapshot(gridIndex, tempGridStructureArray); //add snapshot for the iteration feature
        setGrid(gridIndex, tempGridStructureArray, getSearchTime());
        break;
      }

      const [current_row, current_column] = currentNode.id.split("-");
      const gridSize = settings.gridSize;

      const array_of_neighbour_coords_to_be_searched = [ [-1,0] , [0,1] , [1,0] , [0,-1] ]; //[row, col] check top, right, bottom, left in order

      // eslint-disable-next-line no-loop-func
      array_of_neighbour_coords_to_be_searched.forEach((coordinate_to_be_searched) => {
        const [coordinate_to_be_searched_row, coordinate_to_be_searched_column] = coordinate_to_be_searched;
        const row_to_be_searched = parseInt(current_row) + coordinate_to_be_searched_row;
        const column_to_be_searched = parseInt(current_column) + coordinate_to_be_searched_column;

        const id_to_be_searched = `${row_to_be_searched}-${column_to_be_searched}`;

        if (row_to_be_searched <= 0 || row_to_be_searched > gridSize) return
        if (column_to_be_searched <= 0 || column_to_be_searched > gridSize) return

        //skip if neighbour is a wall, is in visitedList or already in queue
        if (
          wallNodesIDArray.includes(id_to_be_searched) ||
          visitedList.some(cellObject => cellObject.id === id_to_be_searched) ||
          queue.some(cellObject => cellObject.id === id_to_be_searched)
        )
          return;
        
        queue.push(tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1]);

        updateTempGridStructureArray(tempGridStructureArray, isSearchCompleted, queue, visitedList, currentNode);
        takeGridSnapshot(gridIndex, tempGridStructureArray); //add snapshot for the iteration feature
      })
    }
  }

  function depthFirstSearch(gridIndex) {
    //DFS uses 4 directional movement (no diagonal travel)
    //unweighted graph, cannot compare to astar
    //uses a stack (Last In First Out)

    startTimer();
    resetGridSnapshot(gridIndex);

    let isSearchCompleted = false;
    let tempGridStructureArray = initGridStructureArray(settings.gridSize);
    const stack = [];
    const visitedList = [];

    let currentNode;

    stack.push(tempGridStructureArray[startNodeRow - 1][startNodeColumn - 1]); //add startNode to stack

    while (true) {
      currentNode = stack[stack.length - 1]; //(Last In First Out)
      visitedList.push(stack[stack.length - 1]);
      stack.pop();

      //if no possible path to endNode
      if (!currentNode) {
        setGrid(gridIndex, tempGridStructureArray);
        console.log("Not possible to reach end Node");
        window.alert("Not possible to reach end Node");
        break;
      }

      updateTempGridStructureArray(tempGridStructureArray, isSearchCompleted, stack, visitedList, currentNode);
      takeGridSnapshot(gridIndex, tempGridStructureArray); //add snapshot for the iteration feature

      //if end node is found
      if (currentNode.id === endNodeID) {
        isSearchCompleted = true;
        updateTempGridStructureArray(tempGridStructureArray, isSearchCompleted, stack, visitedList, currentNode);
        takeGridSnapshot(gridIndex, tempGridStructureArray); //add snapshot for the iteration feature
        setGrid(gridIndex, tempGridStructureArray, getSearchTime());
        break;
      }

      const [current_row, current_column] = currentNode.id.split("-");
      const gridSize = settings.gridSize;

      const array_of_neighbour_coords_to_be_searched = [ [0,-1] , [1,0] , [0,1] , [-1,0] ]; //[row, col] check left, bottom, right, top in order (reversed from BFS)

      // eslint-disable-next-line no-loop-func
      array_of_neighbour_coords_to_be_searched.forEach((coordinate_to_be_searched) => {
        const [coordinate_to_be_searched_row, coordinate_to_be_searched_column] = coordinate_to_be_searched;
        const row_to_be_searched = parseInt(current_row) + coordinate_to_be_searched_row;
        const column_to_be_searched = parseInt(current_column) + coordinate_to_be_searched_column;

        const id_to_be_searched = `${row_to_be_searched}-${column_to_be_searched}`;

        if (row_to_be_searched <= 0 || row_to_be_searched > gridSize) return
        if (column_to_be_searched <= 0 || column_to_be_searched > gridSize) return

        //skip if neighbour is a wall, is in visitedList or already in stack
        if (
          wallNodesIDArray.includes(id_to_be_searched) ||
          visitedList.some(cellObject => cellObject.id === id_to_be_searched) ||
          stack.some(cellObject => cellObject.id === id_to_be_searched)
        )
          return;
        
        stack.push(tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1]);

        updateTempGridStructureArray(tempGridStructureArray, isSearchCompleted, stack, visitedList, currentNode);
        takeGridSnapshot(gridIndex, tempGridStructureArray); //add snapshot for the iteration feature
      })
    }
  }

  function startTimer() {
    searchTimeStart = performance.now();
  }

  function getSearchTime() {
    return (performance.now() - searchTimeStart).toFixed(2);
  }

  function setGridSnapshot(gridIndexParam, initialSnapshotIndex, autoplay, autoplaySpeed) {
    let gridStructureArray = gridSnapshots[gridIndexParam][initialSnapshotIndex];
    let snapshotIndex = initialSnapshotIndex;
    
    function callSetGrids() {
      setGrids((grids) => grids.map((grid, gridIndex) => {
        if (gridIndex === gridIndexParam) {
          return new GridObject(grid.gridSize, grid.algorithm, gridStructureArray, grid.completedSearch, grid.searchTime, snapshotIndex);
        } else {
          return grid;
        }
      }))
    }

    function clearAutoplayer(gridIndexParam) {
      clearInterval(autoplayers[gridIndexParam]);
      autoplayers[gridIndexParam] = null;
    }

    if (autoplay) {
      autoplayers[gridIndexParam] = setInterval(() => {
        if (snapshotIndex === gridSnapshots[gridIndexParam].length - 2) {
          clearAutoplayer(gridIndexParam);
        }

        snapshotIndex = snapshotIndex + 1;

        if (snapshotIndex === gridSnapshots[gridIndexParam].length) {
          snapshotIndex = 0;
        }

        gridStructureArray = gridSnapshots[gridIndexParam][snapshotIndex];
        callSetGrids();
      }, autoplaySpeed);
    } else {
      clearAutoplayer(gridIndexParam);

      if (snapshotIndex === gridSnapshots[gridIndexParam].length - 1) {
        snapshotIndex = 0;
      } else {
        snapshotIndex = snapshotIndex + 1;
      }
      
      gridStructureArray = gridSnapshots[gridIndexParam][snapshotIndex];
      callSetGrids();
    }
  }


  return (
    <>
      <div id="settingsPanel">
        <div id="cellSelector">
          <select 
            id="algorithmSelector"
            onChange={(e) =>
              handleChangeAlgorithm(e.target.value)
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
            onChange={(e) => {
              const newGridSize = e.target.value;

              setSettings({
                ...settings,
                gridSize: newGridSize,
              });

              setGrids(grids.map((grid) => {
                const algorithm = grid.algorithm;

                return new GridObject(newGridSize, algorithm);
              }))
            }}
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
              grids.forEach((gridObject, gridIndex) => {
                const gridAlgorithm = gridObject.algorithm;
                switch (gridAlgorithm) {
                  case "astar":
                    astarSearch(gridIndex);
                    break;
                  case "dijkstras":
                    dijkstrasSearch(gridIndex);
                    break;
                  case "bfs":
                    breadthFirstSearch(gridIndex);
                    break;
                  case "dfs":
                    depthFirstSearch(gridIndex);
                    break;
                  default:
                    break;
                }
              })
            }}>
            Search
          </div>
        </div>
      </div>
      
      {grids.map((gridObject, gridIndex) => {
        const gridStructureArray = gridObject.gridStructureArray;
        const algorithm = gridObject.algorithm;
        const completedSearch = gridObject.completedSearch;
        const snapshotIndex = gridObject.snapshotIndex;
        const searchTime = gridObject.searchTime;
        const autoplayer = autoplayers[gridIndex]

        return (
          <Grid 
          key={gridIndex.toString() + settings.gridSize} //using key attribute on grid resets the entire grid state when gridsize changes
          gridID={gridIndex}
          gridStructureArray={gridStructureArray}
          algorithm={algorithm}
          gridIndex={gridIndex}
          gridSnapshotsRef={gridSnapshotsRef}
          snapshotIndex={snapshotIndex}
          setGridSnapshot={setGridSnapshot}
          autoplayer={autoplayer}
          settings={settings}
          startNodeID={startNodeID}
          setStartNodeID={setStartNodeID}
          endNodeID={endNodeID}
          setEndNodeID={setEndNodeID}
          wallNodesIDArray={wallNodesIDArray}
          setWallNodesIDArray={setWallNodesIDArray}
          completedSearch={completedSearch}
          searchTime={searchTime}
          />
          )
        })
      }
    </>
  );
}
