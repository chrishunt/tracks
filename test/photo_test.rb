require 'minitest/autorun'
require 'minitest/pride'

require './lib/photo'

describe Photo do
  before do
    @photo = Photo.new('./test/fixtures/2015-10-10-1.jpg')
  end

  it 'parses the date from the filename' do
    assert_equal '2015-10-10', @photo.date
  end

  it 'parses the GPS latitude from the exif' do
    assert_equal 45.54025, @photo.latitude
  end

  it 'parses the GPS longitude from the exif' do
    assert_equal -121.72479166666666, @photo.longitude
  end
end
