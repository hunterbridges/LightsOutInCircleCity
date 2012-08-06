var lyrics = lyrics;

(function() {
  var trackOrder = ["01_TooNice", "02_AmenitiesExtremities", "03_BluntTrauma", "04_CircleCity", "05_Fusebox", "06_WanderingAndWondering"];

  function setup() {
    var songs = [];
    var stanzas = [];
    var lines = [];
    var str = '';
    var words = [];

    $.each(trackOrder, function(i) {
      var track = trackOrder[i];
      var song = lyrics[track];
      var timings = song.timings;
      $.each(timings, function(i) {
        words.push(timings[i].word);
        str += '<span class="'+i+' word" data-start="'+timings[i].start+'">'+timings[i].word+'</span> ';
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
    });

    for (var i = 0; i < songs.length; i++) {
      var song = songs[i];
      var line;
      for (var j = 0; j < song.length; j++) {
        var stanza = song[j];
        line = stanza.join('<br>');
        $('li#T'+trackOrder[i]+'').append('<p>'+line+'</p>');
      }
    }

    var audio = null;
    var currentTrack = null;
    var trackClicked = null;

    $('h1').click(function() {
      $('span.word.active').removeClass('active');
      if (audio && !audio.paused) audio.pause();
      var index = $(this).parent('li').index();
      trackClicked = $(this).parent('li').attr('id').replace('T', '');
      audio = $('audio').get(index);
      currentTrack = lyrics[trackClicked];
      audio.play();

      var wordIndex = 0;
      var $lastWord = null;
      var $currentWord = $('#T'+trackClicked+' span.'+(wordIndex)+'');
      $(audio).bind('timeupdate', function() {
        if (audio.duration === audio.currentTime) {
          $(audio).unbind('timeupdate');
        }
        if (wordIndex > currentTrack.timings.length - 1) return;
        if ((currentTrack.timings[wordIndex].start / 1000) <= audio.currentTime) {
          if ($lastWord) $lastWord.removeClass('active');
          $currentWord.addClass('active');
          wordIndex++;
          $lastWord = $currentWord;
          $currentWord = $('#T'+trackClicked+' span.'+(wordIndex)+'');
        }
      });

      $('.word').click(function() {
        wordIndex = $(this).attr('class').split(' ')[0];
        if ($lastWord) $lastWord.removeClass('active');
        $currentWord = $('#T'+trackClicked+' span.'+(wordIndex)+'');
        audio.currentTime = $(this).attr('data-start') / 1000;
      });

    });

    $(window).bind('keypress', function(e) {
      e.preventDefault();
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    });

  }

  function prepareAudio(tracks) {
    $.each(tracks, function(i) {
      var src = tracks[i].streaming_url;
      $('body').append('<audio data-title="'+tracks[i].title+'" src="'+src+'"></audio>');
    });
    setup();
  }

  var k = function() {
    var _0x132d=["\x67\x79\x72\x64\x69\x6C\x6C\x6B\x6C\x69\x66\x72\x61\x6D\x61\x6B\x74\x68\x61\x73\x6C\x61\x73\x65\x64\x75"];
    return _0x132d[0];
  };

  $(document).ready(function() {
    var url = 'http://api.bandcamp.com/api/album/2/info?key='+k()+'&album_id=3614467309&callback=?';

    $.ajax({
      'url': url,
      'type': "GET",
      'dataType': 'jsonp',
        success: function(res) {
        prepareAudio(res.tracks);
      }
    });
  });
}());
