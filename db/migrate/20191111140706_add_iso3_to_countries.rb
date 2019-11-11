class AddIso3ToCountries < ActiveRecord::Migration
  def change
    add_column :countries, :iso3, :string
  end
end
