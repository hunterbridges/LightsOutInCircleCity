(function($) {
  var $document = ($document);
  var $window = $(window);
  var $body = $('body');
  var $motion = $('#motion');
  var $cover = $('#cover');

  $body.delegate('#cover', 'mouseup touchend', function(e) {
    $motion.add($body).attr('class', null).addClass('prologue');
  });

  $body.delegate('#prologue', 'mouseup touchend', function(e) {
    $motion.add($body).attr('class', null).addClass('songs');
    setTimeout(function() {
      $('#T01_TooNice h1').click();
    }, 750);
  });
}(jQuery));
