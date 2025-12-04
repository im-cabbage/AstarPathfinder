import { useState } from 'react';

function startSearch() {
    /*
    G cost: distance from starting node
    H cost: distance from end node (Heuristic)
    F cost: G + H (chooses lowest F cost)

    CLOSED cell = searched already
    */

    // alert("s")
    // document.getElementById('92').classList.add('start');
    // document.getElementById('19').classList.add('end');

    let openList = [];
    let closedList = [];
    const startNodeID = document.getElementsByClassName("start")[0].id;
    const startNodeRow = startNodeID.split("-")[0];
    const startNodeColumn = startNodeID.split("-")[1];
    const endNodeID = document.getElementsByClassName("end")[0].id;
    const endNodeRow = endNodeID.split("-")[0];
    const endNodeColumn = endNodeID.split("-")[1];

    // openList.push({id: startNodeID})

    function getGcost(row, column) {
      
    }

    function getHcost(row, column) {
      const columnDifference = Math.abs(endNodeColumn - column);
      const rowDifference = Math.abs(endNodeRow - row);

      //if same row / column
      if(row == endNodeRow) {
        return 10*(Math.abs(endNodeColumn - column));
      }
      if(column == endNodeColumn) {
        return 10*(Math.abs(endNodeRow - row));
      }
      //if diagonal
      if(columnDifference == rowDifference) {
        return 14*columnDifference
      }
      //if x > y
      if(columnDifference > rowDifference) {
        return (14*rowDifference + 10*(columnDifference - rowDifference))
      }
      //if y > x
      if(rowDifference > columnDifference) {
        return (14*columnDifference + 10*(rowDifference - columnDifference))
      }
    }

    function getFcost(row, column) {
      return (getGcost(row,column) + getHcost(row,column));
    }
  

    while(true) {
      let currentNode;

      if(openList.length >= 1) {
        currentNode = openList.reduce((minimumValue, currentValue) => (currentValue < minimumValue ? currentValue : minimumValue), openList[0]);
        console.log(currentNode)
      }else{
        currentNode = openList[0]
      }
      
      console.log(getHcost(9,2))
  

      break
    }


}

export default function SettingsPanel() {
    const [settings, setSettings] = useState({gridSize: "small"});

    return (
        <div id="settingsPanel">
          <div id="cellSelector">
            <div id="start">Start</div>
            <div id="end">End</div>
            <div id="wall">Wall</div>
          </div>
          <div id="startSearch" onClick={startSearch}>Search</div>
        </div>
    );
}
//settings :
//algorithm(a*, bfs, dfs, dijkstra)
//gridsize
//cell type selector / cellType: start, end, wall, blank
//search button