
const routes_config = {
    auth: '/auth',
    register: '/register',
    default: '/default',
    line: '/',

    function_creator: '/function/creator',
    function_creator_games_add: '/function/creator/games/add',
    function_creator_games_view_created: '/function/creator/games/view/created',
    function_creator_games_archive: '/function/creator/game/archive',
    function_creator_game_view: '/function/creator/game/view',

    function_moderator: '/function/moderator',
    function_moderator_creators_list: '/function/moderator/creators/list',
    function_moderator_creator_info: '/function/moderator/creator/info',
    function_moderator_game_moderation: '/function/moderator/game/moderation',

    function_manager: '/function/manager',

    function_admin: '/function/admin',

    function_superadmin: '/function/superadmin'
};

export default routes_config;