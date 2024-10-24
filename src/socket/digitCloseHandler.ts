import { Socket } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../utils/socket-io";
import { io } from "../server";


export const digitCloseHandler = (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {

    const createDigitClose = () => {
        io.emit("get_digit_close")
    }

    socket.on("create_digit_close", createDigitClose)
}