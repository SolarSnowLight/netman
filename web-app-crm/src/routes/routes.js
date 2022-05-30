//**************************************************************
// Маршрутизация в зависимости от прав доступа пользователя
//**************************************************************

import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import AuthPage from '../containers/AuthPage';
import EmptyPage from '../containers/EmptyPage';
import ModeratorPage from '../containers/ModeratorPage';
import CreatorPage from '../containers/CreatorPage';
import ViewGamePage from '../containers/CreatorPage/ViewGamePage';
import CreatorListPage from '../containers/ModeratorPage/CreatorListPage';
import CreatorInfoPage from '../containers/ModeratorPage/CreatorInfoPage';
import GameModerationPage from '../containers/ModeratorPage/GameModerationPage';
import ViewSpecificGame from '../containers/CreatorPage/ViewSpecificGame';
import routes_config from '../config/routes/routes.config';

export const useRoutes = (isAuthenticated, modules) => {

    if (isAuthenticated && (modules)) {
        return (
            <Switch>
                {
                    //Маршрутизация функционала создателя
                    //.................................
                }

                {
                    (modules.creator === true) &&
                    <Route path={routes_config.function_creator} exact>
                        < CreatorPage />
                    </Route>
                }

                {
                    (modules.creator === true) &&
                    <Route path={routes_config.function_creator_games_add} exact>
                        < CreatorPage />
                    </Route>
                }

                {
                    (modules.creator === true) &&
                    <Route path={routes_config.function_creator_games_view_created} exact>
                        <ViewGamePage />
                    </Route>
                }

                {
                    (modules.creator === true) &&
                    <Route path={routes_config.function_creator_game_view} exact>
                        <ViewSpecificGame />
                    </Route>
                }

                {
                    //.................................
                }

                {
                    //Маршрутизация функционала модератора
                    //.................................
                }

                {
                    (modules.moderator === true) &&
                    <Route path={routes_config.function_moderator} exact>
                        < ModeratorPage />
                    </Route>
                }

                {
                    (modules.moderator === true) &&
                    <Route path={routes_config.function_moderator_creators_list} exact>
                        < CreatorListPage />
                    </Route>
                }

                {
                    (modules.moderator === true) &&
                    <Route path={routes_config.function_moderator_creator_info} exact>
                        < CreatorInfoPage />
                    </Route>
                }

                {
                    (modules.moderator === true) &&
                    <Route path={routes_config.function_moderator_game_moderation} exact>
                        < GameModerationPage />
                    </Route>
                }

                {
                    //.................................
                }

                {
                    //Маршрутизация функционала менеджера
                    //.................................
                }

                {
                    (modules.manager === true) &&
                    <Route path={routes_config.function_manager} exact>
                        <EmptyPage />
                    </Route>
                }

                {
                    //.................................
                }

                {
                    //Маршрутизация функционала администратора
                    //.................................
                }


                {
                    (modules.admin === true) &&
                    <Route path={routes_config.function_admin} exact>
                        <EmptyPage />
                    </Route>
                }

                {
                    //.................................
                }

                {
                    //Маршрутизация функционала супер-админа
                    //.................................
                }

                {
                    (modules.super_admin === true) &&
                    <Route path={routes_config.function_superadmin} exact>
                        <EmptyPage />
                    </Route>
                }

                {
                    //.................................
                }

                <Route path={routes_config.default} exact>
                    <EmptyPage />
                </Route>

                <Redirect to={routes_config.default}  />

                {
                    //Маршруты вне зависимости от доступа к определённому
                    //функциональному блоку
                    //.................................
                }


                {
                    //.................................
                }
            </Switch>
        );
    }

    return (
        <Switch>
            <Route path={routes_config.auth} exact>
                <AuthPage />
            </Route>

            <Route path={routes_config.line} exact>
                <AuthPage />
            </Route>

            <Redirect to={routes_config.line} />
        </Switch>
    );
}