class ChangeAreasCoordinatesType < ActiveRecord::Migration
  def up
    change_column :areas, :coordinates, :text, :limit => nil
  end

  def down
  end
end
