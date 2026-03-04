module.exports = {
  'apps/frontend/**/*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  'apps/backend/**/*.{js,ts}': ['eslint --fix', 'prettier --write'],
  '**/*.{json,md,yml,yaml}': ['prettier --write'],
  'apps/frontend/**/*.{ts,tsx}': () => 'pnpm --filter frontend typecheck',
  'apps/backend/**/*.ts': () => 'pnpm --filter backend typecheck',
};
