# Welcome to Mapa

For H, with ❤️

# Create self-signed SSL certs for local development

Install [mkcert](https://github.com/FiloSottile/mkcert) and generate self-signed certs for local dev.

```
brew install mkcert
mkcert -install
```

```
mkdir keys && cd $_
mkcert mapa.test.keithmoss.me
```

# Database setup

```sql
CREATE SCHEMA mapa;
```

# User setup

Add yourself to the app_allowedusers table before trying to login.

https://mapa.test.keithmoss.me/api/login/google-oauth2/

# Development setup

- Run `yarn dlx @yarnpkg/sdks vscode` in the root of the repo
- [Set Up ESLint and Prettier in a React TypeScript App (2023)](https://dev.to/eshankvaish/set-up-eslint-and-prettier-in-a-react-typescript-app-2022-29c9)
