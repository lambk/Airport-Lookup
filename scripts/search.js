$(function() {
  //Clear the 'Field required' tooltip when the user types or changes the ICAO input (if the input isn't still empty)
  $('#icaoTxt').on('change keyup', function() {
    if ($(this).val().length > 0) {
      $('#icaoTT').addClass('invisible');
    }
  });

  //Call the search function if the user hits the Enter key while the ICAO input has focus
  $('#icaoTxt').keyup(function(event) {
    if (event.keyCode == 13) {
      search();
    }
  });

  //Hides the tooltip when clicked
  $('.tooltip').click(function(event) {
    $(this).addClass('invisible');
  })

  //Call the search function when the search button is clicked
  $('#searchBtn').click(search);
});

/*
  Checks whether the ICAO input is either empty (or only consisting of whitespace) or not in valid ICAO format (4 letters only).
  If so, the tooltip is shown with appropriate feedback. If not, the page is redirected to /airport/<icao>
*/
function search() {
  icao = $('#icaoTxt').val().trim();
  if (icao.length == 0) {
    $('.tooltip-container').html('Field required');
    $('#icaoTT').removeClass('invisible');
  } else if (!/^[A-Z|a-z]{4}$/.test(icao)) {
    $('.tooltip-container').html('Not a valid ICAO code');
    $('#icaoTT').removeClass('invisible');
  } else {
    window.location = '/airport/' + icao.toLowerCase();
  }
}
