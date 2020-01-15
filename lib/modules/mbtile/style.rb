class Mbtile::Style < Mbtile::Base
  COLORS = {
    mangrove:  '008b00',
    seagrass:  'f35f8d',
    sabkha:    'f38417',
    saltmarsh: '007dff',
    algal_mat: 'ffe048',
    other:     '1dcbea'
  }

  def generate
    style_path = "#{habitat_path}/style.mss"
    File.open(style_path, "w") {|f| f << style }
  end

  private

  def style
    """
      ##{@habitat} {
        line-color: #fff;
        line-width: 0.5;
        polygon-opacity: 0.5;
        polygon-fill: ##{COLORS[@habitat.to_sym]};
      }
    """.squish
  end
end
