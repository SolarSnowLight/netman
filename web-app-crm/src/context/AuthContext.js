//******************************************
// Данные авторизации (контекст авторизации)
//******************************************

import { createContext } from 'react';

function noop() {}

export const AuthContext = createContext({
    typeAuth: null,
    accessToken: null,
    refreshToken: null,
    usersId: null,
    attributes: null,
    modules: null,
    login: noop,
    logout: noop,
    isAuthenticated: false
});