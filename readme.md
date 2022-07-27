<div align="center">
  <img src="https://raw.githubusercontent.com/AlphaNecron/Void/v1/public/banner.png" width="480" height="270" alt="Banner"/>

  <h4> A feature-rich self-hosted file hosting service.</h4>
  
  ![Build v1](https://img.shields.io/github/workflow/status/AlphaNecron/Void/Build/v1?colorA=000000&colorB=68D391&label=V1&logo=github&style=for-the-badge)
  ![Docker v1](https://img.shields.io/github/workflow/status/AlphaNecron/Void/Build/v1?colorA=000000&colorB=0db7ed&label=DOCKER&logo=docker&style=for-the-badge)
  ![Stars](https://img.shields.io/github/stars/AlphaNecron/Void?colorA=000000&colorB=4527A0&logo=github&style=for-the-badge)
  ![Version](https://img.shields.io/github/package-json/v/AlphaNecron/Void/v1?colorA=000000&colorB=4527A0&label=latest&logo=react&logoColor=ffffff&style=for-the-badge)
  ![Last commit](https://img.shields.io/github/last-commit/AlphaNecron/Void/v1?colorA=000000&colorB=4527A0&logo=github&style=for-the-badge)
</div>

> ⚠️ This is just a development branch, it **should not** be used for production.

### Requirements
  - `node >= 16`
  - `postgresql >= 14`
  - `yarn >= 3`

### Installation / Deployment
  ```sh
  git clone https://github.com/AlphaNecron/Void.git
  cd Void
  yarn install # or npm install
  cp config.example.json config.json
  nano config.json # edit the config file
  yarn prod # to build and start production server
  yarn dev # to start development server
  ```

### Docker
  ```sh
  git clone https://github.com/AlphaNecron/Void.git --branch=v1
  cd Void
  cp config.example.json config.json
  nano config.json # edit the config file
  docker pull alphanecron/void:v0
  docker run -p 3000:3000 -v $PWD/config.json:/void/config.json -d alphanecron/void:v1
  ```

### Docker compose
  ```sh
  git clone https://github.com/AlphaNecron/Void.git --branch=v1
  cd Void
  cp config.example.json config.json
  nano config.json # edit the config file
  docker-compose up --build -d
  ```

### Reverse proxy (nginx)
  ```nginx
  server {
      listen              443 ssl;
      server_name         your.domain;
      ssl_certificate     /path/to/cert;
      ssl_certificate_key /path/to/key;
      ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
      ssl_ciphers         HIGH:!aNULL:!MD5;
      client_max_body_size 100M;
      location / {
          proxy_pass http://localhost:3000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```

### Config schema
  ```json5
{
    "void": {
        "useHttps": false, // Whether to enable HTTPS for URLs created returned by API.
        "host": "0.0.0.0", // The host Void should run on.
        "port": 3000, // The port Void should run on.
        "secret": "secretmin32characters", // The secret key used to hash cookies. (*)
        "rateLimit": 1200, // Rate limit for users per hour. (**)
        "defaultDomain": "http://localhost:3000", // The base domain used for multiple purposes.
        "databaseUrl": "postgres://postgres:postgres@postgres/postgres", // The Postgres database URL.
        "url": {
            "allowVanityUrl": true, // Whether to allow users to shorten with vanity URLs.
            "length": 6 // The maximum length for URLs generated with shortener and uploader.
        },
        "discordProvider": {
          "clientId": "YOUR DISCORD CLIENT ID", // Discord client id, you can grab one in the Application dashboard.
          "clientSecret": "YOUR DISCORD CLIENT SECRET" // Discord client secret, you can grab one in the Application dashboard as well.
        },
        "file": {
            "outputDirectory": "./uploads", // The directory to save upload files.
            "blacklistedExtensions": [ ".zip", ".exe" ] // Prevent users from uploading files with certain extensions. (**)
        }
    }
}
  ```
(*): If it is empty, a random key will be generated, otherwise, it must be at least 32 characters.  
(**) Users with `ADMINISTRATION` permission will not be affected by this.

### Features
  - Configurable
  - Fast with eye-catching UI
  - Easy to install
  - Embed customization
  - Custom file viewer
  - Multiple URL charsets (`alphanumeric`, `emoji` and `invisible`)
  - Comes with Docker image
  - Discord integration (Login with Discord)
  - Open registration with referral codes
  - Web upload with progress
  - Dedicated Discord bot, mobile application as well as desktop application.  
  and more...

### Techstack
- [NextJS 12](https://nextjs.org) (Framework)
- [ReactJS](https://reactjs.org) (User interface)
- [NodeJS](https://nodejs.org) (Back-end)
- [Mantine](https://mantine.dev) (UI library)
- [Iron Session](https://www.npmjs.com/package/iron-session) (Authentication)
- [TTLCache](https://www.npmjs.com/package/@isaacs/ttlcache) (Caching)
- [Prisma](https://www.prisma.io) (ORM)
- [PostgreSQL](https://www.postgresql.org) (Database)
- [Yarn](https://yarnpkg.com) (Package manager)
- [TypeScript](https://www.typescriptlang.org) (Programming language)

### Credits
  - Some ideas from `diced/zipline`
  - Logo and favicon from `icons8`

### Default credentials
- Username: `void`
- Password: `voiduser`
