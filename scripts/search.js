
Vue.component('tooltip', {
  props: ['show', 'message'],
  template: `
    <transition name="shrink">
      <div v-show="show" v-on:click="hideSelf" class="tooltip">
        <div class="tooltip-arrow"></div>
        <div class="tooltip-container">{{message}}</div>
      </div>
    </transition>
  `,
  methods: {
    hideSelf: function() {
      searchApp.showTooltip = false;
    }
  }
});

let searchApp = new Vue({
  el: '#searchApp',
  data: {
    showTooltip: false,
    tooltipMsg: '',
    icao: ''
  },
  methods: {
    searchSubmit: function(event) {
      if (this.icao.length == 0) { //No input
        this.tooltipMsg = 'Field required';
      } else if (!/^[A-Za-z]{4}$/.test(this.icao)) { //Input is not 4 characters (upper or lowercase)
        this.tooltipMsg = 'Invalid icao format';
      } else { //Valid input
        this.tooltipMsg = undefined;
      }
      //Determining whether to display the tooltip, or continue to the airport page
      if (this.tooltipMsg != undefined) this.showTooltip = true; else window.location = '/airport/' + this.icao.toLowerCase();
    },
    hideTooltip: function(event) {
      if (event.keyCode != 13) this.showTooltip = false; //Hide the tooltip once the user starts typing
    }
  }
});
