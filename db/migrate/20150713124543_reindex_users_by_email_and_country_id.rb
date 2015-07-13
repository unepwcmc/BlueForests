class ReindexUsersByEmailAndCountryId < ActiveRecord::Migration
  def change
    remove_index :users, :email
    add_index :users, [:email, :country_id], :unique => true
  end
end
