require 'spec_helper'
require_relative '../../lib/query'

describe Query do
  describe '.deactivate_intersecting_polygons' do
    it 'should toggle to false intersecting polygons' do
      add_query = Query.add('geometries', '-18 9, 18 9, 18 -9, -18 -9, -18 9')
      update_query = Query.deactivate_intersecting_polygons('geometries', '-18 9, 18 9, 18 -9, -18 -9, -18 9')

      ActiveRecord::Base.connection.execute(add_query)
      ActiveRecord::Base.connection.execute(update_query)

      check_toggle = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
      Integer(check_toggle['count']).should ==(1)
    end
  end
  
  describe '.add_broken_polygons' do
    it 'should create three polygons plus the initial one' do
      add_query = Query.add('geometries', '-18 9, 18 9, 18 -9, -18 -9, -18 9')
      add_broken_query = Query.add_broken_polygons('geometries', '0 0, 36 0, 36 -18, 0 -18, 0 0')

      ActiveRecord::Base.connection.execute(add_query)
      ActiveRecord::Base.connection.execute(add_broken_query)

      check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
      Integer(check['count']).should ==(4)
    end
  end
end
