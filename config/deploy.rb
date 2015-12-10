# config valid only for current version of Capistrano
lock '3.4.0'

set :application, 'blueforests'
set :repo_url, 'git@github.com:unepwcmc/blueforests.git'

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp


set :branch, 'server-migration'

set :deploy_user, 'wcmc'


# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, "/home/#{fetch(:deploy_user)}/#{fetch(:application)}"

# Default value for :scm is :git
set :scm, :git
set :scm_username, "unepwcmc-read"


set :rvm_type, :user
set :rvm_ruby_version, '2.2.3'



set :ssh_options, {
  forward_agent: true,
}


# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
#set :log_level, :debug

# Default value for :pty is false
set :pty, true

# Default value for :linked_files is []

set :linked_files, %w{config/database.yml config/config.yml .env}

# Default value for linked_dirs is []
set :linked_dirs, fetch(:linked_dirs, []).push('log', 'tmp/pids', 'tmp/cache', 'tmp/sockets', 'vendor/bundle', 'public/system','lib/tilemill')


# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
set :keep_releases, 5

set :passenger_restart_with_touch, false

