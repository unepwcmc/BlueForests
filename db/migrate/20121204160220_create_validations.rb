class CreateValidations < ActiveRecord::Migration
  def change
    create_table :validations do |t|
      t.text :coordinates
      t.string :action
      t.datetime :recorded_at
      t.integer :area_id
      t.integer :user_id

      t.timestamps
    end
  end
end
