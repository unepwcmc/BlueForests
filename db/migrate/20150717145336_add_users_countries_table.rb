class AddUsersCountriesTable < ActiveRecord::Migration
  def change
    create_table :users_countries do |t|
      t.integer :country_id
      t.integer :user_id
    end

    add_index :users_countries, [:user_id, :country_id], unique: true
  end
end
