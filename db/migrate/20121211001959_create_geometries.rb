class CreateGeometries < ActiveRecord::Migration
  def change
    create_table :geometries do |t|
      t.geometry :the_geom

      t.timestamps
    end
  end
end
