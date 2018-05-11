
Vue.component('loginbanner', {
  props: ['banner'],
  template: `
    <transition name="fade">
      <span v-show="banner.show" v-bind:class="['banner', banner.type == 0 ? 'success' : 'failure']">{{ banner.message }}</span>
    </transition>
  `
});

Vue.component('logincontainer', {
  template: `
  <div>
    <slot name="login-nav"></slot>
    <slot name="login-menu"></slot>
    <slot name="signup-menu"></slot>
  </div>
  `
});

Vue.component('loginnav', {
  props: ['user'],
  template: `
    <div class="login-controls">
      <a class="link" v-show="user == undefined" @click="onLoginClick">Log In</a>
      <a class="link" v-show="user != undefined">{{ user }}</a>
      <span style="margin: 0 3px">|</span>
      <a class="link" v-show="user == undefined" @click="onSignupClick">Sign Up</a>
      <a class="link" v-show="user != undefined" @click="onSignoutClick">Sign Out</a>
    </div>
  `,
  methods: {
    onLoginClick: function(e) {
      this.$emit('login:click');
    },
    onSignupClick: function(e) {
      this.$emit('signup:click');
    },
    onSignoutClick: function(e) {
      this.$emit('signout:click');
    }
  }
});

Vue.component('loginmenu', {
  props: ['enabled'],
  template: `
    <transition name="fall">
      <div class="login-menu" v-show="enabled">
        <div class="popup-arrow"></div>
        <div class="popup-content">
          <slot name="login-form"></slot>
        </div>
      </div>
    </transition>
  `
});

Vue.component('loginform', {
  props: ['loginData'],
  template: `
    <form style="margin: 0" @submit.prevent="onFormSubmit">
      <h2>Username</h2>
      <input type="text" class="text-field" :value="loginData.username" @input="onUserInput" />
      <h2 style="margin-top: 15px">Password</h2>
      <input type="password" class="text-field" :value="loginData.password" @input="onPassInput" />
      <input type="submit" class="button" v-bind:disabled="loginData.buttonDisabled" value="Login" style="margin-top: 15px" />
    </form>
  `,
  methods: {
    onUserInput: function(e) {
      this.$emit('user:input', e.target.value);
    },
    onPassInput: function(e) {
      this.$emit('pass:input', e.target.value);
    },
    onFormSubmit: function(e) {
      this.$emit('form:submit');
    }
  }
});

Vue.component('signupmenu', {
  template: `
    <div class="signup-menu">
      <h2 style="font-size: 1.8em">Create Account</h2>
      <hr style="color: #aaa" ></hr>
      <div style="padding: 0 45px">
        <slot name="signup-form"></slot>
      </div>
    </div>
  `
});

Vue.component('signupform', {
  props: ['formData'],
  template: `
    <form @submit.prevent="onFormSubmit">
      <h2 style="margin-top: 15px">Username</h2>
      <input type="text" class="text-field" v-bind:value="formData.username" @keyup="onUserKeyup($event)" @input="onUserInput($event)" />
      <slot name="user-tooltip"></slot>
      <h2 style="margin-top: 15px">Password</h2>
      <input type="password" class="text-field" v-bind:value="formData.password" @keyup="onPassKeyup($event)" @input="onPassInput($event)" />
      <slot name="pass-tooltip"></slot>
      <input type="button" class="button button-cancel" value="Cancel" @click="onCancelClick" />
      <input type="submit" class="button" v-bind:disabled="formData.buttonDisabled" value="Create" style="margin-top: 20px; margin-left: 30px" />
    </form>
  `,
  methods: {
    onUserInput: function(e) {
      this.$emit('user:input', e.target.value);
    },
    onPassInput: function(e) {
      this.$emit('pass:input', e.target.value);
    },
    onUserKeyup: function(e) {
      if (e.keyCode != 13 && e.keyCode != 9) {
        this.$emit('user:keyup');
      }
    },
    onPassKeyup: function(e) {
      if (e.keyCode != 13 && e.keyCode != 9) {
        this.$emit('pass:keyup');
      }
    },
    onCancelClick: function(e) {
      this.$emit('cancel:click');
    },
    onFormSubmit: function(e) {
      this.$emit('form:submit');
    }
  }
});

let BANNER_TYPE = {
  success: 0,
  failure: 1
};

