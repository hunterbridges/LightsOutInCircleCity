(function($) {
  var $document = ($document);
  var $window = $(window);
  var $body = $('body');
  var $motion = $('#motion');
  var $cover = $('#cover');

  $body.delegate('#cover', 'click', function(e) {
    if (!$cover.hasClass('can_continue')) return;
    $motion.attr('class', null).addClass('prologue');
    $body.attr('class', null).addClass('prologue');
  });

  $body.delegate('#prologue .play', 'click', function(e) {
    $motion.attr('class', null).addClass('songs');
    $body.attr('class', null).addClass('songs');
    setTimeout(function() {
      $('#T01_TooNice h1').click();
    }, 750);
    return false;
  });

  $body.delegate('#epilogue .replay', 'click', function(e) {
    $motion.attr('class', null).addClass('songs');
    $body.attr('class', null).addClass('songs');
    setTimeout(function() {
      $('#T01_TooNice h1').click();
    }, 750);
    return false;
  });

  $(window).bind('seekedTo.bc', function(e) {
    $motion.attr('class', null).addClass('songs');
    $body.attr('class', null).addClass('songs');
  });

  $(window).bind('prevBeforeBeginning.bc', function(e) {
    $motion.attr('class', null).addClass('prologue');
    $body.attr('class', null).addClass('prologue');
  });

  $(window).bind('nextAfterEnd.bc', function(e) {
    $motion.attr('class', null).addClass('epilogue');
    $body.attr('class', null).addClass('epilogue');
  });

  $body.delegate('#prologue h2', 'click', function(e) {
    $motion.attr('class', null);
    $body.attr('class', null);
    e.preventDefault();
  });
}(jQuery));
