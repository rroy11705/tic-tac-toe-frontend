import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import socketService from "../../services/socketService";
import gameContext from "../../gameContext";
import gameService from "../../services/gameService";

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: "Quicksand", sans-serif;
  position: relative;
`;

const LoadingContainer = styled.div`
  width: 100vw;
	height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 200;
	background-color: #FFFFFF40;
	backdrop-filter: blur(10px);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 2rem;
	color: #FFFFFF;
	font-weight: 600;
	& > h4 {
		padding: 4rem;
		text-align: center;
	}
	@media(max-width: 768px) {
		font-size: 1.5rem;
		font-weight: 400;
	}
`;

const RoomIdContainer = styled.div`
	position: fixed;
	top: 2rem;
	right: 2rem;
	z-index: 200;
	font-family: "Quicksand", sans-serif;
	font-size: 2rem;
	color: #FFFFFF;
	font-weight: 600;
	@media(max-width: 768px) {
		top: 1rem;
		right: 1rem;
		font-size: 1rem;
	}
`;

const RowContainer = styled.div`
  width: 100%;
  display: flex;
`;

interface ICellProps {
  borderTop?: boolean;
  borderRight?: boolean;
  borderLeft?: boolean;
  borderBottom?: boolean;
}

const Cell = styled.div<ICellProps>`
  width: 13em;
  height: 13em;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-top: 3px solid #FFFFFF;
  border-left: 3px solid #FFFFFF;
  border-bottom: 3px solid #FFFFFF;
  border-right: 3px solid #FFFFFF;
  transition: all 270ms ease-in-out;

  &:hover {
    background-color: #8d44ad80;
  }

	@media(max-width: 768px) {
		height: 5em;
		width: 5em;
	}
`;

const PlayStopper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 99;
  cursor: default;
`;

const X = styled.span`
  font-size: 100px;
  color: #FFFFFF;
  &::after {
    content: "X";
  }
`;

const O = styled.span`
  font-size: 100px;
  color: #FFFFFF;
  &::after {
    content: "O";
  }
`;

export type IPlayMatrix = Array<Array<string | null>>;
export interface IStartGame {
  start: boolean;
  symbol: "x" | "o";
}

export function Game() {
  const [matrix, setMatrix] = useState<IPlayMatrix>([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);

  const {
    playerSymbol,
    setPlayerSymbol,
    setPlayerTurn,
    isPlayerTurn,
    setGameStarted,
    isGameStarted,
		roomId
  } = useContext(gameContext);

  console.log("playerSymbol", playerSymbol)

  const checkGameState = (matrix: IPlayMatrix) => {
    for (let i = 0; i < matrix.length; i++) {
      let row = [];
      for (let j = 0; j < matrix[i].length; j++) {
        row.push(matrix[i][j]);
      }

      if (row.every((value) => value && value === playerSymbol)) {
        return [true, false];
      } else if (row.every((value) => value && value !== playerSymbol)) {
        return [false, true];
      }
    }

    for (let i = 0; i < matrix.length; i++) {
      let column = [];
      for (let j = 0; j < matrix[i].length; j++) {
        column.push(matrix[j][i]);
      }

      if (column.every((value) => value && value === playerSymbol)) {
        return [true, false];
      } else if (column.every((value) => value && value !== playerSymbol)) {
        return [false, true];
      }
    }

    if (matrix[1][1]) {
      if (matrix[0][0] === matrix[1][1] && matrix[2][2] === matrix[1][1]) {
        if (matrix[1][1] === playerSymbol) return [true, false];
        else return [false, true];
      }

      if (matrix[2][0] === matrix[1][1] && matrix[0][2] === matrix[1][1]) {
        if (matrix[1][1] === playerSymbol) return [true, false];
        else return [false, true];
      }
    }

    //Check for a tie
    if (matrix.every((m) => m.every((v) => v !== null))) {
      return [true, true];
    }

    return [false, false];
  };

  const updateGameMatrix = (column: number, row: number, symbol: "x" | "o") => {
    const newMatrix = [...matrix];
		console.log(column, row, symbol)

    if (newMatrix[row][column] === null || newMatrix[row][column] === "null") {
      newMatrix[row][column] = symbol;
      setMatrix(newMatrix);
    }

    if (socketService.socket) {
      gameService.updateGame(socketService.socket, newMatrix);
      const [currentPlayerWon, otherPlayerWon] = checkGameState(newMatrix);
      if (currentPlayerWon && otherPlayerWon) {
        gameService.gameWin(socketService.socket, "The Game is a TIE!");
        alert("The Game is a TIE!");
      } else if (currentPlayerWon && !otherPlayerWon) {
        gameService.gameWin(socketService.socket, "You Lost!");
        alert("You Won!");
      }

      setPlayerTurn(false);
    }
  };

  const handleGameUpdate = () => {
    if (socketService.socket)
      gameService.onGameUpdate(socketService.socket, (newMatrix) => {
        setMatrix(newMatrix);
        checkGameState(newMatrix);
        setGameStarted(true);
        setPlayerTurn(true);
      });
  };

  const handleGameStart = () => {
    if (socketService.socket)
      gameService.onStartGame(socketService.socket, (options) => {
        setGameStarted(true);
				console.log("options", options)
        setPlayerSymbol(options.symbol);
        if (options.start) setPlayerTurn(true);
        else setPlayerTurn(false);
      });
  };

  const handleGameWin = () => {
    if (socketService.socket)
      gameService.onGameWin(socketService.socket, (message) => {
        console.log("Here", message);
        setPlayerTurn(false);
        alert(message);
      });
  };

  useEffect(() => {
    handleGameUpdate();
    handleGameStart();
    handleGameWin();
  }, []);

	console.log("isGameStarted", isGameStarted, "isPlayerTurn", isPlayerTurn)

  return (
    <GameContainer>
      {!isGameStarted && (
				<LoadingContainer>
					<h4>Waiting for Other Player to Join to Start the Game!</h4>
				</LoadingContainer>
      )}
			{!isGameStarted && <RoomIdContainer>
					Room Id: {roomId}
				</RoomIdContainer>}
      {(!isGameStarted || !isPlayerTurn) && <PlayStopper />}
      {matrix.map((row, rowIdx) => {
        return (
          <RowContainer key={rowIdx}>
            {row.map((column, columnIdx) => (
              <Cell
								key={`${rowIdx}-${columnIdx}`}
                onClick={() =>
                  updateGameMatrix(columnIdx, rowIdx, playerSymbol)
                }
              >
                {column && column !== "null" ? (
                  column === "x" ? (
                    <X />
                  ) : (
                    <O />
                  )
                ) : null}
              </Cell>
            ))}
          </RowContainer>
        );
      })}
    </GameContainer>
  );
}