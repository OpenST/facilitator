Steps to run the system test

To generate ethereum accounts run the account_creation script

- You should provide account count for the number of accounts to be created and password for each account.
  ```
  ./node_modules/.bin/ts-node system_test/m1_facilitator/accounts/account_creation.ts
  ```

- You should fund these account mannually with GOETH on Goerli chain

- Add newly created accounts `depositAccounts[]` and `withdrawAccounts[]` in `config.json` file.

- Now you can run system test with the following command
  ```
  npm run test:system_test
  ```
