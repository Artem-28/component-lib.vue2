import { DefineComponent, VueConstructor} from 'vue'

export const registerComponent = (
    app: VueConstructor,
    component: DefineComponent
) => {
    const componentName = component?.name || '' as string;
    const install = function(Vue: VueConstructor): void {
        if ((install as any).installed) return;
        (install as any).installed = true;
        app.component(componentName, component);
    };
    component.install = install;
};