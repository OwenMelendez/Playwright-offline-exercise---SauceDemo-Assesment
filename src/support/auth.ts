/** Where the one-time login (tests/auth.setup.ts) stores the session. */
export const AUTH_FILE = 'playwright/.auth/standard_user.json';

/** Opt a spec/describe out of the shared session: `test.use({ storageState: NO_AUTH })`. */
export const NO_AUTH = { cookies: [], origins: [] };
