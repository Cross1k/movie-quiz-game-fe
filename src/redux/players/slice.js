import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  player: { socketId: null, points: 0, name: "", logo: "" },
  isModalOpen: false,
};

const playerSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    setPlayerInfo: (state, action) => {
      state.player = action.payload;
    },
    isModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
  },
});

export const playerReducer = playerSlice.reducer;
export const { setPlayerInfo, isModalOpen } = playerSlice.actions;
