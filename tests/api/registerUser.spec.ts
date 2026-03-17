import { test, expect } from '@playwright/test';
import { UserServices } from '../../src/services/user.services';
import { userFactory } from '../../src/factories/user.factory';

let userService: UserServices;

test.afterEach(async () => {
  if (userService) await userService.close();
});

test('register user', async () => {
  userService = new UserServices();
  await userService.init();

  const payload = userFactory.build();

  const response = await userService.registerUser(payload);
  const responseBody = await response.json();

  expect(response.status()).toBe(201);
  expect(responseBody.email).toBe(payload.email);
});


