import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "@/types/session"; // Omit this if import not allowed at this point

interface FilteredSessionState {
  filteredSession: Session | null;
}

const initialState: FilteredSessionState = {
  filteredSession: null,
};

const filteredSessionSlice = createSlice({
  name: "filteredSession",
  initialState,
  reducers: {
    setFilteredSession: (state, action: PayloadAction<Session | null>) => {
      state.filteredSession = action.payload;
    },
  },
});

export const { setFilteredSession } = filteredSessionSlice.actions;
export default filteredSessionSlice.reducer;
