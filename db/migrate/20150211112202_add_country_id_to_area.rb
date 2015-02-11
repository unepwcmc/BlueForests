class AddCountryIdToArea < ActiveRecord::Migration
  def change
    add_column :areas, :country_id, :integer
  end
end
