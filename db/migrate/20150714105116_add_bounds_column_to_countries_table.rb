class AddBoundsColumnToCountriesTable < ActiveRecord::Migration
  def change
    add_column :countries, :bounds, 'double precision', array: true, default: []
  end
end
