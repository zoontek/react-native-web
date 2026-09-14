# Contributing

## Reporting Issues and Asking Questions

Before opening an issue, please search the [issue tracker](https://github.com/necolas/react-native-web/issues) to make sure your issue hasn't already been reported. Please note that your issue may be closed if it doesn't include the information requested in the issue template.

## Getting started

Visit the [Issue tracker](https://github.com/necolas/react-native-web/issues) to find a list of open issues that need attention.

Fork, then clone the repo:

```
git clone https://github.com/your-username/react-native-web.git
```

Install dependencies (requires Node.js >= 16.0):

```
pnpm install
```

## Build

Build a specific package:

```
pnpm --filter <package-name> build
```

For example, this will build `react-native-web`:

```
pnpm --filter react-native-web build
```

Build all packages that can be built:

```
pnpm build
```

## Develop

Develop a specific package:

```
pnpm --filter <package-name> dev
```

For example, this command will watch and rebuild the `react-native-web` package:

```
pnpm --filter react-native-web dev
```

And this command will watch and rebuild the `react-native-web-examples` package:

```
pnpm --filter react-native-web-examples dev
```

## Test

Run the monorepo linter:

```
pnpm lint
```

Run the monorepo type checker:

```
pnpm typecheck
```

Run the monorepo unit tests:

```
pnpm unit
```

Run all the automated tests:

```
pnpm test
```

## New Features

Please open an issue with a proposal for a new feature or refactoring before starting on the work. We don't want you to waste your efforts on a pull request that we won't want to accept.

## Pull requests

**Before submitting a pull request**, please make sure the following is done:

1. Fork the repository and create your branch from `master`.
2. If you've added code that should be tested, add tests!
3. If you've changed APIs, update the documentation.
4. Ensure the tests pass (`pnpm test`).

You should see a pre-commit hook run before each commit.

You can now submit a pull request, referencing any issues it addresses.

Please try to keep your pull request focused in scope and avoid including unrelated commits.

After you have submitted your pull request, it's recommended that **you** perform the first code review. We'll try to get back to you as soon as possible and may suggest changes.

Thank you for contributing!

## Releases

To commit, publish, and push a final version:

```
pnpm release <version> --otp=<otp-code>
```

Release candidates or versions that you'd like to publish to npm, but do not want to produce a commit and push it to GitHub:

```
pnpm release <version> --skip-git
```
