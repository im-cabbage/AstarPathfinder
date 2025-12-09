import { useState } from "react";
import Cell from "./cell";

export default function Grid({ settings }) {
     //cellType: start, end, wall, blank, open, closed
    const [startCell, setStartCell] = useState("");
    const [endCell, setEndCell] = useState("");
    const [wallCellArray, setWallCellArray] = useState([]);
    const gridSizeObject = {
        small: 10,
        medium: 20,
        large: 30
    };
    const gridSize = gridSizeObject[settings.gridSize];
    const cellTypeSelector = settings.cellTypeSelector;

    function handleChangeCellType(id) {
        switch(cellTypeSelector) {
            case "start":
                if(endCell === id) setEndCell("");
                if(wallCellArray.includes(id)) {
                    setWallCellArray(
                        wallCellArray.filter(cellId => cellId !== id)
                    )
                }
                setStartCell(id);
                break;
            case "end":
                if(startCell === id) setStartCell("");
                if(wallCellArray.includes(id)) {
                    setWallCellArray(
                        wallCellArray.filter(cellId => cellId !== id)
                    )
                }
                setEndCell(id);
                break;
            case "wall":
                if(wallCellArray.includes(id)) {
                    setWallCellArray(
                        wallCellArray.filter(cellId => cellId !== id)
                    )
                } else {
                    if(startCell === id) setStartCell("");
                    if(endCell === id) setEndCell("");
                    setWallCellArray([...wallCellArray, id])
                }
                break;

            default:
                break;
        }
    }

    let cells = [];
    for(let i=1; i<=gridSize; i++) {
        const row = i;

        for(let j=1; j<=gridSize; j++) {
            const column = j;
            const key = `${row}${column}`;
            const id = `${row}-${column}`;
            cells.push(
                <Cell 
                key={key} 
                row={row} 
                column={column} 
                handleChangeCellType={(id)=>{handleChangeCellType(id)}}
                startCell={startCell === id}
                endCell={endCell === id}
                wallCell={wallCellArray.includes(id)}
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