if Rails.env.development? and ENV['BYEBUGPORT']
  require 'byebug'
  Byebug.start_server 'localhost', ENV['BYEBUGPORT'].to_i
end
