import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { postAPI } from "../services/PostService";
import authReducer from "./reducers/AuthSlice";

/* Root Reducer */
const rootReducer = combineReducers({
  authReducer,
  [postAPI.reducerPath]: postAPI.reducer,
});

/* Export anonimous function for configure store */
export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(postAPI.middleware),
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
