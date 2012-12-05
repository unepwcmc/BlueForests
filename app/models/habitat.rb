class Habitat
  extend ActiveModel::Naming

  attr_reader :name

  def self.all
    %w(mangroves seagrass sabkha saltmarshes).map { |n| new(n) }
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
end
