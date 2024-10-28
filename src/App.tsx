import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "./App.css";
import socketService from "./services/socketService";
import GameContext, { IGameContextProps } from "./gameContext";
import { JoinRoom } from "./components/joinRoom";
import { Game } from "./components/game";

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(109.6deg, rgba(119, 44, 232, 0.68) 11.5%, rgb(119, 44, 232) 91.2%);
`;

const WelcomeTextContainer = styled.div<{ isInRoom: boolean }>`
  display: flex;
  height: ${props => props.isInRoom ? '20%' : '50%'};
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const WelcomeText = styled.h1<{ isInRoom: boolean }>`
  font-family:  "Quicksand", sans-serif;
  font-size: ${props => props.isInRoom ? '8rem' : '16em'};
  font-weight: 700;
  margin: 0;
  color: #FFFFFF;
`;

const MainContainer = styled.div`
  width: 100%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function App() {
  const [isInRoom, setInRoom] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<"x" | "o">("x");
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [roomId, setRoomId] = useState<string>("");

  const connectSocket = async () => {
    const url = process.env.REACT_APP_API_URL;
    if (url) {
      await socketService
        .connect(url)
        .catch((err) => {
          console.log("Error: ", err);
        });
    }
  };

  useEffect(() => {
    connectSocket();
  }, []);

  const gameContextValue: IGameContextProps = {
    isInRoom,
    setInRoom,
    playerSymbol,
    setPlayerSymbol,
    isPlayerTurn,
    setPlayerTurn,
    isGameStarted,
    setGameStarted,
    roomId,
    setRoomId,
  };

  return (
    <GameContext.Provider value={gameContextValue}>
      <AppContainer>
        <WelcomeTextContainer isInRoom={isInRoom}>
          <WelcomeText isInRoom={isInRoom}>OX</WelcomeText>
        </WelcomeTextContainer>
        <MainContainer>
          {!isInRoom && <JoinRoom />}
          {isInRoom && <Game />}
        </MainContainer>
      </AppContainer>
    </GameContext.Provider>
  );
}

export default App;