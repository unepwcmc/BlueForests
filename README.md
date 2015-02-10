# BlueCarbon

EcoPlotter application to analyse the data collected about blue carbon in the Abu Dhabi coastline

## Development

### Getting Started

You will need the following dependencies installed:

```
brew install postgresql
brew install postgis
brew install redis

git clone git@github.com:mapbox/tilemill.git vendor/tilemill
cd vendor/tilemill
npm install

cd ../..

git clone https://github.com/mapbox/projectmill.git vendor/projectmill
cd vendor/projectmill
npm install
```

You'll need to setup a `.env` file to utilise CartoDB:

```
cp .env.example .env
```

Use your favourite editor (vim) to fill in the blanks:

```
vim .env
```

### Workers

Sidekiq is used to run MBTile generation in the background. While redis
is running, you can start the workers with:

```
bundle exec sidekiq
```

## Deployment

The app is now deployed on Brightbox....and can be deployed in the normal way.
