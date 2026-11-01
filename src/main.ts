const ROW_COUNT = 8;
const COLUMN_COUNT = 10;
const AVAILABLE = 0;
const OCCUPIED = 1;

type SeatStatus = typeof AVAILABLE | typeof OCCUPIED;
type SeatMap = SeatStatus[][];
type SeatPosition = [row: number, column: number];
type AdjacentSeatPair = [firstSeat: SeatPosition, secondSeat: SeatPosition];
type SeatCounts = [occupied: number, available: number];

function createSeatMap(): SeatMap {
  return Array.from({ length: ROW_COUNT }, () =>
    Array<SeatStatus>(COLUMN_COUNT).fill(AVAILABLE),
  );
}

function displaySeatMap(seatMap: SeatMap): void {
  let columnLabels = "";
  for (let columnIndex = 0; columnIndex < COLUMN_COUNT; columnIndex += 1) {
    const columnLabel = String(columnIndex).padStart(2, " ");
    columnLabels += `${columnLabel}${columnIndex < COLUMN_COUNT - 1 ? " " : ""}`;
  }

  console.log(`     ${columnLabels}`);

  // This could also use forEach and map, but the exercise asks us to practice loops.
  for (let rowIndex = 0; rowIndex < seatMap.length; rowIndex += 1) {
    const row = seatMap[rowIndex];
    let seatLabels = "";

    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      const seatLabel = row[columnIndex] === OCCUPIED ? "X" : "L";
      seatLabels += `${seatLabel}${columnIndex < row.length - 1 ? "  " : ""}`;
    }

    console.log(`Row ${rowIndex}: ${seatLabels}`);
  }
}

function reserveSeat(
  seatMap: SeatMap,
  rowIndex: number,
  columnIndex: number,
): boolean {
  const isValidPosition =
    Number.isInteger(rowIndex) &&
    Number.isInteger(columnIndex) &&
    rowIndex >= 0 &&
    rowIndex < ROW_COUNT &&
    columnIndex >= 0 &&
    columnIndex < COLUMN_COUNT;

  if (!isValidPosition) {
    console.log(`Invalid seat position: row ${rowIndex}, column ${columnIndex}.`);
    return false;
  }

  if (seatMap[rowIndex][columnIndex] === OCCUPIED) {
    console.log(`Seat at row ${rowIndex}, column ${columnIndex} is already occupied.`);
    return false;
  }

  seatMap[rowIndex][columnIndex] = OCCUPIED;
  console.log(`Reservation confirmed for row ${rowIndex}, column ${columnIndex}.`);
  return true;
}

function countSeats(seatMap: SeatMap): SeatCounts {
  let occupiedSeats = 0;

  for (const row of seatMap) {
    for (const seat of row) {
      if (seat === OCCUPIED) {
        occupiedSeats += 1;
      }
    }
  }

  return [occupiedSeats, ROW_COUNT * COLUMN_COUNT - occupiedSeats];
}

function findAdjacentSeats(seatMap: SeatMap): AdjacentSeatPair | null {
  for (let rowIndex = 0; rowIndex < ROW_COUNT; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < COLUMN_COUNT - 1; columnIndex += 1) {
      const currentSeatIsAvailable = seatMap[rowIndex][columnIndex] === AVAILABLE;
      const nextSeatIsAvailable = seatMap[rowIndex][columnIndex + 1] === AVAILABLE;

      if (currentSeatIsAvailable && nextSeatIsAvailable) {
        return [
          [rowIndex, columnIndex],
          [rowIndex, columnIndex + 1],
        ];
      }
    }
  }

  return null;
}

function displayRoomStatus(seatMap: SeatMap): void {
  displaySeatMap(seatMap);

  const [occupiedSeats, availableSeats] = countSeats(seatMap);
  console.log(`Occupied: ${occupiedSeats}; available: ${availableSeats}.`);

  const adjacentPair = findAdjacentSeats(seatMap);
  if (adjacentPair === null) {
    console.log("No adjacent available seats found.");
    return;
  }

  const [firstSeat, secondSeat] = adjacentPair;
  console.log(
    `First adjacent pair: (${firstSeat[0]}, ${firstSeat[1]}) and (${secondSeat[0]}, ${secondSeat[1]}).`,
  );
}

