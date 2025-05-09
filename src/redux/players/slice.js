import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  player: { socketId: null, points: 0, name: "", logo: "" },
};

const playerSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    setPlayerId: (state, action) => {
      state.player.socketId = action.payload;
    },
    setPlayerPts: (state, action) => {
      state.player.points = action.payload;
    },
    setPlayerName: (state, action) => {
      state.player.name = action.payload;
    },
  },
});

export const playerReducer = playerSlice.reducer;
export const { setPlayerId, setPlayerName, setPlayerPts } = playerSlice.actions;
