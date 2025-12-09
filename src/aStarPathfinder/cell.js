import { useState } from 'react';

export default function Cell({ row, column, handleChangeCellType, startCell, endCell, wallCell}) {
   
    const id = `${row}-${column}`;
    let classNames = `cell row-${row} column-${column}`;

    if(startCell) {
        classNames += " start"
    }
    if(endCell) {
        classNames += " end"
    }
    if(wallCell) {
        classNames += " wall"
    }

    return (
        <div 
        id={id} 
        className={classNames}
        data-row={row}
        data-column={column}
        onClick={()=>{handleChangeCellType(id)}}
        >
            {id}
        </div>
    );
    
}