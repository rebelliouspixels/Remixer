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
    revert: true
  });

  // Make the audio/video sources droppable
  $('#audioSource, #videoSource').droppable({
    drop: function( event, ui ) {
      var otherSource, newSource,
        other = (this.id === 'audioSource' ? 'videoSource' : 'audioSource');
      other = $('#' + other + ' video');
      if (other.length) {
        otherSource = other.attr('class').split(' ')[0];
      }
      newSource = ui.helper.attr('class').split(' ')[0];

      if (newSource === otherSource) {
        return;
      }

      if (this.firstChild) {
        var oldVideo = $(this.firstChild);
        var className = oldVideo.attr('class').split(' ')[0];
        if (className) {
          oldVideo.insertAfter($('#' + className).children().eq(0));
        }
      }

      $( this ).html( ui.helper );
    }
  });

  // Mashup the content from audio and video sources
  $('#makeMashup').click(function(){
    var audio = $('#audioSource video')[0],
        audioSrc = $('#audioSource video').attr('src'),
        video = $('#videoSource video')[0],
        videoSrc = $('#videoSource video').attr('src'),
        actualVideo, actualAudio;

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
      id: 'newVideo'
    })
    .appendTo('#mashup')[0];

    actualAudio = $('<video>', {
      src: audioSrc,
      id: 'newAudio'
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
    var video = $('#videoSource video'),
        audio = $('#audioSource video');

        video.appendTo('#audioSource');
        audio.appendTo('#videoSource');

        $('#newAudio, #mashup video').remove();
  });

  // Send everything back where it came from
  $('#clearVideos').click(function( event ){
    var video = $('#videoSource video'),
        audio = $('#audioSource video');

    $('#newAudio, #mashup video').remove();
    if (audio.length) {
      audio.insertAfter($('#' + audio.attr('class').split(' ')[0]).children().eq(0));
    }

    if (video.length) {
      video.insertAfter($('#' + video.attr('class').split(' ')[0]).children().eq(0));
    }
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
