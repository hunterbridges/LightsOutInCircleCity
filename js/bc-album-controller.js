var BCAlbumController = function(opts) {
  this.k = opts.k;
  this.albumId = opts.albumId;

  this.hasAudio = false;
  this.$current = null;

  this.rewindThreshold = 3000;

  this.pullAudio();
};

BCAlbumController.prototype.pullAudio = function() {
  var controller = this;
  var url = 'http://api.bandcamp.com/api/album/2/info?key=' + this.k +
      '&album_id=' + this.albumId + '&callback=?';

  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'jsonp',
    success: function(res) {
      controller.hasAudio = true;
      var tracks = res.tracks;
      $.each(tracks, function(i) {
        var src = tracks[i].streaming_url;
        $('body').append(
          '<audio data-title="'+tracks[i].title+'" preload="auto" src="'+src+'"></audio>'
        );
        $('audio:last').bind('timeupdate', function(e) {
          var audio = $(e.currentTarget).get(0);
          if (audio.duration === audio.currentTime) {
            controller.next();
          }
          $(window).trigger('timeupdate.bc', audio);
        });
      });
      $(window).trigger('gotAudio.bc');
    }
  });
};

BCAlbumController.prototype.play = function() {
  if (!this.hasAudio) return false;
  if (!this.$current) this.seekTo($('audio:first'));
  this.$current.get(0).play();
  this.playing = true;
  $(window).trigger('playing.bc');
};

BCAlbumController.prototype.pause = function() {
  if (!this.hasAudio) return false;
  if (!this.$current) return;
  this.$current.get(0).pause();
  this.playing = false;
  $(window).trigger('paused.bc');
};

BCAlbumController.prototype.playPause = function() {
  if (!this.hasAudio) return false;
  if (this.playing) this.pause();
  else this.play();
};

BCAlbumController.prototype.stop = function() {
  if (!this.hasAudio) return false;
  if (!this.$current) return;
  var current = this.$current.get(0);
  current.currentTime = 0;
  current.pause();
  this.playing = false;
  this.$current = null;
  $(window).trigger('paused.bc');
};

BCAlbumController.prototype.next = function() {
  if (!this.hasAudio) return false;
  if (!this.$current) return this.play();

  var $audios = $('audio');
  var curIndex = $audios.index(this.$current);
  var $next = $audios.eq(curIndex + 1);
  if ($next.length) return this.seekTo($next);
  else $(window).trigger('nextAfterEnd.bc');

  this.stop();
};

BCAlbumController.prototype.prev = function() {
  if (!this.hasAudio) return false;
  if (!this.$current) return;

  var $audios = $('audio');
  var curIndex = $audios.index(this.$current);
  var $prev = $audios.eq(curIndex - 1);

  if (this.$current.get(0).currentTime * 1000 < this.rewindThreshold && $prev.length) {
    if (curIndex === 0) {
      $(window).trigger('prevBeforeBeginning.bc');
      this.stop();
      return;
    }
    this.seekTo($prev);
  } else {
    this.$current.get(0).currentTime = 0;
  }
};

BCAlbumController.prototype.seekTo = function($seek, offset) {
  if (!this.hasAudio) return false;
  var current = null;
  if (this.$current !== $seek) {
    if (this.$current) {
      current = this.$current.get(0);
      current.currentTime = 0;
      current.pause();
    }

    this.$current = $seek;
    this.play();
  }

  if (typeof offset !== 'undefined') {
    current = this.$current.get(0);
    current.currentTime = offset;
  }

  $(window).trigger('seekedTo.bc', $seek, offset);
};
