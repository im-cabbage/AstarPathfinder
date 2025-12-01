import './aStarPathfinder.css';

import { useState, useReducer } from 'react';
import Grid from './grid';
import SettingsPanel from './settingsPanel';

// function reducer(state, action) {
//   // ...
// }

export default function AstarPathfinder() {
    // const [state, dispatch] = useReducer(reducer, initial);
    const [settings, setSettings] = useState({gridSize: "small"});

    return (
        <>
          <SettingsPanel/>
          <Grid settings={settings}/>
        </>
    );
}

//settings :
//algorithm(a*, bfs, dfs, dijkstra)
//gridsize
//cell type selector