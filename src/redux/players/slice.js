import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  player: { socketId: null, points: 0, name: "", logo: "" },
};

const playerSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    setPlayerInfo: (state, action) => {
      state.player = action.payload;
    },
  },
});

export const playerReducer = playerSlice.reducer;
export const { setPlayerInfo } = playerSlice.actions;
