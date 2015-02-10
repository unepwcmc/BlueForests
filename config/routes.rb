BlueCarbon::Application.routes.draw do
  root :to => 'pages#home'

  get "/delayed_job" => DelayedJobWeb, :anchor => false

  get 'admins/me' => 'admins#me'

  devise_for :admins, path_prefix: 'my', controllers: { sessions: 'sessions' }
  resources :admins

  resources :validations
  get '/export/:habitat' => 'validations#export'
  get '/export' => 'validations#export'
  resources :photos, only: :create
  resources :areas do
    resources :mbtiles, only: :show
  end

  get '/:locale' => 'pages#home'
  scope "(:locale)", :locale => /en|ar/ do
    get 'home' => 'pages#home'
    get 'about' => 'pages#about'
    get 'help' => 'pages#help'
    get "layout" => 'analysis#index'
  end
end
