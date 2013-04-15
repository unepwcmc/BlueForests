require 'spec_helper'
require 'active_support'
require_relative '../../lib/cartodb_query'

describe CartodbQuery do
  describe '.query' do
    before(:all) do
      require 'ostruct'
      @addition = OpenStruct.new(action: 'add', admin_id: 1, age: 1, area_id: 1, density: 1, knowledge: 'local_data', notes: 'test')
    end

    describe 'when the table is empty' do
      it 'stays empty' do
        query = CartodbQuery.remove('geometries')
        ActiveRecord::Base.connection.execute(query)

        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(0) AS count FROM geometries;")
        Integer(check['count']).should ==(0)
      end
    end

    describe 'when there is one geometry' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-12 -8, -8 -8, -8 -12, -12 -12, -12 -8)))', 4326), #{(Time.now.to_f * 1000.0).to_i}, true);"
        ActiveRecord::Base.connection.execute(add_query)

        query = CartodbQuery.remove('geometries')
        ActiveRecord::Base.connection.execute(query)
      end

      it 'removes the geometry' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(0)
      end
    end

   end
end
