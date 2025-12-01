import { useState } from 'react';

function handleChangeCellType() {

}

export default function Cell({ row, column }) {
    //cellType: start, end, wall, blank
    const [cellType, setCelltype] = useState("blank");
    
    const key = `${row}${column}`;

    return (
        <div 
         id={key} 
         className={`cell row-${row} column-${column}`}
         onClick={handleChangeCellType}>
            {key}
        </div>
    );
}