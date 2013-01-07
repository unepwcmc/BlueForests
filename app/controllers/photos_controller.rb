class PhotosController < ApplicationController
  def create
    @photo = Photo.new(params[:photo])

    if @photo.save
      render json: @photo.to_json(only: :id, methods: [:attachment_url, :thumbnail_url]), content_type: 'text/html'
    else
      render json: { errors: @photo.errors }, status: :unprocessable_entity
    end
  end
end
