<div align="center">
  <img src="https://raw.githubusercontent.com/AlphaNecron/Void/dev/public/banner.png" width="240" height="135"/>
</div>

# Configuration


## Reverse proxy (nginx)
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

## Config schema
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
  max_size = 104857600 # Max upload size (users only), in bytes
  blacklisted = ['exe'] # Blacklisted file extensions (users only)
  ```

## Bot permissions
  **These permissions are required for the bot to work properly (27712):**
  
    - Add reactions
    - Read messages
    - Send messages 
    - Manage messages
    - Embed links
