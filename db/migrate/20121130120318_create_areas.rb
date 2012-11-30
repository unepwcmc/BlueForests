class CreateAreas < ActiveRecord::Migration
  def change
    create_table :areas do |t|
      t.string :title
      t.string :coordinates

      t.timestamps
    end
  end
end
