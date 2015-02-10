class AddCountryIdToAdmin < ActiveRecord::Migration
  def change
    add_column :admins, :country_id, :integer
  end
end
