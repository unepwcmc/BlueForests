class Habitat
  extend ActiveModel::Naming

  attr_reader :name

  def self.all
    %w(mangrove seagrass sabkha saltmarsh algal_mat other).map { |n| new(n) }
  end

  def self.find(param)
    all.detect { |h| h.to_param == param } || raise(ActiveRecord::RecordNotFound)
  end

  def initialize(name)
    @name = name
  end

  def to_param
    @name
  end
  
  def table_name
    "bc_#{name}"
  end
end
