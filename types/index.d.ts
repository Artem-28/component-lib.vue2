import { PluginFunction, PluginObject } from "vue";

// Определение типов для componentLib
declare const componentLib: PluginObject<any> | PluginFunction<any>;

export default componentLib;

// Определение типов для MyButton
export const MyButton: PluginObject<any> | PluginFunction<any>;