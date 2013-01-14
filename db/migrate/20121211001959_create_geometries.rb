class CreateGeometries < ActiveRecord::Migration
  def change
    # Only needed for test environment, but it is needed on development
    # to load it to the schema...
    unless Rails.env.production?
      create_table :geometries do |t|
        t.geometry  :the_geom

        t.string    :action
        t.integer   :admin_id
        t.integer   :age
        t.integer   :area_id
        t.integer   :density
        t.string    :knowledge
        t.text      :notes

        t.string    :author
        t.boolean   :display
        t.integer   :phase,       limit: 8
        t.integer   :phase_id,    limit: 8
        t.integer   :prev_phase,  limit: 8
        t.integer   :edit_phase,  limit: 8
        t.boolean   :toggle
        t.float     :value
      end
    end
  end
end