function renderSeatMap(seatMap: SeatMap, container: HTMLDivElement): void {
  const adjacentPair = findAdjacentSeats(seatMap);
  const columnLabels = Array.from({ length: COLUMN_COUNT }, (_, columnIndex) =>
    `<span class="seat-column-label">${columnIndex}</span>`,
  ).join("");
  const header = `<div class="seat-row" aria-hidden="true"><span class="seat-row-label">Row</span>${columnLabels}</div>`;

  const rows = seatMap
    .map((row, rowIndex) => {
      const seats = row
        .map((seat, columnIndex) => {
          const isOccupied = seat === OCCUPIED;
          const isPartOfAdjacentPair = adjacentPair?.some(
            ([pairRow, pairColumn]) =>
              pairRow === rowIndex && pairColumn === columnIndex,
          );
          const seatState = isOccupied ? "occupied" : "available";
          const pairClass = isPartOfAdjacentPair ? " seat-button--pair" : "";
          const pairLabel = isPartOfAdjacentPair
            ? ", part of the first adjacent pair"
            : "";

          return `<button
            class="seat-button seat-button--${seatState}${pairClass}"
            type="button"
            data-row="${rowIndex}"
            data-column="${columnIndex}"
            aria-label="Row ${rowIndex}, seat ${columnIndex}, ${seatState}${pairLabel}"
            ${isOccupied ? "disabled" : ""}
          >${isOccupied ? "X" : "L"}</button>`;
        })
        .join("");

      return `<div class="seat-row"><span class="seat-row-label">${rowIndex}</span>${seats}</div>`;
    })
    .join("");

  container.innerHTML = `${header}${rows}`;
}

function initializeSeatManager(): void {
  const seatMapContainer = document.querySelector<HTMLDivElement>("#seat-map");
  const availableCount = document.querySelector<HTMLElement>("#available-count");
  const occupiedCount = document.querySelector<HTMLElement>("#occupied-count");
  const reservationMessage = document.querySelector<HTMLElement>("#reservation-message");
  const pairMessage = document.querySelector<HTMLElement>("#pair-message");

  if (
    seatMapContainer === null ||
    availableCount === null ||
    occupiedCount === null ||
    reservationMessage === null ||
    pairMessage === null
  ) {
    return;
  }

  const seatMapElement = seatMapContainer;
  const availableCountElement = availableCount;
  const occupiedCountElement = occupiedCount;
  const pairMessageElement = pairMessage;
  const seatMap = createSeatMap();

  function updateRoomDisplay(): void {
    renderSeatMap(seatMap, seatMapElement);

    const [occupiedSeats, availableSeats] = countSeats(seatMap);
    availableCountElement.textContent = String(availableSeats);
    occupiedCountElement.textContent = String(occupiedSeats);

    const adjacentPair = findAdjacentSeats(seatMap);
    pairMessageElement.textContent = adjacentPair
      ? `First adjacent pair: row ${adjacentPair[0][0]}, seats ${adjacentPair[0][1]} and ${adjacentPair[1][1]}.`
      : "No adjacent available seats.";
  }

  seatMapElement.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLButtonElement)) {
      return;
    }

    const rowIndex = Number(event.target.dataset.row);
    const columnIndex = Number(event.target.dataset.column);
    const reservationSucceeded = reserveSeat(seatMap, rowIndex, columnIndex);

    reservationMessage.textContent = reservationSucceeded
      ? `Reservation confirmed for row ${rowIndex}, seat ${columnIndex}.`
      : `Seat at row ${rowIndex}, seat ${columnIndex} is already occupied.`;

    updateRoomDisplay();
  });

  updateRoomDisplay();
}

function runExamples(): void {
  console.log("Empty room");
  displayRoomStatus(createSeatMap());

  console.log("\nPartially occupied room");
  const partiallyOccupiedRoom = createSeatMap();
  reserveSeat(partiallyOccupiedRoom, 3, 4);
  reserveSeat(partiallyOccupiedRoom, 3, 4);
  reserveSeat(partiallyOccupiedRoom, 8, 0);
  displayRoomStatus(partiallyOccupiedRoom);

  console.log("\nNearly full room with scattered available seats");
  const nearlyFullRoom = createSeatMap();
  for (const row of nearlyFullRoom) {
    row.fill(OCCUPIED);
  }
  for (let rowIndex = 0; rowIndex < ROW_COUNT; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < COLUMN_COUNT; columnIndex += 4) {
      nearlyFullRoom[rowIndex][columnIndex] = AVAILABLE;
    }
  }
  displayRoomStatus(nearlyFullRoom);

  console.log("\nFull room");
  const fullRoom = createSeatMap();
  for (const row of fullRoom) {
    row.fill(OCCUPIED);
  }
  displayRoomStatus(fullRoom);
}

if (typeof document === "undefined") {
  runExamples();
} else {
  import("./style.css");
  initializeSeatManager();
}
