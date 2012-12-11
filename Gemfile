if RUBY_VERSION =~ /1.9/
  Encoding.default_external = Encoding::UTF_8
  Encoding.default_internal = Encoding::UTF_8
end

source 'https://rubygems.org'

gem 'rails', '3.2.8'

# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'

gem 'pg'
gem 'bootstrap-generators', '~> 2.1', :git => 'git://github.com/decioferreira/bootstrap-generators.git'
gem 'simple_form'
gem 'devise'
gem 'rack-cors', :require => 'rack/cors'
gem 'cartodb-rb-client'

gem 'rails-backbone'

gem 'daemons'
gem 'delayed_job_active_record'
gem 'delayed_job_web'

gem 'rvm-capistrano'
gem 'rabl'

gem 'activerecord-postgis-adapter', '0.4.1'

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  gem 'therubyracer', :platforms => :ruby
  gem 'libv8', '~> 3.11.8'

  gem 'uglifier', '>= 1.0.3'
end

gem 'jquery-rails'

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# To use Jbuilder templates for JSON
# gem 'jbuilder'

# Use unicorn as the app server
# gem 'unicorn'

# Deploy with Capistrano
gem 'capistrano'
gem 'capistrano-ext'

# To use debugger
gem 'debugger'
#gem 'ruby-debug19', require: 'ruby-debug', group: [:test, :development]

gem 'rspec-rails', '~> 2.0', group: [:test, :development]
gem 'database_cleaner', group: :test

group :development do
  gem 'guard-rspec'

  gem 'rb-inotify', '~> 0.8.8', :require => RUBY_PLATFORM.include?('linux') && 'rb-inotify'
  gem 'rb-fsevent', '~> 0.9.1', :require => RUBY_PLATFORM.include?('darwin') && 'rb-fsevent'
end
