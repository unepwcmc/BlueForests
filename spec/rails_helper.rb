ENV['RAILS_ENV'] ||= 'test'
require 'spec_helper'
require File.expand_path('../../config/environment', __FILE__)
require 'rspec/rails'
# Add additional requires below this line. Rails is not loaded until this point!

require 'webmock/rspec'

ActiveRecord::Migration.maintain_test_schema!

module ControllerHelpers
  def sign_in(admin = double('admin'))
    if admin.nil?
      allow(request.env['warden']).to receive(:authenticate!).and_throw(:warden, {:scope => :admin})
      allow(controller).to receive(:current_admin).and_return(nil)
    else
      allow(request.env['warden']).to receive(:authenticate!).and_return(admin)
      allow(controller).to receive(:current_admin).and_return(admin)
    end
  end
end

RSpec.configure do |config|
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!

  config.include Devise::TestHelpers, :type => :controller
  config.include ControllerHelpers, :type => :controller
end
