import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Driver } from "@/types/driver";

const driversDataSlice = createSlice({
  name: "driversData",
  initialState: [] as Driver[],
  reducers: {
    setDriversData: (state, action: PayloadAction<Driver[]>) => {
      return action.payload;
    },
  },
});

export const { setDriversData } = driversDataSlice.actions;
export default driversDataSlice.reducer;
