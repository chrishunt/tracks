require 'pathname'
require 'exifr'

class Photo
  attr_reader :path

  def initialize(path)
    @path = path
  end

  def filename
    Pathname.new(path).basename.to_s
  end

  def latitude
    gps.latitude
  end

  def longitude
    gps.longitude
  end

  private

  def gps
    EXIFR::JPEG.new(path).gps
  end
end
