import { test, expect } from '@playwright/test';
import { UserServices } from '../../src/services/user.services';
import { userFactory } from '../../src/factories/user.factory';

let userService: UserServices;

test.afterEach(async () => {
  if (userService) await userService.close();
});

test('refresh token returns new access token', async () => {
  userService = new UserServices();
  await userService.init();

  const registerPayload = userFactory.build();
  await userService.registerUser(registerPayload);

  const loginPayload = { email: registerPayload.email, password: registerPayload.password };
  const loginResponse = await userService.loginUser(loginPayload);
  expect(loginResponse.status()).toBe(200);

  const { access_token } = await loginResponse.json();
  const response = await userService.refreshToken(access_token);

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody.access_token).toBeDefined();
  expect(responseBody.token_type).toBeDefined();
  expect(responseBody.expires_in).toBeDefined();
});

test('refresh without token returns 401', async () => {
  userService = new UserServices();
  await userService.init();

  const response = await userService.refreshToken('');

  expect(response.status()).toBe(401);
});
