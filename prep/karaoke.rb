require 'rubygems'
gem 'midilib'
gem 'json'
require 'midilib'
require 'json'

meta = {
  '01_TooNice' => {
    :offset => 5917,
    :title => 'Too Nice',
    :tracknum => 1
  },
  '02_AmenitiesExtremities' => {
    :offset => 5797,
    :title => 'Amenities, Extremities',
    :tracknum => 2
  },
  '03_BluntTrauma' => {
    :offset => 5085,
    :title => 'Blunt Trauma',
    :tracknum => 3
  },
  '04_CircleCity' => {
    :offset => 5247,
    :title => 'Lights Out in Circle City',
    :tracknum => 4
  },
  '05_Fusebox' => {
    :offset => 5487,
    :title => 'A Charge Out in the Fusebox',
    :tracknum => 5
  },
  '06_WanderingAndWondering' => {
    :offset => 6093,
    :title => 'Wandering and Wondering',
    :tracknum => 6
  },
}

meta.each do |song, data|
  timings = []
  puts "Preparing #{song}"

  # Read the midi file
  seq = MIDI::Sequence.new()

  File.open("#{song}.mid", 'rb') do |file|
    seq.read(file)
  end

  offset = meta[song].delete(:offset)

  seq.each do |track|
    track.each do |event|
      if event.instance_of? MIDI::NoteOn
        timings.push({
          :start => (seq.pulses_to_seconds(event.time_from_start) * 1000.0 - offset).to_i,
          :length => (seq.pulses_to_seconds(event.off.delta_time) * 1000.0).to_i
        })
      end
    end
  end

  # Read the lyrics
  file = File.open("#{song}.txt", "rb")
  contents = file.read
  countable = contents.split(' ')
  lyrics = contents.split(/ /)

  raise "Mismatch! #{countable.length} words, #{timings.length} notes" unless countable.length == timings.length

  i = 0
  lyrics.each do |lyric|
    stanza = /\r?\n\r?\n/
    line = /\r?\n/
    if lyric =~ stanza
      # End of stanza
      split = lyric.split(stanza)
      timings[i][:word] = split[0]
      timings[i][:line] = true
      timings[i][:end] = true
      i += 1
      timings[i][:word] = split[1]
    elsif lyric =~ line
      # End of line
      split = lyric.split(line)
      timings[i][:word] = split[0]
      timings[i][:line] = true
      i += 1
      if i < timings.length
        timings[i][:word] = split[1]
      else
        timings[i-1][:end] = true
      end
    else
      timings[i][:word] = lyric
    end
    i += 1
  end

  meta[song][:timings] = timings
end

File.open("lightsout.json", 'w') {|f| f.write(meta.to_json)}
puts "Output >> lightsout.json"
