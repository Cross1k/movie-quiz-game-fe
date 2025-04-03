// src/socket.js - модуль для работы с сокетами
import { io } from "socket.io-client";

// URL вашего сервера Socket.IO

// const SOCKET_URL = "https://movie-quiz-game-be.onrender.com"; // use it on prod
const SOCKET_URL = "http://192.168.88.73:3000";
// const SOCKET_URL = "http://192.168.3.6:3000";

// Создаем экземпляр Socket.IO клиента
export const socket = io(SOCKET_URL);

// Вспомогательные функции для работы с сокетами
export const connectSocket = () => {
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};
