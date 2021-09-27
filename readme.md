<div align="center">
  <img src="https://raw.githubusercontent.com/AlphaNecron/Draconic/v0/public/banner.png"/>
A self-hosted file hosting service based on Zipline with many features. 

![Build stable](https://img.shields.io/github/workflow/status/AlphaNecron/Draconic/CI:%20Build/v0?color=%2368D391&label=stable&logo=github&style=for-the-badge)
![Build stable](https://img.shields.io/github/workflow/status/AlphaNecron/Draconic/CI:%20Build/dev?color=%2368D391&label=dev&logo=github&style=for-the-badge)
![Stars](https://img.shields.io/github/stars/AlphaNecron/Draconic?color=%23B794F4&logo=github&style=for-the-badge)
![Version](https://img.shields.io/github/package-json/v/AlphaNecron/Draconic/v0?color=%23B794F4&label=latest&logo=react&logoColor=ffffff&style=for-the-badge)
![Last commit](https://img.shields.io/github/last-commit/AlphaNecron/Draconic/dev?color=%234FD1C5&logo=github&style=for-the-badge)
</div>

### Requirements
  - `node` >= 16
  - PostgreSQL
  - Either `yarn` or `npm`

### Installation / Deployment
  ```sh
  git clone https://github.com/AlphaNecron/Draconic.git
  cd Draconic
  yarn install # or npm install
  cp config.example.toml config.toml
  nano config.toml # edit the config file
  yarn build # or npm build
  yarn start # or npm start
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

### Features
  - Configurable
  - Super fast
  - Built with Next.js & React
  - Token protected uploading
  - Easy to setup
  - Invisible URL
  - Emoji URL
  - Text previewing (with syntax highlighting)
  - Video embed
  - URL shortener

### Contribution
  - All contribution must be made in `dev` branch, other contributions in `v0` will be rejected.

### Todo
  - Docker support
  - Discord bot
  - Discord integration
  - Album / Bulk upload