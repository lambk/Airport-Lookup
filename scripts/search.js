
let searchApp = new Vue({
  el: '#searchApp',
  data: {
    tooltip: {
      show: false,
      message: ''
    },
    icao: ''
  },
  methods: {
    searchSubmit: function(event) {
      if (this.icao.length == 0) { //No input
        this.tooltip.message = 'Field required';
      } else if (!/^[A-Za-z]{4}$/.test(this.icao)) { //Input is not 4 characters (upper or lowercase)
        this.tooltip.message = 'Not a valid icao code';
      } else { //Valid input
        this.tooltip.message = undefined;
      }
      //Determining whether to display the tooltip, or continue to the airport page
      if (this.tooltip.message != undefined) this.tooltip.show = true; else window.location = '/airport/' + this.icao.toLowerCase();
    },
    hideTooltip: function(event) {
      if (event.keyCode != 13) this.tooltip.show = false; //Hide the tooltip once the user starts typing
    }
  }
});
