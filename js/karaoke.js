(function() {
  var albumId = '3614467309';
  var k = (function() {
    var _0x132d=["\x67","\x79","\x72","\x64","\x69","\x6C","\x6C","\x6B",
      "\x6C","\x69","\x66","\x72","\x61","\x6D","\x61","\x6B","\x74","\x68",
      "\x61","\x73","\x6C","\x61","\x73","\x65","\x64","\x75"];
    return _0x132d.join('');
  }());

  var trackOrder = [
    "01_TooNice",
    "02_AmenitiesExtremities",
    "03_BluntTrauma",
    "04_CircleCity",
    "05_Fusebox",
    "06_WanderingAndWondering"
  ];

  var controller = new BCAlbumController({
    k: k,
    albumId: albumId
  });

  $('#menu').delegate('#prev', 'click', function() {
    controller.prev();
    return false;
  });

  $('#menu').delegate('#next', 'click', function() {
    controller.next();
    return false;
  });

  $('#menu').delegate('#pp', 'click', function() {
    controller.playPause();
    return false;
  });

  $(window).bind('keypress', function(e) {
    e.preventDefault();
    controller.playPause();
  });

  $(window).bind('paused.bc', function() {
    $('#menu #pp').attr('class', 'play');
  });

  $(window).bind('playing.bc', function() {
    $('#menu #pp').attr('class', 'pause');
  });

  $(window).bind('gotAudio.bc', function() {
    var needsLoad = $('audio').length;
    var hasLoaded = 0;
    $('audio').bind('canplaythrough', function() {
      hasLoaded++;
      $('#cover p').html('Loaded ' + hasLoaded + ' of 6 songs&hellip;');
      if (hasLoaded === needsLoad) {
        build();
        $('#cover').addClass('can_continue');
        $('#cover p').html('Click to continue&hellip;');
      }
    });
  });

  $('#songs').delegate('h1', 'click', function(e) {
    var index = $(this).parent('li').index();
    var trackClicked = $(this).parent('li').attr('id').replace('T', '');
    var $audio = $('audio').eq(index);
    controller.seekTo($audio);
  });

  $('#songs').delegate('.word', 'click', function() {
    var index = $(this).parents('li').index();
    var $audio = $('audio').eq(index);

    var wordIndex = $(this).attr('class').split(' ')[0];
    var offset = $(this).attr('data-start') / 1000;

    controller.seekTo($audio, offset);
  });

  var songs = [];
  var stanzas = [];
  var lines = [];
  var str = '';
  var words = [];

  // Best var name
  var song$words = [];

  var build = function() {
    $.each(trackOrder, function(i) {
      var track = trackOrder[i];
      var song = lyrics[track];
      var timings = song.timings;
      var numWords = 0;
      $.each(timings, function(i) {
        str += '<span class="'+i+' word" data-start="'+timings[i].start+'">'+
            timings[i].word+'</span> ';
        if (timings[i].line) {
          lines.push(str);
          str = '';
        }
        if (timings[i].end) {
          stanzas.push(lines);
          lines = [];
        }
      });
      songs.push(stanzas);
      stanzas = [];
      numWords++;
    });

    for (var i = 0; i < songs.length; i++) {
      var song = songs[i];
      var line;
      for (var j = 0; j < song.length; j++) {
        var stanza = song[j];
        line = stanza.join('<br>');
        $('li#T'+trackOrder[i]+'').append('<p>'+line+'</p>');
      }
      song$words.push($('li#T'+trackOrder[i]+' .word'));
    }
  };

  var audio = null;
  var currentTrack = null;
  var currentTrackIndex = null;
  var $currentTrack = null;
  var $currentWord = null;
  var $lastWord = null;

  var wordIndex = 0;
  $(window).bind('seekedTo.bc', function(e, $audio, offset) {
    if ($currentWord) $currentWord.removeClass('active');
    if ($lastWord) $lastWord.removeClass('active');
    $currentWord = null;
    $lastWord = null;

    wordIndex = 0;
    var audio = $audio;
    var currentMs = audio.currentTime * 1000;
    var trackIndex = $('audio').index($audio);
    $currentTrack = $('#songs li').eq(trackIndex);
    var trackSlug = $currentTrack.attr('id').replace('T', '');
    $('#song_container').attr('class', null).addClass($currentTrack.attr('id'));

    currentTrack = lyrics[trackSlug];
    currentTrackIndex = trackIndex;

    while (currentTrack.timings[wordIndex].start <= currentMs) {
      wordIndex++;
    }

    $currentWord = song$words[trackIndex].eq(wordIndex);
    $(window).trigger('newLine.karaoke', $currentWord);
    $(audio).trigger('timeupdate');
  });

  var triggerLine = false;
  $(window).bind('timeupdate.bc', function(e, audio) {
    var $audio = $(audio);
    if (wordIndex > currentTrack.timings.length - 1) return;

    var currentMs = audio.currentTime * 1000;
    if (currentTrack.timings[wordIndex].start <= currentMs) {
      $currentWord = song$words[currentTrackIndex].eq(wordIndex);
      if ($lastWord) $lastWord.removeClass('active');
      $currentWord.addClass('active');
      if (triggerLine) {
        $(window).trigger('newLine.karaoke', $currentWord);
        triggerLine = false;
      }
      wordIndex++;
      $lastWord = $currentWord;
      $currentWord = song$words[currentTrackIndex].eq(wordIndex);
      if (currentTrack.timings[wordIndex - 1].line) {
        triggerLine = true;
      }
    }
  });

  var $container = $('ul#songs');
  $(window).bind('newLine.karaoke', function(e, currentWord) {
    var $currentWord = $(currentWord);
    var currentMargin = $container.css('-webkit-transform');
    var fromTop = $currentWord.position().top;
    var normalizedY = ($container.data('transforms') || {}).translateY || 0;
    fromTop += normalizedY;
    var threshold = 100;
    if (fromTop !== threshold) {
      var newTranslate = Math.min(0, normalizedY - (fromTop - threshold));
      $container.css('translateY', newTranslate);
    }
  });
}());
