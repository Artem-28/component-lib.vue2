import Vue from 'vue'
import App from './App.vue'
import Lib from './index'

Vue.config.productionTip = false
Vue.use(Lib)
const app = new Vue({
  render: h => h(App),
});
app.$mount?.('#app')
