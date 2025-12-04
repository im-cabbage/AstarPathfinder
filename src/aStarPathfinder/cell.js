import { useState } from 'react';

export default function Cell({ row, column }) {
    //cellType: start, end, wall, blank, open, closed
    const [cellType, setCelltype] = useState("blank");

    function handleChangeCellType(e) {
        console.log(e)
        if(e.ctrlKey){
            setCelltype("end")
        }else if(e.shiftKey) {
            setCelltype("wall")
        }
        else{
            setCelltype("start")
        }
    }
    
    const key = `${row}-${column}`;
    let classNames = `cell row-${row} column-${column}`;

    if(cellType === "start") {
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
        onClick={handleChangeCellType}>
            {key}
        </div>
    );
    
}