class PhotosController < AdminController
  def create
    @photo = Photo.new(photo_params)

    if @photo.save
      render json: @photo.to_json(only: :id, methods: [:attachment_url, :thumbnail_url]), content_type: 'text/html'
    else
      render json: { errors: @photo.errors }, status: :unprocessable_entity
    end
  end

  private

  def photo_params
    params.require(:photo).permit(:attachment, :validation_id)
  end
end
