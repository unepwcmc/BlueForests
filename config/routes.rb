BlueCarbon::Application.routes.draw do
  root :to => 'pages#home'

  require 'sidekiq/web'
  mount Sidekiq::Web => '/admin/sidekiq'

  get 'users/me' => 'users#me'

  get 'proxy/:habitat/:z/:x/:y' => 'proxy#tiles'
  post 'proxy/maps' => 'proxy#maps'

  devise_for :users, path_prefix: 'my', controllers: { sessions: 'sessions' }
  resources :users

  resources :validations do
    collection { get :export }
  end

  resources :photos, only: :create
  resources :areas do
    resources :mbtiles, only: :show
  end

  get 'tool' => 'analysis#index', as: :tool
  get 'help' => 'pages#help', as: :help
  get 'methodology' => 'pages#methodology', as: :methodology
end
