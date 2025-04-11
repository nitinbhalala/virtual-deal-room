// utils/socket.ts
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.VITE_WS_BASE_URL
console.log("SOCKET_URL", SOCKET_URL);
// const SOCKET_URL ='ws://192.168.29.75:4000'; 

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // we'll manually connect it
});

