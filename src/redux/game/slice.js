import { createSlice } from "@reduxjs/toolkit";

const intialState = {
  isAnswering: false,
  frames: [],
  scoreTable: [],
  gameEnd: false,
  winnerName: null,
  winnerPts: null,
  chosenBundle: null,
};
