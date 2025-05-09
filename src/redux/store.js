import { configureStore } from "@reduxjs/toolkit";
import { playerReducer } from "./players/slice.js";
import { gameReducer } from "./game/slice.js";
import { hostReducer } from "./host/slice.js";
import { commonReducer } from "./common/slice.js";

export const store = configureStore({
  reducer: {
    game: gameReducer,
    players: playerReducer,
    host: hostReducer,
    common: commonReducer,
  },
});
