import { Socket } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../utils/socket-io";
import { io } from "../server";


export const storeHandler = (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {

    const createStore = () => {
        io.emit("get_store")
    }

    socket.on("create_store", createStore)
}