let account = new Vue({
  el: '#loginApp',
  data: {
    loggedUser: undefined, //The current logged in username
    favourites: [],
    loginData: { //Login menu data
      username: '',
      password: '',
      buttonDisabled: false
    },
    formData: { //Signup menu data
      username: '',
      password: '',
      buttonDisabled: false
    },
    tooltips: {
      username: {
        show: false,
        message: ''
      },
      password: {
        show: false,
        message: ''
      },
      favourite: {
        show: false,
        message: ''
      }
    },
    loginVis: false, //Visibility state of the login menu
    banner: {
      show: false,
      type: BANNER_TYPE.success,
      message: ''
    }
  },
  watch: {
    /*
     * Reset the favourites list on logout. Fetch the users favourites on login
     */
    loggedUser: function(value) {
      if (value == undefined) {
        this.favourites = [];
      } else {
        this.fetchFavourites();
      }
    }
  },
  computed: {
    /*
     * Returns whether the current icao is within the account's favourite list
     */
    isFavourite: function() {
      if (location.pathname.split('/').length < 3) return false;
      return this.favourites.indexOf(location.pathname.split('/')[2].toUpperCase()) != -1;
    },
    /*
     * Returns the appropriate method to be called when the favourite toggle is pressed
     * removeFavourite - The airport is currently a favourite
     * addFavourite - The airport is not currently a favourite
     */
    onFavouriteToggle: function() {
      if (this.isFavourite) {
        return this.removeFavourite;
      } else {
        return this.addFavourite;
      }
    },
    /*
     * Returns the image path for the favourite button based on whether the current airport is a favourite
     */
    favouriteUrl: function() {
      if (this.isFavourite) return '../resources/star-filled.png';
      return '../resources/star-outline.png';
    }
  },
  methods: {
    //Gets the logged in username based on token (Called on pageload)
    authorizeToken: function() {
      this.$http({
        method: 'GET',
        url: '/auth'
      }).then(function(response) { //Success
        this.loggedUser = response.body;
      }, function(response) { //Error - also called if no token was passed
        this.loggedUser = undefined;
      });
    },
    fetchFavourites: function() {
      this.$http({
        method: 'GET',
        url: '/users/favourites'
      }).then(function(response) {
        this.favourites = response.body;
      }, function(response) {
        console.log(response);
      });
    },
    //Opens and closes the login menu. Username and password data is cleared on opening
    toggleLoginMenu: function() {
      this.loginVis = !this.loginVis;
      this.loginData.username = '';
      this.loginData.password = '';
    },
    //Opens the signup modal dialog
    openSignUpForm: function() {
      $('.signup-menu').dialog('open');
      this.formData.username = '';
      this.formData.password = '';
    },
    //Closes the signup modal dialog
    closeSignUpForm: function() {
      $('.signup-menu').dialog('close');
    },
    //Submits the login data to the server. If successful login, the server registers the client a token cookie
    loginSubmit: function() {
      this.loginData.buttonDisabled = true; //Disable further submits while the http request is incomplete
      this.$http({
        method: 'POST',
        url: '/login',
        body: {username: this.loginData.username, password: this.loginData.password}
      }).then(function(response) { //Successful login
        this.loggedUser = response.body;
        this.loginVis = false; //Close the login menu once logged in
      }, function(response) { //Failed login
        if (response.status == 401) $('.login-menu').effect('shake', {distance: 8, times: 2}); this.loginData.password = '';
        console.log(response);
      }).finally(function() {
        this.loginData.buttonDisabled = false;
      });
    },
    //Signs the user out. The server clears the token cookie on receiving this request
    signOut: function() {
      this.$http({
        method: 'POST',
        url: '/logout'
      }).then(function(response) { //Success
        this.loggedUser = undefined;
      }, function(response) { //Error
        console.log(response);
      });
    },
    //Sends the form data to the server to create a new user account
    signupSubmit: function() {
      let valid = true;
      //Validate the signup details
      if (!/^[A-Za-z0-9]{3,50}$/.test(this.formData.username)) {
        valid = false;
        this.tooltips.username.message = 'Username must be alphanumeric with between 3 & 50 characters';
        this.tooltips.username.show = true;
      }
      if ( valid == true || this.formData.password.length > 0) { //Check if the username was valid OR the password input has input
        if(this.formData.password.length < 8) {
          valid = false;
          this.tooltips.password.message = "Password must be 8 or more characters";
          this.tooltips.password.show = true;
        }
      }
      if (valid) {
        this.formData.buttonDisabled = true; //Disable further submits while the http request is incomplete
        this.$http({
          method: 'POST',
          url: '/users',
          body: {username: this.formData.username, password: this.formData.password}
        }).then(function(response) { //Successful creation
          this.closeSignUpForm();
          this.showBanner(BANNER_TYPE.success, `Account ${this.formData.username} created`)
        }, function(response) { //Unsuccessful creation
          this.showBanner(BANNER_TYPE.failure, response.body);
        }).finally(function() {
          this.formData.buttonDisabled = false;
        });
      }
    },
    showBanner: function(type, msg) {
      this.banner.show = true;
      this.banner.type = type;
      this.banner.message = msg;
      let banner = this.banner;
      setTimeout(function() { //Setup the banner to hide after 3 seconds
        banner.show = false;
      }, 3000);
    },
    redirectToAirport: function(airport) {
      window.location = '/airport/' + airport;
    },
    addFavourite: function() {
      let icao = location.pathname.split('/')[2].toUpperCase(); //Get the icao from the current path
      this.$http({
        method: 'POST',
        url: '/users/favourites',
        body: {icao: icao}
      }).then((response) => {
        this.favourites.push(icao); //Add the icao to the favourites list
      }, (response) => {
        if (response.body = 'User has the maximum number of favourites') {
          this.tooltips.favourite.message = 'Unfavourite another airport first'
          this.tooltips.favourite.show = true;
        }
      });
    },
    removeFavourite: function() {
      let icao = location.pathname.split('/')[2].toUpperCase(); //Get the icao from the current path
      this.$http({
        method: 'DELETE',
        url: '/users/favourites/' + icao
      }).then((response) => {
        let index = this.favourites.indexOf(icao);
        if (index > -1) {
          this.favourites.splice(index, 1); //Remove the icao from the favourites list
        }
      }, (response) => {
        console.log(response);
      });
    }
  }
});

account.authorizeToken(); //Authorize the token on pageload

$(() => {
  //Register the signup menu as a modal dialog
  $('.signup-menu').dialog({
    show: 'fade',
    hide: 'fade',
    dialogClass: 'no-close',
    modal: true,
    autoOpen: false
  }).disableSelection();
});
