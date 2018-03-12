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
  Checks whether the ICAO input is empty (or only consisting of whitespace). If so, the 'Field required' tooltip
  is shown. If not, the page is redirected to /airport/<icao>
*/
function search() {
  icao = $('#icaoTxt').val().trim();
  if (icao.length == 0) {
    $('#icaoTT').removeClass('invisible');
  } else {
    window.location = '/airport/' + icao.toLowerCase();
  }
}
