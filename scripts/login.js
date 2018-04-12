$(() => {
  $('#open-login').click(() => {
    $('.popup').slideToggle(600);
  });

  $('#login').click(() => {
    postLogin($('#username').val(), $('#password').val());
  });

  $('#signup').click(() => {
    alert('signup');
  });

  $('.popup').hide();
});

function postLogin(username, password) {
  let loginData = {username : username, password: password};
  $.ajax({
    type: 'POST',
    url: '/login',
    contentType: 'application/json',
    data: JSON.stringify(loginData),
    error: (response) => {
      console.log('Error on ajax response to login. Response: ' + response);
    }
  });
};
