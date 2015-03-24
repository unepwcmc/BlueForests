class AddCountryIdToValidationsTable < ActiveRecord::Migration
  def change
    add_column :validations, :country_id, :integer

    Validation.all.each do |validation|
      validation.country = validation.area.try(:country) || validation.user.try(:country)
    end
  end
end
