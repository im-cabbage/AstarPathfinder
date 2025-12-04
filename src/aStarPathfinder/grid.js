import Cell from "./cell";

export default function Grid({ settings }) {
    const gridSizeObject = {
        small: 10,
        medium: 20,
        large: 30
    }
    const gridSize = gridSizeObject[settings.gridSize];

    let cells = [];

    for(let i=1; i<=gridSize; i++) {
        const row = i;

        for(let j=1; j<=gridSize; j++) {
            const column = j;
            
            cells.push(<Cell key={`${i}${j}`} row={row} column={column}/>)
        }
    }

    return (
        <div id="grid" className={`${settings.gridSize}-grid`}>
            {cells}
        </div>
    )
}