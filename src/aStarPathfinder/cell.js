import { useState } from 'react';

function handleChangeCellType(e) {
    if(e.ctrlKey){
        e.target.classList.add("end")
    }else{
        e.target.classList.add("start")
    }
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