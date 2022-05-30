/*
 * В данном файле содержится описание точки входа в веб-приложение.
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useRoutes } from '../../routes/routes';
import { useAuth } from '../../hooks/auth.hook';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './App.module.css';

const App = () => {
    const { typeAuth, accessToken, refreshToken, login, logout, usersId, attributes, modules } = useAuth();
    const isAuthenticated = !!accessToken;
    const routes = useRoutes(isAuthenticated, modules);

    return (
        <AuthContext.Provider value={{
            typeAuth, accessToken, refreshToken, usersId, attributes, modules, login, logout, isAuthenticated
        }}>
            <BrowserRouter>
                { /* Определение основного содержимого веб-приложения */}
                {isAuthenticated && < Navbar />}
                <div className="container">
                    {routes}
                </div>

                { /* Определение контейнера для уведомлений */}
                <ToastContainer
                    position="bottom-left"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </BrowserRouter>
        </AuthContext.Provider>
    );
}

export default App;