class Validation < ActiveRecord::Base
  attr_accessible :action, :area_id, :coordinates, :recorded_at

  belongs_to :area

  validates :area, presence: true
  validates :action, presence: true, inclusion: { in: %w(add delete validate) }
end
