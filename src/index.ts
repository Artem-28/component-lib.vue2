import { PluginFunction } from "vue";
import * as components from "./components/index";
import { setVueInstance } from "@/utils/config";

const install: PluginFunction<Plugin> = (
    instance
) => {
    setVueInstance(instance);
    for (const componentKey in components) {
        instance.use((components as any)[componentKey]);
    }
};

export default install;

export * from "./components";
export * from './utilities';