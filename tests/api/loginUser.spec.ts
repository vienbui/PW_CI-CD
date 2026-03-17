import { test, expect } from '@playwright/test';
import { UserServices } from '../../src/services/user.services';
import { userFactory } from '../../src/factories/user.factory';

let userService: UserServices;

test.afterEach(async () => {
  if (userService) await userService.close();
});

test('login user', async () => {
  userService = new UserServices();
  await userService.init();

  const registerPayload = userFactory.build();
  await userService.registerUser(registerPayload);

  const loginPayload = { email: registerPayload.email, password: registerPayload.password };
  const response = await userService.loginUser(loginPayload);

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody.access_token).toBeDefined();
  expect(responseBody.token_type).toBe('bearer');
  expect(responseBody.expires_in).toBe(300);
});

test('login with wrong password returns 401', async () => {
  userService = new UserServices();
  await userService.init();

  const registerPayload = userFactory.build();
  await userService.registerUser(registerPayload);

  const response = await userService.loginUser({
    email: registerPayload.email,
    password: 'WrongPassword123!',
  });

  expect(response.status()).toBe(401);
});