BlueCarbon::Application.routes.draw do
  root :to => 'pages#home'

  match "/delayed_job" => DelayedJobWeb, :anchor => false

  match 'admins/me' => 'admins#me'

  devise_for :admins, path_prefix: 'my', controllers: { sessions: 'sessions' }
  resources :admins

  resources :validations
  match '/export/:habitat' => 'validations#export'
  match '/export' => 'validations#export'
  resources :photos, only: :create
  resources :areas do
    resources :mbtiles, only: :show
  end

  match '/:locale' => 'pages#home'
  scope "(:locale)", :locale => /en|ar/ do
    match 'home' => 'pages#home'
    match 'about' => 'pages#about'
    match 'help' => 'pages#help'
    match "layout" => 'analysis#index'
  end
end
