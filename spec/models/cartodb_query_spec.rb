require 'spec_helper'
require_relative '../../lib/cartodb_query'

describe CartodbQuery do
  describe '.query' do
    before(:all) do
      require 'ostruct'
      @validation = OpenStruct.new(action: 'validate', admin_id: 1, age: 1, area_id: 1, density: 1, knowledge: 'local_data', notes: 'test')
    end
  
    describe 'when the table is empty' do
      it 'creates one geometry' do
        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))',4326)", @validation)
        ActiveRecord::Base.connection.execute(query)

        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(1)
      end
    end

    describe 'when there is one geometry that does NOT intersect' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-12 -8, -8 -8, -8 -12, -12 -12, -12 -8)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 -4, 0 -4, 0 0)))',4326)", @validation)
        ActiveRecord::Base.connection.execute(query)
      end

      it 'creates 1 more geometry (total of 2)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(2)
      end

      it 'keeps both with toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(2)
      end
    end

    describe 'when there is one geometry that intersects' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 -4, 0 -4, 0 0)))',4326)", @validation)
        ActiveRecord::Base.connection.execute(query)
      end

      it 'creates 3 more geometries (total of 4)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(4)
      end

      it 'changes 1 geometry to toggle => false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(1)
      end

      it 'adds the 3 new geometries with toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(3)
      end
    end
  end
end
