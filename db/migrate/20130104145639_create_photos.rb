class CreatePhotos < ActiveRecord::Migration
  def self.up
    create_table :photos do |t|
      t.attachment :attachment
      t.integer :validation_id

      t.timestamps
    end
  end

  def self.down
    drop_table :photos
  end
end
