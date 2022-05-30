/*
* Утилита для обновления refresh токена
*/

export const refreshTokenSetup = (res) => {
    let refreshTiming = (res.tokenObj.expires_in || (3600 - 5 * 60) * 1000);

    const refreshToken = async() => {
        const authRes = await res.reloadAuthResponse();
        
        refreshTiming = (res.tokenObj.expires_in || (3600 - 5 * 60) * 1000);

        setTimeout(refreshToken, refreshTiming);
    }

    setTimeout(refreshToken, refreshTiming);
}