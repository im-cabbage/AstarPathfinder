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