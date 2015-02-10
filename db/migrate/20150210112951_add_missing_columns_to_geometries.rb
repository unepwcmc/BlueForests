class AddMissingColumnsToGeometries < ActiveRecord::Migration
  def change
    unless Rails.env.production?
      add_column :geometries, :condition, :integer
      add_column :geometries, :habitat, :text
      add_column :geometries, :the_geom_webmercator, :geometry
      add_column :geometries, :carbon_view, :geometry
    end
  end
end
