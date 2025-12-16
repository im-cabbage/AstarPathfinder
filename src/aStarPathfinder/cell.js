import { useState } from "react";

export default function Cell({
  row,
  column,
  handleChangeCellType,
  startCell,
  endCell,
  wallCell,
  gCost,
  hCost,
  fCost,
  open
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

  return (
    <div
      id={id}
      className={classNames}
      data-row={row}
      data-column={column}
      onClick={() => {
        handleChangeCellType(id);
      }}
    >
      {id}
      <div className="gCost">{gCost}</div>
      <div className="hCost">{hCost}</div>
      <div className="fCost">{fCost}</div>
    </div>
  );
}
