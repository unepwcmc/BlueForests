require 'rails_helper'

RSpec.describe MbtileGenerator do
  describe '.perform, given an mbtile id' do
    pending 'retrieves that mbtile' do
      mbtile = FactoryGirl.create(:mbtile)

      generator = MbtileGenerator.new
      generator.perform(mbtile.id)

      assigned_mbtile = generator.instance_variable_get(:@mbtile)
      expect(assigned_mbtile).to eq(mbtile)
    end
  end
end
