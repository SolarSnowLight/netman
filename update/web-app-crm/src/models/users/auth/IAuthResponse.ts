import IAttributes from "../IAttributes"
import IModules from "../IModules"

export default interface IAuthResponse {
    typeAuth: string | null | undefined
    accessToken: string | null | undefined
    refreshToken: string | null | undefined
    usersId: string | null | undefined
    attributes: IAttributes | null | undefined
    modules: IModules | null | undefined
}