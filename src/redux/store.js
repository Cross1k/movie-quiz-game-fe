import { configureStore } from "@reduxjs/toolkit";
import { playerReducer } from "./players/slice.js";

export const store = configureStore({
  game: 1,
  players: playerReducer,
  themes: 3,
});
