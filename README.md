# BlueCarbon

Blue Carbon is a Rails application to analyse the data collected about
blue carbon in various country's coastlines, as well as acting as an
admin interface for the [tablet data collection
tool](https://github.com/unepwcmc/BlueCarbonMobileNext).

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

Use your favourite editor (as long as it's vim) to fill in the blanks:

```
vim .env
```

### Workers

Sidekiq is used to run MBTile generation in the background. While redis
is running, you can start the workers with:

```
bundle exec sidekiq
```

## Architecture

## Deployment

The app is now deployed on Brightbox....and can be deployed in the normal way.

### CartoDB

The app depends on a few things existing in CartoDB, namely the habitat
tables and the views for use in displaying calculations.

The views, if they don't already exist, can be created with:

```
bundle exec rake cartodb:setup
```

Setting up the habitat tables is a bit more fiddly. If you're lucky,
someone else will have done it already, or imported from some
shapefiles.

You need one table per habitat, and one set of habitat tables per
environment. Given the habitats `mangrove`, `seagrass` and `saltmarsh`,
you would need to setup:

* blueforest_mangrove_staging
* blueforest_mangrove_production
* blueforest_mangrove_development
* blueforest_seagrass_staging
* blueforest_seagrass_production
* blueforest_seagrass_development
* blueforest_saltmarsh_staging
* blueforest_saltmarsh_production
* blueforest_saltmarsh_development

There is a [template
table](https://carbon-tool.cartodb.com/tables/blueforest_template/) to
duplicate from, as CartoDB does not let you create tables manually via
SQL.
