# Kwentize Frontend

Frontend is made with Vite and React, to run it you need NodeJS and YARN, then you'll be able to run the project.

To upload files on IPFS we use popular service nft.storage and the backend is in Python, you can find it in `backend` folder of this repository.

Before build or run the project be sure to rename `.env.example` in `.env` and add needed informations:
- NFT.storage key
- URL of backend

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Compile and Minify for Production

```sh
yarn build
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```