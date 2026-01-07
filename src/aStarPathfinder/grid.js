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
  gridStructureArray,
  algorithm,
  gridIndex,
  gridSnapshotsRef,
  setGridSnapshot,
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
  const [snapshotIndex, setSnapshotIndex] = useState(0);
  const autoplayerRef = useRef(null);
  

console.log(gridStructureArray)
  
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


/*
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

  function resetSnapshotsOfgridStructureArray() {
    snapshotsOfgridStructureArray.length = 0;
  }

  

  function setParent(row, column, currentNodeId, tempGridStructureArray) { //set parent for neighbour
    const id = `${row}-${column}`;

    return tempGridStructureArray.map((rowArray, rowIndex) => {
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
  }

  function breadthFirstSearch() {
    //BFS uses 4 directional movement (no diagonal travel)
    //unweighted graph, cannot compare to astar
    //queue is FIFO first in first out

    startTimer();
    resetSnapshotsOfgridStructureArray();

    let tempGridStructureArray = [...gridStructureArray]; //still points to the gridStructureArray object, it still can be mutated, hence need to create a new copy and replace!
    const queue = [];
    const visitedList = [];

    const startNodeID = startCell;
    const [startNodeRow, startNodeColumn] = startNodeID.split("-");

    const endNodeID = endCell;
    const [endNodeRow, endNodeColumn] = endNodeID.split("-");

    let currentNode;

    queue.push(tempGridStructureArray[startNodeRow - 1][startNodeColumn - 1]); //add startNode to queue

    function takeGridSnapshot() {
      snapshotsOfgridStructureArray.push({
        currentCell: currentNode.id,
        gridStructureArray: tempGridStructureArray,
        openNodes: [...queue],
        closedNodes: [...visitedList]
      });
    }

    while (true) {
      currentNode = queue[0];
      console.log(currentNode)
      visitedList.push(queue[0]); //add first element to visited list
      queue.shift(); //remove first element

      //if unreachable or no more available nodes
      if(!currentNode) {
        window.alert("End Node is unreachable");
        break;
      }

      const [current_row, current_column] = currentNode.id.split("-");

      takeGridSnapshot();

      //if end node is found
      if (currentNode.id === endNodeID) {
        stopTimer();
        setGridStructureArray(tempGridStructureArray);
        setOpenNodes(queue)
        setClosedNodes(visitedList);
        setShortestPath([...tempGridStructureArray[endNodeRow - 1][endNodeColumn - 1].pathFromStartingNode]);
        setSearched(true);
        break;
      }

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
          wallCellArray.includes(id_to_be_searched) ||
          visitedList.some(cellObject => cellObject.id === id_to_be_searched) ||
          queue.some(cellObject => cellObject.id === id_to_be_searched)
        )
          return;
        
        queue.push(tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1]);

        //set parent
        tempGridStructureArray = setParent(row_to_be_searched, column_to_be_searched, currentNode.id, tempGridStructureArray);

        takeGridSnapshot();
      })
    }
  }

  function depthFirstSearch() {
    //DFS uses 4 directional movement (no diagonal travel)
    //unweighted graph, cannot compare to astar
    //uses a stack (Last In First Out)

    startTimer();
    resetSnapshotsOfgridStructureArray();

    let tempGridStructureArray = [...gridStructureArray]; //still points to the gridStructureArray object, it still can be mutated, hence need to create a new copy and replace!
    const stack = [];
    const visitedList = [];

    const startNodeID = startCell;
    const [startNodeRow, startNodeColumn] = startNodeID.split("-");

    const endNodeID = endCell;
    const [endNodeRow, endNodeColumn] = endNodeID.split("-");

    let currentNode;

    stack.push(tempGridStructureArray[startNodeRow - 1][startNodeColumn - 1]); //add startNode to stack

    function takeGridSnapshot() {
      snapshotsOfgridStructureArray.push({
        currentCell: currentNode.id,
        gridStructureArray: tempGridStructureArray,
        openNodes: [...stack],
        closedNodes: [...visitedList]
      });
    }

    while (true) {
      currentNode = stack[stack.length - 1]; //(Last In First Out)
      visitedList.push(stack[stack.length - 1]);
      stack.pop();

      //if unreachable or no more available nodes
      if(!currentNode) {
        window.alert("End Node is unreachable");
        break;
      }

      const [current_row, current_column] = currentNode.id.split("-");

      takeGridSnapshot();

      //if end node is found
      if (currentNode.id === endNodeID) {
        stopTimer();
        setGridStructureArray(tempGridStructureArray);
        setOpenNodes(stack)
        setClosedNodes(visitedList);
        setShortestPath([...tempGridStructureArray[endNodeRow - 1][endNodeColumn - 1].pathFromStartingNode]);
        setSearched(true);
        break;
      }

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
          wallCellArray.includes(id_to_be_searched) ||
          visitedList.some(cellObject => cellObject.id === id_to_be_searched) ||
          stack.some(cellObject => cellObject.id === id_to_be_searched)
        )
          return;
        
        stack.push(tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1]);

        //set parent
        tempGridStructureArray = setParent(row_to_be_searched, column_to_be_searched, currentNode.id, tempGridStructureArray);

        takeGridSnapshot();
      })
    }
  }

  function dijkstrasSearch() {//uses min-heap priority queue (FIFO)
    startTimer();
    resetSnapshotsOfgridStructureArray();

    let tempGridStructureArray = [...gridStructureArray]; //still points to the gridStructureArray object, it still can be mutated, hence need to create a new copy and replace!
    let queue = []; //min-heap priority queue (FIFO)
    let closedList = []; //visited nodes

    const startNodeID = startCell;
    const [startNodeRow, startNodeColumn] = startNodeID.split("-");

    const endNodeID = endCell;
    const [endNodeRow, endNodeColumn] = endNodeID.split("-");

    let currentNode;

    queue.push(gridStructureArray[startNodeRow - 1][startNodeColumn - 1]); //[{id: , a_cost: , path: [first,..] }, ]
    
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
    
    function getAcost(row, column, currentNodeId) {
      let [currentNodeRow, currentNodeColumn] = currentNodeId.split("-").map((e)=>parseInt(e));
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

    function setAcost(row, column, currentNodeId) {
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

      const newAcost = getAcost(row, column, currentNodeId);
      tempGridStructureArray[row - 1][column - 1].a_cost = newAcost;
    }

    function takeGridSnapshot() {
      snapshotsOfgridStructureArray.push({
        currentCell: currentNode.id,
        gridStructureArray: tempGridStructureArray,
        openNodes: [...queue],
        closedNodes: [...closedList]
      });
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
        setGridStructureArray(tempGridStructureArray);
        console.log("Not possible to reach end Node");
        window.alert("Not possible to reach end Node");
        break;
      }

      takeGridSnapshot();//add snapshot for the iteration feature

      //if end node is found
      if (currentNode.id === endNodeID) {
        stopTimer();
        setGridStructureArray(tempGridStructureArray);
        setOpenNodes(queue);
        setClosedNodes(closedList);
        setShortestPath([...tempGridStructureArray[endNodeRow - 1][endNodeColumn - 1].pathFromStartingNode]);
        setSearched(true);
        break;
      }


      const [current_row, current_column] = currentNode.id.split("-");

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
                wallCellArray.includes(id_to_be_searched) ||
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

                  takeGridSnapshot();//add snapshot for the iteration feature
                } else { //update cellObject in openList if new path to neighbour is shorter
                  heapDelete(queue, id_to_be_searched);
                  heapInsert(queue, tempGridStructureArray[row_to_be_searched - 1][column_to_be_searched - 1]);

                  takeGridSnapshot();//add snapshot for the iteration feature
                }
              } 
            }
          }
        }
      }
    }
  }

  

  console.log(gridStructureArray);

  searchAlgorithmFunctionsRef.current = {
    astarSearch: astarSearch,
    dijkstrasSearch: dijkstrasSearch,
    breadthFirstSearch: breadthFirstSearch,
    depthFirstSearch: depthFirstSearch
  }
*/
  function nextIteration(autoplay, autoplaySpeed) {
    // if(autoplaySpeed === undefined) clearTimeout(autoplayerRef.current)

    setGridSnapshot(gridIndex, snapshotIndex)

    if (snapshotIndex === gridSnapshots.length - 1) {
      setSnapshotIndex(0);
    } else {
      setSnapshotIndex(snapshotIndex + 1);

      // if (autoplay) {
      //   autoplayerRef.current = setTimeout(() => document.getElementById("play").click(), autoplaySpeed);
      // } 
    }
    // setTimeout(() => flushSync(()=>{console.log("d");setGridStructureArray(snapshotsOfgridStructureArray[snapshotIndex].gridStructureArray);setSnapshotIndex(snapshotIndex + 1);nextIteration()}), 100)
  }


  return (
    <>
      <div
        id="grid"
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
                // parentIndicator={findParentIndicator(row, column)}
                currentCell={cellObject.isCurrent}
              />
            )
          })
        })}
      </div>
      <div id="play" onClick={() => nextIteration(true, 30)} className={completedSearch ? "" : "hidden"}>
        Play
      </div>
      <div id="next" onClick={() => nextIteration(false)} className={completedSearch ? "" : "hidden"}>
        Next
      </div>
      <div id="iterationStatus" className={completedSearch ? "" : "hidden"}>
        {snapshotIndex + 1} / {gridSnapshots[gridIndex].length}
      </div>
      <div id="timer" className={completedSearch ? "" : "hidden"}>
        Completed in: {searchTime}ms
      </div>
    </>
  );
}
