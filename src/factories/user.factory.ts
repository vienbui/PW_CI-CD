import type { UserRegisterRequest } from '../models/user.models';

const defaultAddress = {
  street: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  country: 'USA',
  postal_code: '62701',
};

/**
 * Build a UserRegisterRequest with optional overrides.
 * Use for tests; generates a unique email by default to avoid conflicts.
 */
export function buildUserRegisterRequest(
  overrides: Partial<UserRegisterRequest> = {}
): UserRegisterRequest {
  const uniqEmail = `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}@example.com`;
  const { address: addressOverrides, ...restOverrides } = overrides;
  return {
    first_name: 'John',
    last_name: 'Doe',
    phone: '0987654321',
    dob: '1990-01-15',
    password: 'SuperSecure@123',
    email: uniqEmail,
    ...restOverrides,
    address: {
      ...defaultAddress,
      ...addressOverrides,
    },
  };
}

export const userFactory = {
  build: buildUserRegisterRequest,
};
