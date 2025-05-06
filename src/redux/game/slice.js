import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  whoAnswering: null,
  themes: null,
  frames: [],
  scoreTable: [],
  winnerName: null,
  winnerPts: null,
  chosenBundle: null,
  allBundles: null,
  selectedFrame: 0,
  playerAnswer: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setWhoAnswering: (state, action) => {
      state.whoAnswering = action.payload;
    },
    setFrames: (state, action) => {
      state.frames = action.payload;
    },
    setScoreTable: (state, action) => {
      state.scoreTable = action.payload;
    },
    setWinnerName: (state, action) => {
      state.winnerName = action.payload;
    },
    setWinnerPts: (state, action) => {
      state.winnerPts = action.payload;
    },
    setChosenBundle: (state, action) => {
      state.chosenBundle = action.payload;
    },
    setAllBundles: (state, action) => {
      state.allBundles = action.payload;
    },
    setSelectedFrame: (state, action) => {
      state.selectedFrame = action.payload;
    },
    setPlayerAnswer: (state, action) => {
      state.playerAnswer = action.payload;
    },
  },
});

export const {
  setAllBundles,
  setChosenBundle,
  setFrames,
  setPlayerAnswer,
  setScoreTable,
  setSelectedFrame,
  setWhoAnswering,
  setWinnerName,
  setWinnerPts,
} = gameSlice.actions;

export const gameReducer = gameSlice.reducer;
