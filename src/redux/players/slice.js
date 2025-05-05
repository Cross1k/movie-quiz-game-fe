import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  host: { socketId: null },
  player: { socketId: null, points: 0, name: "", logo: "" },
  game: { socketId: null },
};

const playerSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    setHostId: (state, action) => {
      state.host.socketId = action.payload;
    },
    setGameId: (state, action) => {
      state.game.socketId = action.payload;
    },
    setPlayerId: (state, action) => {
      state.player.socketId = action.payload.playerSocket;
    },
  },
});

export const playerReducer = playerSlice.reducer;
export const { setHostId, setGameId, setPlayerId } = playerSlice.actions;
