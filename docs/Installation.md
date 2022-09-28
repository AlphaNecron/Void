<div align="center">
  <img src="https://raw.githubusercontent.com/AlphaNecron/Void/dev/public/banner.png" width="240" height="135"/>
</div>

# Installation

**Default credentials**
  - Username: `admin`
  - Password: `voiduser`

With Void there are 3 ways to install and deploy:
1. [Manual](#manual)
2. [Docker](#Docker)
3. [Docker compose](#Docker-compose)

## Manual
  **Requirements**
  
  - `node` >= 14
  - PostgreSQL
  - Either `yarn` or `npm`
  
  **Install**
  
  ```sh
  git clone https://github.com/AlphaNecron/Void.git
  cd Void
  yarn install # or npm install
  cp config.example.toml config.toml
  nano config.toml # edit the config file
  yarn build # or npm run build
  yarn start # or npm start
  ```

## Docker
  ```sh
  git clone https://github.com/AlphaNecron/Void.git
  cd Void
  cp config.example.toml config.toml
  nano config.toml # edit the config file
  docker pull alphanecron/void:v0
  docker run -p 3000:3000 -v $PWD/config.toml:/void/config.toml -d alphanecron/void:v0
  ```

## Docker compose
  ```sh
  git clone https://github.com/AlphaNecron/Void.git
  cd Void
  cp config.example.toml config.toml
  nano config.toml # edit the config file
  docker-compose up --build -d
  ```
