import { useState } from 'react';

export default function Cell({ row, column, isStart, cellTypeSelector }) {
    //cellType: start, end, wall, blank, open, closed
    const [cellType, setCelltype] = useState("blank");

    function handleChangeCellType() {
        console.log(cellTypeSelector)
    }
    
    const key = `${row}-${column}`;
    let classNames = `cell row-${row} column-${column}`;

    if(isStart) {
        classNames += " start"
    }
    if(cellType === "end") {
        classNames += " end"
    }
    if(cellType === "wall") {
        classNames += " wall"
    }

    return (
        <div 
        id={key} 
        className={classNames}
        data-row={row}
        data-column={column}
        onClick={handleChangeCellType}
        >
            {key}
        </div>
    );
    
}