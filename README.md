# bun_js

To install dependencies:

```bash
bun install | npm install
```

```bash
npm i --save-dev @types/node #optional
npm i --save-dev @types/bun  #optional
npm i dotenv
npm i express
npm i mysql2
npm i @aws-sdk/client-s3
npm i @aws-sdk/s3-request-presigner
npm i axios
npm i bullmq
```

To run:

```bash
bun run index.ts / & "$env:USERPROFILE\.bun\bin\bun" run index.ts
```

Redis:

```bash
keys *
flushall
```

# Setup .env
```bash
ASN_URL = "http://127.0.0.1:8000/" # frapper url
ASN_API_KEY = "706328ff4cec659"    # admin api key
ASN_API_SECRET = "25bead9600dd989" # admin secret key

# old asn database
ASN_DB_HOST = "10.143.10.137"   
ASN_DB_USER = "esiadmin"
ASN_DB_PASSWORD = "esiadmin@vend0rport@1"
ASN_DB_DATABASE = "rt_eretailds"
ASN_DB_PORT = 3306

# bun js database / install or create schema for bunjs
BUN_DB_HOST = "127.0.0.1"
BUN_DB_USER = "root"
BUN_DB_PASSWORD = "password"
BUN_DB_DATABASE = "bun_js"
BUN_DB_PORT = 3306
```


# Docker 
docker build -t bun-app .
docker run -p 3000:3000 bun-app

