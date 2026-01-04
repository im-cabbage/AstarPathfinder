import { useState } from "react";

export default function Cell({
  row,
  column,
  handleChangeCellType,
  handleDrawWall,
  startCell,
  endCell,
  wallCell,
  gCost,
  hCost,
  fCost,
  aCost,
  open,
  closed,
  shortestPath,
  parentIndicator,
  currentCell
}) {
  const id = `${row}-${column}`;
  let classNames = `cell row-${row} column-${column}`;

  if (startCell) {
    classNames += " start";
  }
  if (endCell) {
    classNames += " end";
  }
  if (wallCell) {
    classNames += " wall";
  }
  if (open) {
    classNames += " open";
  }
  if (closed) {
    classNames += " closed";
  }
  if (shortestPath) {
    classNames += " shortestPath";
  }
  if (currentCell) {
    classNames += " currentCell";
  }

  let parentIndicatorClassNames = `parentIndicator`;
  if (parentIndicator) {
    parentIndicatorClassNames += ` ${parentIndicator}`;
  } else {
    parentIndicatorClassNames += " hidden";
  }


  return (
    <div
      id={id}
      className={classNames}
      data-row={row}
      data-column={column}
      onClick={(e) => {
        handleChangeCellType(e, id);
      }}
      onMouseOver={(e)=>{
        if (e.ctrlKey) {
          handleDrawWall(e, id);
        }
      }}
    >
      {id}
      <div className={parentIndicatorClassNames}></div>
      <div className="gCost">{gCost}</div>
      <div className="hCost">{hCost}</div>
      <div className="fCost">{fCost}</div>
      <div className="aCost">{aCost}</div>
    </div>
  );
}
