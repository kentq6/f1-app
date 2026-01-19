import { createSlice } from '@reduxjs/toolkit';

const sessionFiltersSlice = createSlice({
  name: 'sessionFilters',
  initialState: {
    selectedYear: 0,
    selectedCircuit: "",
    selectedSession: "",
  },
  reducers: {
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload; 
    },
    setSelectedCircuit: (state, action) => {
      state.selectedCircuit = action.payload; 
    },
    setSelectedSession: (state, action) => {
      state.selectedSession = action.payload; 
    },
  },
});

export const { setSelectedYear, setSelectedCircuit, setSelectedSession } = sessionFiltersSlice.actions; 
export default sessionFiltersSlice.reducer;