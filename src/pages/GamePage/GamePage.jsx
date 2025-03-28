import React, { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useParams } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

export default function Themes() {
  const [themes, setThemes] = useState([]);

  const { session } = useParams();

  useEffect(() => {
    connectSocket();
    socket.emit("join_room", session);
    socket.on("home_page", (data) => {
      console.log(data);
    });
    socket.emit("get_themes");
    socket.on("themes_list", (themes) => {
      setThemes(themes);
    });
    socket.on("open_theme", (theme) => {
      console.log(theme);
    });
    return () => {
      socket.off("themes_list");
      disconnectSocket();
    };
  }, [session]);

  return (
    <div>
      <h2>Выберите тему</h2>
      {themes.map((theme) => (
        <div key={theme.external_id}>{theme.name}</div>
      ))}
    </div>
  );
}
