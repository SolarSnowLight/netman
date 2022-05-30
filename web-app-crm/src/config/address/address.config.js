//**********************************************************************
// Конфигурационный файл содержащий пути для взаимодействия с сервером
//**********************************************************************

const address_config = {
    sequrity_access: '/sequrity/access',
    auth_register: '/auth/register',
    auth_login: '/auth/management/login',
    auth_oauth: '/auth/management/oauth',
    auth_logout: '/auth/management/logout',
    auth_refresh_token: '/auth/refresh/token',
    map_marks_free: '/map/marks/free',
    map_geocoder_address: '/map/geocoder/address',

    // Функции создателя
    function_creator_games_add: '/function/creator/games/add',
    function_creator_games_created: '/function/creator/games/created',
    function_creator_games_delete: '/function/creator/games/delete',

    // Функции модератора
    function_moderator_games_queue: '/function/moderator/games/queue',
    function_moderator_creator_info: "/function/moderator/creator/info",
    function_moderator_game_info: '/function/moderator/game/info',
    function_moderator_game_accepted: '/function/moderator/game/accepted',
    function_moderator_games_checked: "/function/moderator/games/checked",
    function_moderator_creators_list: "/function/moderator/creators/list",
    function_moderator_game_warning: '/function/moderator/game/warning',
    function_moderator_game_ban: '/function/moderator/game/ban',
    function_moderator_game_unban: '/function/moderator/game/unban',

    // Функции игрока
    function_player_games: '/function/player/games',
    function_player_info: '/function/player/info',
    function_player_info_update: '/function/player/info/update',
    function_player_statistics: '/function/player/statistics',
    function_player_command: '/function/player/command',

    // Общие функции взаимодействия с медиа сервером
    get_stats_instructions: '/media/download/stats/instructions',
    instructions_download: '/media/download/',
};

export default address_config;