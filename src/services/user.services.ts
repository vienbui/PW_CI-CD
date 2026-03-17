import { BaseApi } from "../baseApi";
import { UserRegisterRequest } from "../models/user.models";
import { USER_ROUTES } from "../routes/user.routes";
import { UserLoginRequest } from "../models/user.models";

export class UserServices extends BaseApi {

  async registerUser(payload: UserRegisterRequest) {
    return this.request.post(USER_ROUTES.REGISTER, {
      data: payload
    });
  }

  async loginUser(payload: UserLoginRequest) {
    return this.request.post(USER_ROUTES.LOGIN, {
      data: payload
    });
  }

  async getUser(token: string) {
    return this.request.get(USER_ROUTES.GET_USER, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async refreshToken(token: string) {
    return this.request.get(USER_ROUTES.REFRESH, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async logoutUser(token: string) {
    return this.request.get(USER_ROUTES.LOGOUT, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}