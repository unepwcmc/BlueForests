source 'https://rubygems.org'

gem 'rails', '4.2.5'

gem 'pg'

gem 'devise'
gem 'devise-token_authenticatable', '~> 0.4.0'
gem 'cancancan', '~> 1.10'

gem 'rack-cors', :require => 'rack/cors'

gem 'bootstrap-generators'
gem 'simple_form'
gem 'rails-backbone'
gem 'jquery-rails'
gem 'html5-rails'

gem 'daemons'
gem 'sidekiq', '~> 4.0.1'
gem 'sinatra', :require => nil

gem 'rabl'

gem 'httparty', '~> 0.13.3'

gem 'activerecord-postgis-adapter', '~> 3.1.0'

gem 'paperclip', '~> 4.3.2'

group :assets do
  gem 'sass-rails'
  gem 'coffee-rails'

  gem 'compass-rails'
  gem 'compass-h5bp'

  gem 'uglifier', '>= 1.0.3'
end


group :development do
  gem 'capistrano', '~> 3.4', require: false
  gem 'capistrano-rails',   '~> 1.1', require: false
  gem 'capistrano-bundler', '~> 1.1', require: false
  gem 'capistrano-rvm',   '~> 0.1', require: false
  gem 'capistrano-sidekiq'
  gem 'capistrano-passenger', '~> 0.1.1', require: false
end




gem 'rspec-rails', '~> 3.4.0', group: [:test, :development]
group :test do
  gem 'factory_girl_rails', '~> 4.5.0'
  gem 'webmock', '~> 1.20.4'
  gem 'timecop', '~> 0.7.1'
end

gem 'dotenv-rails', '~> 1.0.2'

gem 'byebug', :group => [:test, :development]
