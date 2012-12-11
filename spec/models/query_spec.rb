require 'spec_helper'
require_relative '../../lib/query'

describe Query do
  it 'creates a geometry' do
    query = Query.add('geometries')
    ActiveRecord::Base.connection.execute(query)
  end
end
