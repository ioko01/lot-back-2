import { Socket } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../utils/socket-io";
import { io } from "../server";


export const creditHandler = (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {

    const createCredit = () => {
        io.emit("get_credit")
        // console.log("get credit");
    }

    socket.on("create_credit", createCredit)
}