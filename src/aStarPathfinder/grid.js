import { useState } from "react";
import Cell from "./cell";

export default function Grid({ settings }) {
    const [startCell, setStartCell] = useState("");
    const gridSizeObject = {
        small: 10,
        medium: 20,
        large: 30
    }
    const gridSize = gridSizeObject[settings.gridSize];
    const cellTypeSelector = settings.cellTypeSelector;

    let cells = [];

    for(let i=1; i<=gridSize; i++) {
        const row = i;

        for(let j=1; j<=gridSize; j++) {
            const column = j;
            const id = `${row}${column}`;
            cells.push(
                <Cell 
                key={id} 
                row={row} 
                column={column} 
                cellTypeSelector={cellTypeSelector}
                isStart={startCell == id}
                setStart={() => setStartCell(id)}
                />
            )
        }
    }

    return (
        <div id="grid" className={`${settings.gridSize}-grid`}>
            {cells}
        </div>
    )
}