import { PluginObject } from "vue";
import MyButton from "./MyButton.vue";

const Plugin: PluginObject<Plugin> = {
    install(vue) {
        vue.component('MyButton', MyButton);
    }
};

export default Plugin;

export { MyButton };

