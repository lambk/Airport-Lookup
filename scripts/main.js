$(function() {
  $('#icaoTxt').on('change keyup', function() {
    if ($(this).val().length > 0) {
      $('#icaoTT').addClass('invisible');
    }
  });

  $('#searchBtn').click(function() {
    var data = {
      icao: $('#icaoTxt').val()
    }
    if (data.icao.length == 0) {
      $('#icaoTT').removeClass('invisible');
    } else {
      postToServer(data);
    }
  });

  function postToServer(data) {
    $.ajax({
      type: 'POST',
      url: '/api',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function(data) {
        if (data.redirect) {
          window.location = data.redirect;
        }
      },
      error: function(data) {
        console.log('Error with AJAX call');
      }
    });
  }
});
