class Photo < ActiveRecord::Base
  belongs_to :validation

  has_attached_file :attachment, :styles => { :thumb => "200x200>" }

  def attachment_url
    attachment.url
  end

  def thumbnail_url
    attachment.url(:thumb)
  end
end
