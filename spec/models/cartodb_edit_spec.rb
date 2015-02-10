require 'spec_helper'
require_relative '../../lib/cartodb_query'

describe CartodbQuery do
  describe '.query' do
    before(:all) do
      require 'ostruct'
      @phase = (Time.now.to_f * 1000.0).to_i
      @phase2 = (Time.now.to_f * 1000.0 * 2).to_i
      @phase3 = (Time.now.to_f * 1000.0 * 3).to_i
      @addition = OpenStruct.new(id: 1, action: 'add', admin_id: 1, age: 1, area_id: 1, density: 1, knowledge: 'local_data', notes: 'test')
      @editing = OpenStruct.new(id: 1, admin_id: 1, age: 1234, area_id: 1, density: 1, knowledge: 'local_data', notes: 'test', id: @phase, condition: 1)
    end


    describe 'when there is one geometry' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle, phase, prev_phase, edit_phase) VALUES (ST_GeomFromText('MULTIPOLYGON(((-12 -8, -8 -8, -8 -12, -12 -12, -12 -8)))', 4326), true, #{@phase}, #{@phase}, #{@phase});"
        ActiveRecord::Base.connection.execute(add_query)

        query = CartodbQuery.editing('geometries', @editing)
        ActiveRecord::Base.connection.execute(query)

        puts add_query, query
      end

      it 'gets 1 more geometry with age 1234' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE age = 1234;")
        Integer(check['count']).should ==(1)
      end
    end

    describe 'when there are two geometries that not intersect' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle, phase, prev_phase, edit_phase) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true, #{@phase}, #{@phase}, #{@phase});"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, toggle, phase, prev_phase, edit_phase) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true, #{@phase2}, #{@phase2}, #{@phase2});"
        ActiveRecord::Base.connection.execute(add_query2)

        query = CartodbQuery.editing('geometries', @editing)

        ActiveRecord::Base.connection.execute(query)
      end

      it 'gets 1 more geometry with age 1234' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE age = 1234;")
        Integer(check['count']).should ==(1)
      end

      it 'gets 1 more geometry with age null' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE age is null;")
        Integer(check['count']).should ==(1)
      end
    end
  end
end
