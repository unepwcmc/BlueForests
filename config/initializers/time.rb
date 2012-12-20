class ActiveSupport::TimeWithZone
  def as_json(options = {})
    strftime('%Y-%m-%d')
  end
end
