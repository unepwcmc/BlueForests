# BlueForests

BlueForests is a Rails application to analyse the data collected about
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

git clone https://github.com/tilemill-project/tilemill vendor/tilemill
cd vendor/tilemill
nvm install 8.15.0
npm install

cd ../..

git clone https://github.com/mapbox/projectmill.git vendor/projectmill
cd vendor/projectmill
npm config set registry http://registry.npmjs.org/
nvm install 0.10.24
npm install


cd ../..
bundle install
```

You'll need to setup a `.env` file to utilise CartoDB:

```
cp .env.example .env
```

Use your favourite editor (as long as it's vim) to fill in the blanks:

```
vim .env
```

### Seeds

Countries, Roles and Users are created by launching `bundle exec rake db:seed`, after creating the BlueForests database, and launching the migrations.

The `seeds.rb` file includes the creation of a user for every country-role combination, generating users like `super_admin@blueforests.io`, or `project_participant@spain.blueforests.io`. The password for all these users is `blueforests`.

NB: Users are only created in the `development`, `test`, and `staging` environments. Seeding the database in the `production` environment will only create countries and roles.

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

#### Views

The views, if they don't already exist, can be created with:

```
bundle exec rake cartodb:setup
```

The views are important as they allow the Validation queries to easily
handle data on a country level, rather than having to constantly filter
by `country_id`. Ideally this would be done by having separate tables
per country, but unfortunately at the time of writing it was not
possible to programmatically create tables on CartoDB.

#### Tables

Setting up the habitat tables is a bit more fiddly. If you're lucky,
someone else will have done it already, or imported from some
shapefiles.

You need one table per habitat, and one set of habitat tables per
environment. Given the habitats `mangrove`, `seagrass` and `saltmarsh`,
you would need to setup:

* blueforests_mangrove_staging
* blueforests_mangrove_production
* blueforests_mangrove_development
* blueforests_seagrass_staging
* blueforests_seagrass_production
* blueforests_seagrass_development
* blueforests_saltmarsh_staging
* blueforests_saltmarsh_production
* blueforests_saltmarsh_development

There is a [template
table](https://carbon-tool.cartodb.com/tables/blueforests_template/) to
duplicate from, as CartoDB does not let you create tables manually via
SQL.

With regards field sites, the table currently in use on CARTO is:

* blueforests_field_sites_2020_#{environment} (production currently missing)

Such table can be created with:

```
bundle exec rake cartodb:import_field_sites
```

For the above to work, it is necessary that the following tables already exists on CARTO:

* ecuador_study_sites
* madagascar_study_sites
* indonesia_study_sites
* uae_study_sites

Those are the source tables used to populate the main field sites table mentioned above.
