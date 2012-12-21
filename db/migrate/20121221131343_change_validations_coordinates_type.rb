class ChangeValidationsCoordinatesType < ActiveRecord::Migration
  def up
    change_column :validations, :coordinates, :text, :limit => nil
  end

  def down
  end
end
