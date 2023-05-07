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
