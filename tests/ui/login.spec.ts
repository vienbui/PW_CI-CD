import { test, expect } from '@playwright/test';
import { UserServices } from '../../src/services/user.services';
import { userFactory } from '../../src/factories/user.factory';
import { env } from '../../src/config/env';

let userService: UserServices;

test.afterEach(async () => {
  if (userService) await userService.close();
});

test('login with registered user', async ({ page }) => {
  userService = new UserServices();
  await userService.init();

  const registeredUser = userFactory.build();
  await userService.registerUser(registeredUser);
  console.log('registeredUser', registeredUser);
  console.log('registeredUser.email', registeredUser.email);
  console.log('registeredUser.password', registeredUser.password);

  await page.goto(`/`);
  await page.getByTestId('nav-sign-in').click();
  await page.getByTestId('email').fill(registeredUser.email);
  await page.getByTestId('password').fill(registeredUser.password);
  await page.getByTestId('login-submit').click();

  await expect(page.getByRole('heading', {name: 'My Account'} )).toBeVisible();
});