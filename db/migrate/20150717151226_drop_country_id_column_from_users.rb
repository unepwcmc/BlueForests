class DropCountryIdColumnFromUsers < ActiveRecord::Migration
  def change
    remove_column :users, :country_id
  end
end
