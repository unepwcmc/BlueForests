class AddCountryIdToGeometries < ActiveRecord::Migration
  def change
    unless Rails.env.production?
      add_column :geometries, :country_id, :string
    end
  end
end
