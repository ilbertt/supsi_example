# supsi_example

Welcome to your new supsi_example project and to the internet computer development community. By default, creating a new project adds this README and some template files to your project directory. You can edit these template files to customize your project and to include your own code to speed up the development cycle.

To get started, you might want to explore the project directory structure and the default configuration file. Working with this project in your development environment will not affect any production deployment or identity tokens.

To learn more before you start working with supsi_example, see the following documentation available online:

- [Quick Start](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)
- [SDK Developer Tools](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- [Motoko Programming Language Guide](https://internetcomputer.org/docs/current/motoko/main/motoko)
- [Motoko Language Quick Reference](https://internetcomputer.org/docs/current/motoko/main/language-manual)

If you want to start working on your project right away, you might want to try the following commands:

```bash
cd supsi_example/
dfx help
dfx canister --help
```

## Running the project locally

If you want to test your project locally, you can use the following commands:

```bash
# Installs the dependencies
npm install

# Starts the replica, running in the background
dfx start --background

# Deploys your canisters to the replica and generates your candid interface
npm run deploy:local
```

Once the job completes, your application will be available at `http://127.0.0.1:4943?canisterId={frontend_canister_id}`.

If you have made changes to your backend canister, you can generate a new candid interface with

```bash
npm run generate
```

at any time. This is recommended before starting the frontend development server, and will be run automatically any time you run `npm run deploy:ic`.

If you are making frontend changes, you can start a development server with

```bash
npm start
```

Which will start a server at `http://localhost:5173/`, proxying API requests to the replica at port 4943.

## Deploying to the Internet Computer

If you want to deploy your project to the Internet Computer, you can use the following command:

```bash
npm run deploy:ic
```

## Components

### Documents

This component enables you to upload, download and delete files from the canister, based on user permissions that you can set. The UI is available at `http://127.0.0.1:4943/documents?canisterId={frontend_canister_id}`. There are three main libraries used:

- [assets](https://mops.one/assets), which manages the files in the canister and offers all the methods needed to execute operations on them
- [@dfinity/assets](https://www.npmjs.com/package/@dfinity/assets), which connects to the canister and offers few simple methods on the frontend
- [@dfinity/auth-client](https://www.npmjs.com/package/@dfinity/auth-client), which manages the authentication through the [Internet Identity](https://internetcomputer.org/docs/current/developer-docs/integrations/internet-identity/overview)

The relevant parts of the code are:

- [assets canister methods](./src/backend/main.mo#L40-L152) (backend), that exposes the methods necessary to have an [Asset canister](https://internetcomputer.org/docs/current/references/asset-canister/) interface, with which the frontend library can interact with it
- [authorization methods](./src/backend/main.mo#L26-L38) (backend), that exposes the methods to used to authorize users and check their authorization to upload and delete files from the canister.
- [store a file](./src/frontend/src/main.ts#L104-L114) (frontend), that uploads a file to the canister
- [download a file](./src/frontend/src/api.ts#L24-L39) (frontend), that downloads a file from the canister
- [delete a file](./src/frontend/src/api.ts#L24-L39) (frontend), that deletes a file from the canister
- [authorize a user](./src/frontend/src/main.ts#L171) (frontend), that authorizes a user
- [login](./src/frontend/src/identity.ts#L35-L48) (frontend), that logs in the user

Please note that you can also authorize a new user's principal using the command line:

```bash
npm run app:authorize -- <principal>
```

You'll need to do it when you deploy the canister for the first time and you want to manage files from the UI after logging in with your II.

### Sync

This component enables you to sync your canister with external data available from an HTTP API. The UI is available at `http://127.0.0.1:4943/sync?canisterId={frontend_canister_id}`. It uses the native [HTTPS Outcalls](https://internetcomputer.org/docs/current/developer-docs/integrations/https-outcalls/) feature of the Internet Computer.

The relevant parts of the code are:

- [fetch data from the API](./src/backend/main.mo#L194-L246) (backend), that executes an HTTPS outcall to the API to retrieve the data (dummy JSON data in this case) and saves them in the canister memory
- [transform data received from API](./src/backend/main.mo#L180-L192) (backend), that manipulates the HTTP response to make sure the replica reach the consensus, see [docs](https://internetcomputer.org/docs/current/developer-docs/integrations/https-outcalls/https-outcalls-how-it-works#transformation-function)
- [get the synced data from the canister](./src/frontend/src/api.ts#L145-L155) (frontend), that fetches the data that the canister saved during the synchronization
