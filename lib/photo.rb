require 'exifr'

class Photo
  attr_reader :filename

  def initialize(filename)
    @filename = filename
  end

  def date
    filename[-16..-7]
  end

  def latitude
    gps.latitude
  end

  def longitude
    gps.longitude
  end

  private

  def gps
    EXIFR::JPEG.new(filename).gps
  end
end
