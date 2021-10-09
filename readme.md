<div align="center">
  <img src="https://raw.githubusercontent.com/AlphaNecron/Void/dev/public/banner.png" width="480" height="270"/>

  A self-hosted file hosting service based on Zipline with many features. 

  ![Build stable](https://img.shields.io/github/workflow/status/AlphaNecron/Void/CI:%20Build/v0?color=%2368D391&label=stable&logo=github&style=for-the-badge)
  ![Build stable](https://img.shields.io/github/workflow/status/AlphaNecron/Void/CI:%20Build/dev?color=%2368D391&label=dev&logo=github&style=for-the-badge)
  ![Stars](https://img.shields.io/github/stars/AlphaNecron/Void?color=%23B794F4&logo=github&style=for-the-badge)
  ![Version](https://img.shields.io/github/package-json/v/AlphaNecron/Void/v0?color=%23B794F4&label=latest&logo=react&logoColor=ffffff&style=for-the-badge)
  ![Last commit](https://img.shields.io/github/last-commit/AlphaNecron/Void/dev?color=%234FD1C5&logo=github&style=for-the-badge)
</div>

### Requirements
  - `node` >= 14
  - PostgreSQL
  - Either `yarn` or `npm`

### Installation / Deployment
  ```sh
  git clone https://github.com/AlphaNecron/Void.git
  cd Void
  yarn install # or npm install
  cp config.example.toml config.toml
  nano config.toml # edit the config file
  yarn build # or npm run build
  yarn start # or npm start
  ```

### Docker
  ```sh
  git clone https://github.com/AlphaNecron/Void.git
  cd Void
  cp config.example.toml config.toml
  nano config.toml # edit the config file
  docker pull alphanecron/void:v0
  docker run -p 3000:3000 -v $PWD/config.toml:/void/config.toml -d alphanecron/void:v0
  ```

### Docker compose
  ```sh
  git clone https://github.com/AlphaNecron/Void.git
  cd Void
  cp config.example.toml config.toml
  nano config.toml # edit the config file
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
  ```toml
  [core]
  secure = false # Whether to use https or not
  secret = 'supersecretpassphrase' # The secret used to sign cookie
  host = '0.0.0.0' # The host Void should run on
  port = 3000 # The port Void should run on
  database_url = 'postgres://username:password@localhost:5432/db_name' # PostgreSQL database url

  [bot]
  enabled = false # Whether to enable the bot or not
  prefix = '&' # Bot's prefix
  token = '' # Bot's token
  admin = [''] # Admin ids
  log_channel = '' # The channel where logs are sent, leave blank to disable logging
  default_uid = 1 # The default user id used to shorten and upload
  hostname = 'example.com' # The hostname shortened urls should use in Twilight

  [shortener]
  allow_vanity = true # Whether to allow vanity urls or not
  length = 6 # Slug length
  route = '/go' # Route to serve shortened urls

  [uploader]
  raw_route = '/r' # Route to serve raw contents
  length = 6 # Slug length
  directory = './uploads' # The directory where images are stored
  blacklisted = ['exe'] # Blacklisted extensions
  ```

### Features
  - Configurable
  - Fast and reliable
  - Elegant Web UI
  - Built with Next.js & React
  - Token-protected uploading
  - Easy to setup
  - Invisible URL
  - Emoji URL
  - Text previewing (with syntax highlighting)
  - Video embed
  - URL shortener
  - Discord bot
  - Docker support
  - Password-protected URL
  - Embed customization (with variables)

### Contribution
  - All pull requests must be made in `dev` branch, pull requests in `v0` will be closed.

### Bot permissions
  #### These permissions are required for the bot to work properly (27712):
    - Add reactions
    - Read messages
    - Send messages 
    - Manage messages
    - Embed links

### Todo
  - Discord integration
  - Album / Bulk upload