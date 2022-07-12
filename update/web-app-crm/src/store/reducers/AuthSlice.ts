import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { authSignIn } from "./ActionCreators";
import IAttributes from "../../models/users/IAttributes";
import IModules from "../../models/users/IModules";
import IAuthResponse from "../../models/users/auth/IAuthResponse";

interface AuthState{
    // Common data
    typeAuth: string | null | undefined,
    accessToken: string | null | undefined,
    refreshToken: string | null | undefined,
    usersId: number | null | undefined,
    attributes: IAttributes | null | undefined,
    modules: IModules | null | undefined,
    isAuthenticated: boolean

    // Communication haracteristics
    isLoading: boolean
    error: string
}

const initialState: AuthState = {
    typeAuth: null,
    accessToken: null,
    refreshToken: null,
    usersId: null,
    attributes: null,
    modules: null,
    isAuthenticated: false,
    isLoading: false,
    error: ''
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUp(state: AuthState, action: PayloadAction<IAuthResponse>){
            state.accessToken = action.payload.accessToken;
        },
        signIn(state: AuthState){
            state.isLoading = true;
        },
        signInSuccess(state: AuthState, action: PayloadAction<IAuthResponse>){
            state.isLoading = false;
            state.error = '';

            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.attributes = action.payload.attributes;
            state.modules = action.payload.modules;
        },
        signInError(state: AuthState, action: PayloadAction<string>){
            state.isLoading = false;
            state.error = action.payload;
        },
        logout(state: AuthState, action: PayloadAction<string>){}
    }
});

export default authSlice.reducer;
