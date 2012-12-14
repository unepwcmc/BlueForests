class RemoveNameFromValidation < ActiveRecord::Migration
  def up
    remove_column :validations, :name
  end

  def down
    add_column :validations, :name, :string
  end
end
