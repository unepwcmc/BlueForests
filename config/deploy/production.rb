set :domain, "bluecarbon.unep-wcmc.org"
server "raster-stats", :app, :web, :db, :primary => true

set :rails_env, "production" # added for Delayed_job
