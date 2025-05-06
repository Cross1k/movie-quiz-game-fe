import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  gameStart: false,
  gameEnd: false,
  roundStart: false,
  modalIsOpen: false,
  sessionId: null,
  personalId: null,
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setStartGame: (state, action) => {
      state.gameStart = action.payload;
    },
    setGameEnd: (state, action) => {
      state.gameEnd = action.payload;
    },
    isRoundStart: (state, action) => {
      state.roundStart = action.payload;
    },
    isModalOpen: (state, action) => {
      state.modalIsOpen = action.payload;
    },
    sessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    personalId: (state, action) => {
      state.personalId = action.payload;
    },
  },
});

export const {
  setGameEnd,
  setStartGame,
  isModalOpen,
  isRoundStart,
  sessionId,
  personalId,
} = commonSlice.actions;

export const commonReducer = commonSlice.reducer;
