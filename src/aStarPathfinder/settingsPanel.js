import { useState } from 'react';
import Grid from './grid';

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

    openList.push(startNodeID)

    //path is an array of parentIDs
    function getGcost(row, column, path) {
      
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
      return ( getGcost(row,column) + getHcost(row,column) );
    }
  

    while(true) {
      //openlist = [{id: , f_cost: , path: []}, ]
      let currentNode;
      var indexOfCurrentNode = 0;

      if(openList.length > 1) {
        // currentNode = openList.reduce((minVal, curVal) => (curVal < minVal ? curVal : minVal), openList[0]);
        let min_f_cost = 0;
        let index_min_f_cost = 0;

        for(var i=0; i<openList.length; i++) {
          let current_f_cost = openList[i].f_cost;

          if(current_f_cost < min_f_cost) {
            min_f_cost = current_f_cost;
            index_min_f_cost = i;
          }
        }
        currentNode = openList[index_min_f_cost];
        indexOfCurrentNode = index_min_f_cost;
        console.log(currentNode)
      }else{
        currentNode = {id: openList[0]}
      }

      closedList.push(openList[indexOfCurrentNode]);
      openList.splice(indexOfCurrentNode, 1);
      console.log(currentNode)

      //if end node is found
      if(currentNode.id == endNodeID) {
        return
      }

      //find neighbours
      let id_of_neighbour_nodes = [];
      let current_row = currentNode.id.split("-")[0];
      let current_column = currentNode.id.split("-")[1];

      //search neighbours from top left to bottom right
      for(var i=-1; i<2; i++) {
        let row_to_be_searched = current_row + i;

        for(var j=-1; j<2; j++) {
          let column_to_be_searched = current_column + i;
          let id_to_be_searched = `${row_to_be_searched}-${column_to_be_searched}`;

          if(document.getElementById(id_to_be_searched)) id_of_neighbour_nodes.push(id_to_be_searched);
        }
      }
      console.log(id_of_neighbour_nodes)
  

      break
    }


}

export default function SettingsPanel() {
    const [settings, setSettings] = useState({
      gridSize: "small", 
      cellTypeSelector: "start"
    });
    
    function changeCellTypeSelector(selector) {
      switch(selector) {
          case "start":
            setSettings({
              ...settings,
              cellTypeSelector: "start"
            });
            document.getElementById("start").classList.add("selected");
            document.getElementById("end").classList.remove("selected");
            document.getElementById("wall").classList.remove("selected");
            break;
          case "end":
            setSettings({
              ...settings,
              cellTypeSelector: "end"
            });
            document.getElementById("start").classList.remove("selected");
            document.getElementById("end").classList.add("selected");
            document.getElementById("wall").classList.remove("selected");
            break;
          case "wall":
            setSettings({
              ...settings,
              cellTypeSelector: "wall"
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
            <div id="start" onClick={()=>{changeCellTypeSelector("start")}}>Start</div>
            <div id="end" onClick={()=>{changeCellTypeSelector("end")}}>End</div>
            <div id="wall" onClick={()=>{changeCellTypeSelector("wall")}}>Wall</div>
          </div>
          <div id="startSearch" onClick={startSearch}>Search</div>
        </div>
        <Grid settings={settings}/>
      </>
        
    );
}
//settings :
//algorithm(a*, bfs, dfs, dijkstra)
//gridsize
//cell type selector / cellType: start, end, wall, blank
//search button