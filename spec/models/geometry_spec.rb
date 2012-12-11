require 'spec_helper'

describe Geometry do
  it 'creates a geometry' do
    geometry = Geometry.create!(the_geom: 'POINT(-122 47)')
  end
end
