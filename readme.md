<div align="center">
  <img src="https://raw.githubusercontent.com/AlphaNecron/Void/v1/public/banner.png" width="480" height="270"/>

  <h4> A self-hosted file hosting service based on Zipline with many features.</h4>
  
  ![Build v1](https://img.shields.io/github/workflow/status/AlphaNecron/Void/Build/v1?color=68D391&label=V1&logo=github&style=for-the-badge)
  ![Docker v1](https://img.shields.io/github/workflow/status/AlphaNecron/Void/Build/v1?color=0db7ed&label=DOCKER&logo=docker&style=for-the-badge)
  ![Stars](https://img.shields.io/github/stars/AlphaNecron/Void?color=%23B794F4&logo=github&style=for-the-badge)
  ![Version](https://img.shields.io/github/package-json/v/AlphaNecron/Void/v1?color=%23B794F4&label=latest&logo=react&logoColor=ffffff&style=for-the-badge)
  ![Last commit](https://img.shields.io/github/last-commit/AlphaNecron/Void/v1?color=%234FD1C5&logo=github&style=for-the-badge)
</div>

> Void is being rewritten, it's highly unrecommended to try this branch, and its corresponding Docker image at the moment as this build is extremely buggy and incomplete. 

### Requirements
  - `node` >= 16
  - PostgreSQL
  - Either `yarn` or `npm`

### Installation / Deployment
  ```sh
  git clone https://github.com/AlphaNecron/Void.git
  cd Void
  yarn install # or npm install
  cp config.example.json config.json
  nano config.json # edit the config file
  yarn build # or npm run build
  yarn start # or npm start
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
        "databaseUrl": "postgres://postgres:postgres@postgres/postgres", // The Postgres database URL.
        "url": {
            "allowVanityUrl": true, // Whether to allow users to shorten with vanity URLs.
            "length": 6 // The maximum length for URLs generated with shortener and uploader.
        },
        "authProviders": { // You can add more providers here, as long as you provide the client ID, client secret add them to [...nextauth].ts.
          "discord": {
            "clientId": "YOUR DISCORD CLIENT ID", // Discord client id, you can grab one in the Application dashboard.
            "clientSecret": "YOUR DISCORD CLIENT SECRET" // Discord client sercet, you can grab one in the Application dashboard as well.
          }
        },
        "file": {
            "outputDirectory": "./uploads", // The directory to save upload files.
            "blacklistedExtensions": [ ".zip", ".exe" ] // Prevent users from uploading files with certain extensions.
        }
    }
}
  ```

### Features
  - Configurable
  - Fast and reliable
  - Elegant Web UI
  - Built with Next.js, React and Mantine
  - Token-protected uploading
  - Easy to setup
  - Invisible URL
  - Emoji URL
  - Text previewing (with syntax highlighting)
  - Video embed
  - Role-based permissions
  - URL shortener
  - Discord bot (Rewriting)
  - Login with social media
  - Docker support
  - Exploding and private images
  - Password-protected URL
  - Embed customization (with variables)

  and more...

### Contribution
  - All pull requests must be made in `dev` branch, pull requests in other branches will be rejected.

### Credits
  - Some code from `diced/zipline`
  - Logo and favicon from `icons8`
