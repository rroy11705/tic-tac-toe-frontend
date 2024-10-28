import { Socket } from "socket.io-client";
import { IPlayMatrix, IStartGame } from "../../components/game";

class GameService {
  public async createGameRoom(
    socket: Socket,
    listener: (roomId: string) => void
  ): Promise<boolean> {
    return new Promise((rs, rj) => {
      socket.emit("create_room");
      socket.on("room_joined", ({ roomId }) => {
        listener(roomId);
        rs(true);
      });
      socket.on("room_join_error", ({ error }) => rj(error));
    });
  }

  public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
    return new Promise((rs, rj) => {
      socket.emit("join_room", { roomId });
      socket.on("room_joined", () => rs(true));
      socket.on("room_join_error", ({ error }) => rj(error));
    });
  }

  public async joinRandomGameRoom(
    socket: Socket,
    listener: (roomId: string) => void
  ): Promise<boolean> {
    return new Promise((rs, rj) => {
      socket.emit("join_random_room");
      socket.on("room_joined", ({ roomId }) => {
        listener(roomId);
        rs(true);
      });
      socket.on("room_join_error", ({ error }) => rj(error));
    });
  }

  public async updateGame(socket: Socket, gameMatrix: IPlayMatrix) {
    socket.emit("update_game", { matrix: gameMatrix });
  }

  public async onGameUpdate(
    socket: Socket,
    listener: (matrix: IPlayMatrix) => void
  ) {
    socket.on("on_game_update", ({ matrix }) => listener(matrix));
  }

  public async onStartGame(
    socket: Socket,
    listener: (options: IStartGame) => void
  ) {
    socket.on("start_game", listener);
  }

  public async gameWin(socket: Socket, message: string) {
    socket.emit("game_win", { message });
  }

  public async onGameWin(socket: Socket, listener: (message: string) => void) {
    socket.on("on_game_win", ({ message }) => listener(message));
  }
}

export default new GameService();
