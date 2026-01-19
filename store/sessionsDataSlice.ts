import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "@/types/session";

const sessionsDataSlice = createSlice({
  name: "sessionsData",
  initialState: [] as Session[],
  reducers: {
    setSessionsData: (state, action: PayloadAction<Session[]>) => {
      return action.payload;
    },
  },
});

export const { setSessionsData } = sessionsDataSlice.actions;
export default sessionsDataSlice.reducer;
