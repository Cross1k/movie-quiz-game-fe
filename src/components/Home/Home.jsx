import React, { useEffect, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import css from "./Home.module.css";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useNavigate } from "react-router-dom";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

const Home = () => {
  const [playerId, setPlayerId] = useState([]);
  const [hostConnected, setHostConnected] = useState(false);
  const [playersLogo, setPlayersLogo] = useState([]);

  const players = [1, 2, 3];

  const [sessionId, setSessionId] = useState("");

  const navigate = useNavigate();
  const findURL = window.location.href; // use it on prod

  useEffect(() => {
    setTimeout(() => {
      setSessionId(socket.id);

      socket.emit("create_session", sessionId);
      console.log("my id:", sessionId);
    }, 300);

    socket.on("check_host", (data) => {
      console.log(
        "check_host",
        data.map((p) => p.logo)
      );
      setPlayersLogo(data.map((p) => p.logo));
      setHostConnected(true);
    });

    socket.on("check_player", (id) => {
      setPlayerId((prev) => {
        // Проверяем, не добавлен ли уже этот player
        if (!prev.includes(id)) {
          return [...prev, id];
        }
        return prev;
      });
    });

    socket.on("start_game", (room) => {
      console.log("navigated to", room);
      navigate(`/game/${room}`);
    });
    return () => {
      socket.off("home_page");
      socket.off("start_game");
    };
  }, [navigate, sessionId]);

  useEffect(() => {
    console.log("scannedQRs изменились:", playerId);
  }, [playerId]);

  useEffect(() => {
    setTimeout(() => {
      connectSocket();
    }, 400);

    return () => {
      disconnectSocket();
    };
  }, []);

  const isQRScanned = (player) => {
    const result = playerId.some(
      (scanned) => String(scanned) === String(player)
    );
    return result;
  };

  return (
    <>
      <div className={css.wrap}>
        <h1 className={css.title}>Quiz Movie Game</h1>
        {!hostConnected ? (
          <>
            <div className={css.qrPlayer}>
              <QRCodeCanvas
                className={css.qrcode}
                value={`${findURL}host/${sessionId}`}
                // value={`http://192.168.88.73:5173/host/${sessionId}`}
                size={300}
                level="H"
                marginSize={0}
                padding={0}
                session={sessionId}
                bgColor="transparent"
              />
              <p className={css.logoHost}>🦄</p>
              <h2 className={css.menuTitle}>Ведущий</h2>
            </div>
          </>
        ) : (
          <>
            <div className={css.qwe}>
              {players.map((player) => (
                <div className={css.qrPlayer} key={player}>
                  {isQRScanned(player) ? (
                    // Отображаем, что QR-код отсканирован
                    <div className={css.scannedQR}>
                      <div className={css.checkmark}>
                        <IoMdCheckmarkCircleOutline size={180} />
                      </div>
                    </div>
                  ) : (
                    // console.log("scanned")
                    // Отображаем QR-код, если он еще не отсканирован
                    <div className={css.logoWrap}>
                      <QRCodeSVG
                        className={css.qrcode}
                        level="H"
                        value={`${findURL}player/${player}/${sessionId}`}
                        size={150}
                        bgColor="transparent"
                        number={player}
                        session={sessionId}
                        imageSettings={{
                          src: "",
                          height: 50,
                          width: 50,
                          // excavate: true,
                        }}
                      />
                      <p className={css.logo}>{playersLogo[player - 1]}</p>
                    </div>
                  )}
                  <h2 className={css.menuTitle}>Команда {player}</h2>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
export default Home;
