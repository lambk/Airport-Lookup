$(() => {
  $('#login').click(() => {
    $('.popup').slideToggle(600);
  });

  $('#signup').click(() => {
    alert('signup');
  });

  $('.popup').hide();
});
