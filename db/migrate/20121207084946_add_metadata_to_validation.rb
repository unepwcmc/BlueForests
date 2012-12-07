class AddMetadataToValidation < ActiveRecord::Migration
  def up
    change_table :validations do |v|
      v.string :habitat
      v.string :name
      v.string :knowledge
      v.float :density
      v.float :age
    end
  end

  def down
    change_table :validations do |v|
      v.remove :habitat
      v.remove :name
      v.remove :knowledge
      v.remove :density
      v.remove :age
    end
  end
end
