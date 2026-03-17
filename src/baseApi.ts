import { APIRequestContext, request } from "@playwright/test";
import { env } from "./config/env";
import { UserRegisterRequest } from "./models/user.models";
import { USER_ROUTES } from "./routes/user.routes";

export class BaseApi {
  protected request!: APIRequestContext;

  async init() {
    this.request = await request.newContext({
      baseURL: env.API_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  async close() {
    await this.request.dispose();
  }


}

