require 'spec_helper'
require_relative '../../lib/cartodb_query'

describe CartodbQuery do
  describe '.query' do
    before(:all) do
      require 'ostruct'
      @addition = OpenStruct.new(id: 1, action: 'add', admin_id: 1, age: 1, area_id: 1, density: 1, knowledge: 'local_data', notes: 'test')
    end


    describe 'when there is one geometry that overlaps totally' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((1 1, 1 3, 3 3, 3 1, 1 1)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query)
        
        puts add_query, query
      end

      it 'creates 1 more geometry (total of 3)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(3)
      end

      it '2 with toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(2)
      end
    end


  end
end
