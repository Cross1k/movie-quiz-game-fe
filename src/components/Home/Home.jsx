import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import css from "./Home.module.css";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const players = [1, 2, 3];

  const [sessionId, setSessionId] = useState("");

  const navigate = useNavigate();
  const findURL = window.location.href; // use it on prod

  useEffect(() => {
    // connectSocket();

    setTimeout(async () => {
      setSessionId(socket.id);
      socket.emit("create_session", sessionId);
      console.log("my id:", sessionId);
    }, 700);

    socket.on("start_game", (room) => {
      console.log("navigated to", room);
      navigate(`/game/${room}`);
    });
    return () => {
      socket.off("home_page");
      socket.off("start_game");

      // disconnectSocket();
    };
  }, [navigate, sessionId]);

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <>
      <h1 className={css.title}>Quiz Movie Game</h1>
      <div className={css.wrap}>
        <div className={css.qrPlayer}>
          <QRCodeCanvas
            className={css.qrcode}
            value={`${findURL}host/${sessionId}`}
            // value={`http://192.168.88.73:5173/host/${sessionId}`}
            size={300}
            marginSize={0}
            padding={0}
            session={sessionId}
          />
          <h2 className={css.menuTitle}>Ведущий</h2>
        </div>
        {players.map((player) => (
          <div className={css.qrPlayer}>
            {" "}
            <QRCodeCanvas
              className={css.qrcode}
              value={`${findURL}player/${player}/${sessionId}`}
              // value={`http://192.168.88.73:5173/player/${player}/${sessionId}`}
              key={player}
              size={150}
              number={player}
              session={sessionId}
            />
            <h2 className={css.menuTitle}>Команда {player}</h2>
          </div>
        ))}
      </div>
    </>
  );
};
export default Home;
