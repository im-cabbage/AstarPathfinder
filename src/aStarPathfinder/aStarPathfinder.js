import './aStarPathfinder.css';

import { useState, useReducer } from 'react';
import SettingsPanel from './settingsPanel';

// function reducer(state, action) {
//   // ...
// }

export default function AstarPathfinder() {
    // const [state, dispatch] = useReducer(reducer, initial);

    return (
      <SettingsPanel/>
    );
}

//settings :
//algorithm(a*, bfs, dfs, dijkstra)
//gridsize
//cell type selector