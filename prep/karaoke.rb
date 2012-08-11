require 'rubygems'
gem 'midilib'
gem 'json'
require 'midilib'
require 'json'
require 'yaml'

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
    :offset => 0,
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

  if song == '04_CircleCity'
    # This is the only song with a tempo change...
    # Hacking in support for it instead of a general solution
    #
    # So call me maybe?
    change_measure = seq.get_measures[34]
    old_bpm = seq.bpm
    new_bpm = 165.5

    start_clicks = change_measure.start.to_f - offset
    when_change = (start_clicks / seq.ppqn.to_f / old_bpm) * 60.0 * 1000.0
    timings[29..(timings.length-1)].each do |timing|
      new = (timing[:start] - when_change) * old_bpm / new_bpm
      new += when_change
      timing[:start] = new
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
    stanza = /\n\n/
    line = /\n/
    if lyric =~ stanza
      # End of stanza
      split = lyric.split(stanza)
      split.map! do |s|
        s.split(line)
      end
      split.flatten!

      if (split.length == 2)
        timings[i][:word] = split[0]
        timings[i][:line] = true
        timings[i][:end] = true
        i += 1
        timings[i][:word] = split[1]
      elsif (split.length == 3)
        # A cop out hack for the one case where this happens
        timings[i][:word] = split[0]
        timings[i][:line] = true
        i += 1
        timings[i][:word] = split[1]
        timings[i][:line] = true
        timings[i][:end] = true
        i += 1
        timings[i][:word] = split[2]
      end
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

File.open("../js/data.js", 'w') do |f|
  f.write('var lyrics = ');
  f.write(meta.to_json)
  f.write(';');
end
puts "Output >> ../js/data.js"
