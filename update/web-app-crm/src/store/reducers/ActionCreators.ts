import { AppDispatch } from "../store";
import axios from "axios";
import { authSlice } from "./AuthSlice";
import IAuthResponse from "../../models/users/auth/IAuthResponse";
import MainApi from "../../constants/api/main/main.api";
import AuthApi from "../../constants/api/main/auth.api";

export const authSignIn = () => async(dispatch: AppDispatch) => {
    try{
        dispatch(authSlice.actions.signIn());
        const response = await axios.get<IAuthResponse>(MainApi.CLIENT_SERVER + AuthApi.LOGIN);
        dispatch(authSlice.actions.signInSuccess(response.data));
    }catch(e){
        dispatch(authSlice.actions.signInError((e as Error).message));
    }
};
