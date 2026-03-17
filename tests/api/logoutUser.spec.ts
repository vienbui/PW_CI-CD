import { test, expect } from '@playwright/test';
import { UserServices } from '../../src/services/user.services';
import { userFactory } from '../../src/factories/user.factory';

let userService: UserServices;

test.afterEach(async () => {
  if (userService) await userService.close();
});

test('logout user', async () => {
  userService = new UserServices();
  await userService.init();

  const registerPayload = userFactory.build();
  await userService.registerUser(registerPayload);

  const loginPayload = { email: registerPayload.email, password: registerPayload.password };
  const loginResponse = await userService.loginUser(loginPayload);
  expect(loginResponse.status()).toBe(200);

  const { access_token } = await loginResponse.json();
  const response = await userService.logoutUser(access_token);

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody.message).toBe('Successfully logged out');
});

test('logout without token returns 401', async () => {
  userService = new UserServices();
  await userService.init();

  const response = await userService.logoutUser('');

  expect(response.status()).toBe(401);
});
