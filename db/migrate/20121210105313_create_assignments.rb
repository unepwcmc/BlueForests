class CreateAssignments < ActiveRecord::Migration
  def change
    create_table :assignments do |t|
      t.integer :admin_id
      t.integer :role_id

      t.timestamps
    end
  end
end
