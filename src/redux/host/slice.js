import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isStartButtonDisable: true,
  isNextButtonDisable: true,
};

const hostSlice = createSlice({
  name: "host",
  initialState,
  reducer: {
    startButton: (state, action) => {
      state.isStartButtonDisable = action.payload;
    },
    nextButton: (state, action) => {
      state.isNextButtonDisable = action.payload;
    },
  },
});

export const { startButton, nextButton } = hostSlice.actions;

export const hostReducer = hostSlice.reducer;
