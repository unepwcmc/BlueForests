require 'spec_helper'
require 'active_support'
require_relative '../../lib/cartodb_query'

describe CartodbQuery do
  describe '.query' do
    before(:all) do
      require 'ostruct'
      @undo = OpenStruct.new(action: 'undo')
      @addition = OpenStruct.new(action: 'add', admin_id: 1, age: 1, area_id: 1, density: 1, knowledge: 'local_data', notes: 'test')
    end

    describe 'when the table is empty' do
      it 'stays empty' do
        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))',4326)", @undo)
        ActiveRecord::Base.connection.execute(query)

        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(0) AS count FROM geometries;")
        Integer(check['count']).should ==(0)
      end
    end

    describe 'when there is one geometry' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-12 -8, -8 -8, -8 -12, -12 -12, -12 -8)))', 4326), #{(Time.now.to_f * 1000.0).to_i}, true);"
        ActiveRecord::Base.connection.execute(add_query)

        query = CartodbQuery.query('geometries', 0, @undo)
        ActiveRecord::Base.connection.execute(query)
      end

      it 'removes the geometry' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(0)
      end
    end

    describe 'when there are two geometries that not intersect' do
      before(:each) do
        add_query1 = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-12 -8, -8 -8, -8 -12, -12 -12, -12 -8)))', 4326), #{(Time.now.to_f * 10000.0).to_i}, true);"
        ActiveRecord::Base.connection.execute(add_query1)

        add_query2 = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((0 0, 0 4, 4 4, 4 0, 0 0)))', 4326), #{(Time.now.to_f * 10000.0).to_i}, true);"
        ActiveRecord::Base.connection.execute(add_query2)

        query = CartodbQuery.query('geometries', 0, @undo)
        ActiveRecord::Base.connection.execute(query)
      end

      it 'removes the geometry' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(1)
      end
    end

    describe 'when there are two geometries that intersect' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), #{(Time.now.to_f * 10000.0).to_i}, true);"
        ActiveRecord::Base.connection.execute(add_query)

        intersect_query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 -4, 0 -4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(intersect_query)

        query = CartodbQuery.query('geometries', 0, @undo)
        ActiveRecord::Base.connection.execute(query)
      end

      it 'removes the geometry' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(1)
      end

      it 'changes one geometry to toggle = true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(1)
      end
    end

    describe 'when intersects 2 geometries from the same phase' do
      before(:each) do
                
        now = (Time.now.to_f * 10000.0).to_i

        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), #{now}, true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), #{now}, true);"
        ActiveRecord::Base.connection.execute(add_query2)

        query1 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query1)


        undo_query = CartodbQuery.query('geometries', 0, @undo)
        ActiveRecord::Base.connection.execute(undo_query)


        end

      it 'Stays with 2 geometries)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(2)
      end

      it 'changes 2 geometry to toggle = true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(2)
      end

      it 'no geometries with toggle = false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(0)
      end
    end


    describe 'when there are two geometries that intersect in different phases (1 roll back action)' do
      before(:each) do
        
        now = (Time.now.to_f * 10000.0).to_i

        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), #{now}, true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), #{now}, true);"
        ActiveRecord::Base.connection.execute(add_query2)

        query1 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query1)

        query2 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query2)

        undo_query = CartodbQuery.query('geometries', 0, @undo)
        ActiveRecord::Base.connection.execute(undo_query)

        
        end

      it 'Stays with 7 geometries)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(7)
      end

      it 'changes 5 geometry to toggle = true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(5)
      end

      it 'keeps 2 geometries with toggle = false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(2)
      end
    end

    describe 'when there are two geometries that intersect in different phases (2 roll back actions)' do
      before(:each) do
        
        now = (Time.now.to_f * 10000.0).to_i

        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), #{now}, true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), #{now}, true);"
        ActiveRecord::Base.connection.execute(add_query2)

        query1 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query1)

        query2 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query2)

        undo_query = CartodbQuery.query('geometries', 0, @undo)
        ActiveRecord::Base.connection.execute(undo_query)
        ActiveRecord::Base.connection.execute(undo_query)


        end

      it 'Stays with 2 geometries)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(2)
      end

      it 'changes 2 geometry to toggle = true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(2)
      end

      it 'no geometries with toggle = false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(0)
      end
    end

    describe 'when intersects 2 geometries from different phases' do
      before(:each) do

        now = (Time.now.to_f * 10000.0).to_i
        tenseconds = now - (10.seconds*10000).to_i

        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), #{now}, true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), #{tenseconds}, true);"
        ActiveRecord::Base.connection.execute(add_query2)

        query1 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query1)


        undo_query = CartodbQuery.query('geometries', 0, @undo)
        ActiveRecord::Base.connection.execute(undo_query)

      end

      it 'Stays with 2 geometries)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(2)
      end

      it 'changes 2 geometry to toggle = true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(2)
      end

      it 'no geometries with toggle = false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(0)
      end
    end

    describe 'when intersects 2 geometries from different phases and does not intersect with other false' do
      before(:each) do

        now = (Time.now.to_f * 10000.0).to_i

        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), #{now} , true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326),  #{now}, true);"
        ActiveRecord::Base.connection.execute(add_query2)

        add_query3 = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((13 13, 17 13, 17 17, 13 17, 13 13)))', 4326),  #{now}, false);"
        ActiveRecord::Base.connection.execute(add_query3)


        query1 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query1)


        undo_query = CartodbQuery.query('geometries', 0, @undo)
        ActiveRecord::Base.connection.execute(undo_query)

        puts add_query, add_query2, add_query3, query1, undo_query


        end

      it 'Stays with 3 geometries)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(3)
      end

      it 'changes 2 geometry to toggle = true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(2)
      end

      it '1 geometry with toggle = false' do
        rows = ActiveRecord::Base.connection.select_rows("SELECT toggle, phase FROM geometries;")
        p rows
        rows = ActiveRecord::Base.connection.select_rows("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        p rows

        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(1)
      end
    end










  end
end
