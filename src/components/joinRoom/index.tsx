import React, { useContext, useState } from "react";
import styled from "styled-components";
import socketService from "../../services/socketService";
import gameService from "../../services/gameService";
import gameContext from "../../gameContext";

interface IJoinRoomProps {}

interface JoinButtonProps {
  variant?: 'outlined' | 'contained';
}

const JoinRoomContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1em;
  margin-bottom: 10rem;
`;

const ModeText = styled.h4`
  font-family: "Quicksand", sans-serif;
  font-size: 2rem;
  color: #FFFFFF
`;

const RoomIdInput = styled.input`
  outline: none !important;
  min-width: 200px;
  width: 314px;
  font-family: "Quicksand", sans-serif;
  font-size: 2rem;
  font-wight: 600;
  border: 2px solid #FFFFFF;
  border-radius: 50px;
  padding: 1rem;
  transition: all 230ms ease-in-out;
`;

const JoinButton = styled.button<JoinButtonProps>`
  outline: none !important;
  background-color: ${props => props.variant === 'outlined' ? 'transparent' : '#FFFFFF'};
  color: ${props => props.variant === 'outlined' ? '#FFFFFF' : '#8e44ad'};
  min-width: 200px;
  width: 350px;
  font-family:  "Quicksand", sans-serif;
  font-size: 2rem;
  font-wight: 600;
  border: ${props => props.variant === 'outlined' ? '2px solid #FFFFFF' : '2px solid transparent'};
  border-radius: 50px;
  padding: 1rem;
  transition: all 230ms ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.variant === 'outlined' ? '#FFFFFF' : 'transparent'};
    border: ${props => props.variant === 'outlined' ? '2px solid transparent' : '2px solid #FFFFFF'};
    color: ${props => props.variant === 'outlined' ? '#8e44ad' : '#FFFFFF'};
  }
`;

export function JoinRoom(props: IJoinRoomProps) {
  const [playWithFriend, setPlayWithFriend] = useState(false)
  const [roomName, setRoomName] = useState("");
  const [isJoining, setJoining] = useState(false);

  const { setInRoom, setRoomId } = useContext(gameContext);

  const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
    const value = e.target.value;
    setRoomName(value);
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const socket = socketService.socket;
    if (!roomName || roomName.trim() === "" || !socket) return;

    setJoining(true);

    const joined = await gameService
      .joinGameRoom(socket, roomName)
      .catch((err) => {
        alert(err);
      });

    if (joined) {
      setInRoom(true)
      setRoomId(roomName);
    };

    setJoining(false);
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const socket = socketService.socket;
    if (!socket) return;

    setJoining(true);
    const created = await gameService
      .createGameRoom(socket, (roomId) => setRoomId(roomId))
      .catch((err) => {
        alert(err);
      });

    console.log(created)

    if (created) setInRoom(true);

    setJoining(false);
  }

  const joinRandomRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const socket = socketService.socket;
    if (!socket) return;

    setJoining(true);
    const joined = await gameService
      .joinRandomGameRoom(socket, (roomId) => setRoomId(roomId))
      .catch((err) => {
        alert(err);
      });
    if (joined) setInRoom(true);
    setJoining(false);
  };

  return (
    <JoinRoomContainer>
      <ModeText>Choose a play mode</ModeText>
      {playWithFriend ? (
        <>
          <RoomIdInput
            placeholder="Room id"
            value={roomName}
            onChange={handleRoomNameChange}
          />
          <JoinButton type="button" disabled={isJoining} onClick={joinRoom}>
            {isJoining ? "Joining..." : "Join"}
          </JoinButton>
          <JoinButton variant="outlined" type="button" onClick={createRoom}>
            Create room
          </JoinButton>
        </>
      ) : (
        <>
          <JoinButton onClick={() => setPlayWithFriend(true)}>
            Play with friend
          </JoinButton>
          <JoinButton variant="outlined" onClick={joinRandomRoom}>
            Random 1v1
          </JoinButton>
        </>
      )}
    </JoinRoomContainer>
  );
}