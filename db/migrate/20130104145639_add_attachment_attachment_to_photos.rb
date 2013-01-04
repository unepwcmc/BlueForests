class AddAttachmentAttachmentToPhotos < ActiveRecord::Migration
  def self.up
    create_table :photos do |t|
      t.attachment :attachment

      t.timestamps
    end
  end

  def self.down
    drop_table :photos
  end
end
