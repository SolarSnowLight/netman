import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.module.css";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { authSlice } from "../../store/reducers/AuthSlice";
import { authSignIn } from "../../store/reducers/ActionCreators";
import IModules from "../../models/users/IModules";
import IAuthResponse from "../../models/users/auth/IAuthResponse";
import IAttributes from "../../models/users/IAttributes";

function App() {
  const dispatch = useAppDispatch();
  const { setUp } = authSlice.actions;
  useEffect(() => {
    dispatch(
      setUp({
        accessToken: "bbb"
      } as IAuthResponse)
    );
  }, []);

  return (
    <div>
      <h1>Hello, world!</h1>
      <button onClick={() => {
        const text = prompt();
        dispatch(
          setUp({
            accessToken: text
          } as IAuthResponse)
        );
      }}>aaa</button>
    </div>
  );
}

export default App;

/*const {count} = useAppSelector(state => state.userReducer);
  const {increment} = userSlice.actions;
  const dispatch = useAppDispatch();*/

/*const dispatch = useAppDispatch();
  const {users} = useAppSelector(state => state.userReducer);

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);*/
