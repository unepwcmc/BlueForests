class CreateGeometries < ActiveRecord::Migration
  def change
    # Only needed for test environment, but it is needed on development
    # to load it to the schema...
    unless Rails.env.production?
      create_table :geometries do |t|
        t.geometry :the_geom
      end
    end
  end
end
