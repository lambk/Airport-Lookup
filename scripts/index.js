$(function() {
  $('#icaoTxt').on('change keyup', function() {
    if ($(this).val().length > 0) {
      $('#icaoTT').addClass('invisible');
    }
  });

  $('#searchBtn').click(function() {
    icao = $('#icaoTxt').val().trim();
    if (icao.length == 0) {
      $('#icaoTT').removeClass('invisible');
    } else {
      window.location = '/airport/' + icao;
    }
  });
});
