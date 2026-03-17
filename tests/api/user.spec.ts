import { test, expect } from '@playwright/test';
import { UserServices } from '../../src/services/user.services';
import { userFactory } from '../../src/factories/user.factory';

let userService: UserServices;

test.afterEach(async () => {
  if (userService) await userService.close();
});

test.describe('User - Register', () => {
  test('register user', async () => {
    userService = new UserServices();
    await userService.init();

    const payload = userFactory.build();

    const response = await userService.registerUser(payload);
    const responseBody = await response.json();

    expect(response.status()).toBe(201);
    expect(responseBody.email).toBe(payload.email);
  });
});

test.describe('User - Login', () => {
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
});

test.describe('User - Get Me', () => {
  test('get me user', async () => {
    userService = new UserServices();
    await userService.init();

    const registerPayload = userFactory.build();
    await userService.registerUser(registerPayload);

    const loginPayload = { email: registerPayload.email, password: registerPayload.password };
    const loginResponse = await userService.loginUser(loginPayload);
    expect(loginResponse.status()).toBe(200);

    const { access_token } = await loginResponse.json();

    const response = await userService.getUser(access_token);

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.email).toBe(registerPayload.email);
    expect(responseBody.first_name).toBe(registerPayload.first_name);
    expect(responseBody.last_name).toBe(registerPayload.last_name);
  });

  test('get me without token returns 401', async () => {
    userService = new UserServices();
    await userService.init();

    const response = await userService.getUser('');

    expect(response.status()).toBe(401);
  });
});

test.describe('User - Refresh Token', () => {
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
});

test.describe('User - Logout', () => {
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
});
