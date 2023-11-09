## Run tests

The LetsGo monorepo uses the [Jest](https://jestjs.io/) test framework for individual components and packages. In addition, test running is streamlined through the [turborepo](https://turbo.build/repo)'s inrecemental build logic, which allows you to quickly run tests for only those components that have changed.

### Prerequisities

Before running tests, satisfy the same prerequisities as for [running your app locally](./run-locally.md#prerequisities).

### Side effects

There is a variety of tests in the LetsGo monorepo, from simple API level tests to integration tests that cut through many layers of the app all the way to the database.

Some tests will write data to the database. While all tests make the best effort to clean up after themselves and not affect artifacts they have not created, it is not a good idea to run tests in the production environment once you have live customers, unless you know exactly what you are doing.

See how to [manage multiple deployments](./manage-multiple-deployments.md) to address this issue by isolating your production and development environments.

### Run tests globally

You can run all tests in the monorepo from the root directory of your project with the following command:

```bash
yarn test
```

This will run tests for all components of the monorepo that have a `test` script defined in their `package.json` file. Note that this mechanism uses the [turborepo](https://turbo.build/repo)'s inrecemental build logic, which means that tests will be skipped for components that have not changed (and their dependencies have not changed) since the last test run. If you want to override this logic and force all tests in the monorepo to run regardless of any changes, use this command instead:

```bash
yarn test --force
```

You can also selectively run tests for only one component using the `--filter` option, e.g.:

```bash
yarn test --filter api --force
yarn test --filter @letsgo/trust
```

The parameter you provide to `--filter` is the name of the component from its `package.json` file.

### Run tests for individual components

You can also run tests for individual components of your app by issuing the `yarn test` command from that component's directory:

```bash
cd packages/trust
yarn test
```

This mechanism does not use [turborepo](https://turbo.build/repo)'s inrecemental build logic and instead simply executes the `test` script from `package.json`. It is often a more conveninent way of running tests for the component you are currently working on.
