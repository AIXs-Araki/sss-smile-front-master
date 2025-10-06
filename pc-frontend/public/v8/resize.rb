
sizes = {
  XL: 1200,
  L: 600,
  M: 300,
  S: 150,
  XS: 75,
}


Dir.glob("*.png").each do |f|
  next if f =~ /\d/
  sizes.each do |label, width|
    to = f.gsub(".png", "_#{width}.png")
    puts "resize #{f} to #{to}"
    %x(convert #{f} -resize #{width} "#{to}"  )
  end
end
