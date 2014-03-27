require 'delayed/recipes'

set :stages, %w(production staging)
set :default_stage, 'staging'
require 'capistrano/ext/multistage'

set :application, "bluecarbon"
set :repository,  "https://github.com/unepwcmc/BlueCarbon.git"

set(:deploy_to) { File.join("", "home", user, application) }

set :user, "rails"

set :scm, :git # You can set :scm explicitly or Capistrano will make an intelligent guess based on known version control directory names
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

set :branch, "master"
set :scm_username, "unepwcmc-read"
set :git_enable_submodules, 1
default_run_options[:pty] = true # Must be set for the password prompt from git to work

set :use_sudo, false

# bundler bootstrap
require 'bundler/capistrano'

# if you want to clean up old releases on each deploy uncomment this:
after "deploy:restart", "deploy:cleanup"

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# If you are using Passenger mod_rails uncomment this:
namespace :deploy do
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end

# Database

namespace :database do
  desc "Generate a database configuration file"
  task :build_configuration do
    database_name = Capistrano::CLI.ui.ask("Database name: ")
    database_user = Capistrano::CLI.ui.ask("Database username: ")
    the_host = Capistrano::CLI.ui.ask("Database IP address: ")
    pg_password = Capistrano::CLI.password_prompt("Database user password: ")

    db_options = {
      "adapter" => "postgresql",
      "database" => database_name,
      "username" => database_user,
      "host" => the_host,
      "password" => pg_password
    }

    config_options = db_options.to_yaml
    run "mkdir -p #{shared_path}/config"
    put config_options, "#{shared_path}/config/database.yml"
  end

  desc "Links the configuration file"
  task :link_configuration_file do
    run "ln -nsf #{shared_path}/config/database.yml #{latest_release}/config/database.yml"
  end
end

after "deploy:setup", "database:build_configuration"
after "deploy:finalize_update", "database:link_configuration_file"

# CartoDB

namespace :cartodb do
  desc "Generate a cartodb configuration file"
  task :build_configuration do
    host = Capistrano::CLI.ui.ask("CartoDB host: ")
    oauth_key = Capistrano::CLI.ui.ask("CartoDB key: ")
    oauth_secret = Capistrano::CLI.ui.ask("CartoDB secret: ")
    username = Capistrano::CLI.ui.ask("CartoDB username: ")
    password = Capistrano::CLI.password_prompt("CartoDB password: ")

    cartodb_options = {
      "host" => host,
      "oauth_key" => oauth_key,
      "oauth_secret" => oauth_secret,
      "username" => username,
      "password" => password
    }

    config_options = {"production" => cartodb_options}.to_yaml
    run "mkdir -p #{shared_path}/config"
    put config_options, "#{shared_path}/config/cartodb_config.yml"
  end

  desc "Links the configuration file"
  task :link_configuration_file do
    run "ln -nsf #{shared_path}/config/cartodb_config.yml #{latest_release}/config/cartodb_config.yml"
  end
end

after "deploy:setup", "cartodb:build_configuration"
after "deploy:finalize_update", "cartodb:link_configuration_file"

# Email

#namespace :mail do
#  desc 'Generate setup_mail.rb file'
#  task :setup do
#    address = Capistrano::CLI.ui.ask("Enter the smtp mail address: ")
#    password = Capistrano::CLI.ui.ask("Enter the smtp user password: ")

#    template = File.read("config/deploy/templates/setup_mail.rb.erb")
#    buffer = ERB.new(template).result(binding)

#    put(buffer, "#{shared_path}/config/initializers/setup_mail.rb")
#  end

#  desc "Links the mail folder"
#  task :link_folder do
#    run "ln -s #{shared_path}/config/initializers/setup_mail.rb #{latest_release}/config/initializers/setup_mail.rb"
#  end
#end
#after "deploy:setup", "mail:setup"
#after "deploy:update_code", "mail:link_folder"

# Tilemill

set(:shared_tilemill_path) {"#{shared_path}/tilemill"}

namespace :tilemill do
  desc "Make a shared tilemill folder"
  task :make_shared_folder, :roles => :app do
    run "mkdir -p #{shared_tilemill_path}"
  end

  desc "Links the tilemill folder"
  task :link_folder, :roles => :db do
    run "ln -s #{shared_tilemill_path} #{latest_release}/lib/tilemill"
  end
end

after "deploy:setup", "tilemill:make_shared_folder"
after "deploy:update_code", "tilemill:link_folder"

# Delayed_job

after "deploy:stop",    "delayed_job:stop"
after "deploy:start",   "delayed_job:start"
after "deploy:restart", "delayed_job:restart"

# If you want to use command line options, for example to start multiple workers,
# define a Capistrano variable delayed_job_args:
#
#   set :delayed_job_args, "-n 2"

