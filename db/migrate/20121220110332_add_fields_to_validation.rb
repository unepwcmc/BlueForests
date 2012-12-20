class AddFieldsToValidation < ActiveRecord::Migration
  def change
    add_column :validations, :condition, :integer
    add_column :validations, :species, :string
  end
end
