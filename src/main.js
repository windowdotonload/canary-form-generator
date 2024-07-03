import "./style.css";
import App from "./App.vue";
import Vue from "vue";
console.log("this isvue", Vue);
new Vue({
  el: "#app",
  render: (h) => h(App),
});
