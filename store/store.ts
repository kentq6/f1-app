import { configureStore } from "@reduxjs/toolkit";
import driverReducer from './driverSlice';
import sessionFiltersReducer from './sessionFiltersSlice';

export const store = configureStore({
  reducer: {
    sessionFilters: sessionFiltersReducer,
    drivers: driverReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
