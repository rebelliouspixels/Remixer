jQuery(function($){

	"use strict";

  /*
   * Handy drag n' drop -> Data URL tool
   * by @boazsender: http://boazsender.com
   *
   */

  // jQuery creates it's own event object, and it doesn't have a
  // dataTransfer property yet. This adds dataTransfer to the event object.
  // Thanks to @tbranyen for figuring this out!
  $.event.props.push('dataTransfer');

  $('body')
  .bind( 'dragenter dragover', false)
  .bind( 'drop', function( e ) {
    var droplocation = $(e.target);
    e.stopPropagation();
    e.preventDefault();

    // Only let videos get dropped from the file system onto one of the bins
    if( droplocation.attr('id') === 'bin1' || droplocation.attr('id') === 'bin2'){
      // Only try to put file(s) in the bins if some have been dragged to the browser
      if( e.dataTransfer && e.dataTransfer.files ){

        $.each( e.dataTransfer.files, function(index, file){
          var fileReader = new FileReader();
              fileReader.onload = (function(file) {
                 return function(e) {
                  $('<video>', {
                    class: droplocation.attr('id') + ' thumb',
                    controls: true,
                    src: e.target.result
                  })
                  .draggable({
                    revert: true
                  })
                  .appendTo( droplocation );
                };
              }(file));
          fileReader.readAsDataURL(file);
        });

      }
    }
  });
  
  // Make all videos draggable
  $('.thumb')
  .draggable({
    revert: false,
    stop: function( event, ui ) {
      //only revert if thumbnail has not been placed in a target
      var me = ui.helper;

      if (me.hasClass('videoSource') || me.hasClass('audioSource')) {
      	return;
      }
      me
        .css('position', 'relative')
        .css('top', '')
        .css('left', '');
    }
  });

  // Make the audio/video sources droppable
  $('#audioSource, #videoSource').droppable({
    drop: function( event, ui ) {
      var otherSource, newSource,
        other = (this.id === 'audioSource' ? 'videoSource' : 'audioSource');
      other = $('.' + other);
      if (other.length) {
        otherSource = other.attr('class').split(' ')[0];
      }
      newSource = ui.helper.attr('class').split(' ')[0];

      if (newSource === otherSource) {
        return;
      }

      var oldVideo = $('.' + this.id);
      if (oldVideo.length) {
        oldVideo.css('position', 'relative')
        oldVideo.css('top','');
        oldVideo.css('left','');
        oldVideo.removeClass(this.id);
      }

      var offset = $(this).offset();
      $( ui.helper )
        .addClass(this.id)
        .css('position', 'absolute')
        .css('top', offset.top + 'px')
        .css('left', offset.left + 'px');
    }
  });

  // Mashup the content from audio and video sources
  $('#makeMashup').click(function(){
    var audio = $('.audioSource'),
        audioSrc = $('.audioSource').attr('src'),
        video = $('.videoSource'),
        videoSrc = $('.videoSource').attr('src'),
        actualVideo, actualAudio, regex;
    
    if (!audio.length || !video.length) {
    	return;
    }
    audio = audio[0];
    video = video[0];
    
    regex = /\.png$/;
    audioSrc = audioSrc.replace(regex, '.webm');
    videoSrc = videoSrc.replace(regex, '.webm');

    function checkLoaded() {
    	if (!actualVideo || !actualVideo.parentNode || !actualAudio || !actualAudio.parentNode) {
    		return;
    	} else if (actualVideo.readyState >= 4 && actualAudio.readyState >= 4) {
    		$('#canvas').removeClass('loading');

		    var newAudio = $('#newAudio')[0],
				newVideo = $('#newVideo')[0];
		    newAudio.play();
		    newVideo.volume = 0;
		    newVideo.play();
    	} else {
    		setTimeout(checkLoaded, 10);
    	}
    }

    $('#mashup').html('');

    actualVideo = $('<video>', {
      src: videoSrc,
      id: 'newVideo',
      preload: true
    })
    .appendTo('#mashup')[0];

    actualAudio = $('<video>', {
      src: audioSrc,
      id: 'newAudio',
      preload: true
    })
    .appendTo('#mashup')
    .css({
     display: 'none'
    })[0];

    $('#canvas').addClass('loading');

    checkLoaded();

  });

  // Swap the audio and video sources
  $('#swapVideos').click(function(){
    var video = $('.videoSource'),
        audio = $('.audioSource'),
        offset;
        
        $('#newAudio, #mashup video').remove();

        offset = $('#videoSource').offset();
        audio.removeClass('audioSource')
          .addClass('videoSource')
          .css('position', 'absolute')
          .css('top', offset.top + 'px')
          .css('left', offset.left + 'px');

        offset = $('#audioSource').offset();
        video.removeClass('videoSource')
          .addClass('audioSource')
          .css('position', 'absolute')
          .css('top', offset.top + 'px')
          .css('left', offset.left + 'px');

  });

  // Send everything back where it came from
  $('#clearVideos').click(function( event ){
    $('#newAudio, #mashup video').remove();
    $('#canvas').removeClass('loading');
    
    $('.videoSource')
    	.removeClass('videoSource')
    	.css('position', 'relative')
    	.css('left', '')
    	.css('top', '');
    
    $('.audioSource')
    	.removeClass('audioSource')
    	.css('position', 'relative')
    	.css('left', '')
    	.css('top', '');
  });

/*
  // This doesn't work on <video elements>
  // Lame.
  $('#audioSource').bind( 'dragenter dragover', false);
  $('#audioSource').bind( 'drop', function( event ) {
    event.stopPropagation();
    event.preventDefault();
    $('#audioSource').append( event.dataTransfer.getData('text/html') );
  });
*/


});
