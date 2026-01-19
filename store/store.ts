import { configureStore } from "@reduxjs/toolkit";
import sessionFiltersReducer from './sessionFiltersSlice';
import filteredSessionReducer from './filteredSessionSlice';
import driversDataReducer from './driversDataSlice';
import sessionsReducer from './sessionsDataSlice';

export const store = configureStore({
  reducer: {
    sessionFilters: sessionFiltersReducer,
    filteredSession: filteredSessionReducer,
    driversData: driversDataReducer,
    sessionsData: sessionsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
