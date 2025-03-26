import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import css from "./Home.module.css";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";

const Home = () => {
  const players = [1, 2, 3];

  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    connectSocket();
    socket.on("home_page", (data) => {
      setSessionId(String(data));
    });
    return () => {
      socket.off("home_page");
      disconnectSocket();
    };
  }, []);

  return (
    <>
      <QRCodeCanvas
        className={css.qrcode}
        value={`http://192.168.3.6:5173/host/${sessionId}`}
        size={400}
        session={sessionId}
      />
      {players.map((player) => (
        <QRCodeCanvas
          className={css.qrcode}
          value={`http://192.168.3.6:5173/player/${player}/${sessionId}`}
          key={player}
          size={200}
          number={player}
          session={sessionId}
        />
      ))}
    </>
  );
};
export default Home;
