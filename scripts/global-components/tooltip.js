Vue.component('tooltip', {
  props: ['show', 'message'],
  template: `
    <transition name="shrink">
      <div v-show="show" @click="hide" class="tooltip">
        <div class="tooltip-arrow"></div>
        <div class="tooltip-container">{{message}}</div>
      </div>
    </transition>
  `,
  methods: {
    hide () {
      this.$emit('tooltip:hide');
    }
  }
});
