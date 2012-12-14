class AddNotesToValidation < ActiveRecord::Migration
  def change
    add_column :validations, :notes, :text
  end
end
