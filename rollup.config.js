import vue from "rollup-plugin-vue";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import babel from "@rollup/plugin-babel";
import terser from '@rollup/plugin-terser';
import minimist from "minimist";
import url from "@rollup/plugin-url";
import typescript from 'rollup-plugin-typescript2';

import fs from 'fs'
import path from 'path'


const argv = minimist(process.argv.slice(2));

const projectRoot = path.resolve(__dirname, ".");

const external = ["vue"];

const globals = { vue: "Vue" };

const baseFolder = "./src/";
const componentsFolder = "components/";

const postVueConfig = [
    resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
    }),
    url({
        include: [
            '**/*.svg',
            '**/*.png',
            '**/*.gif',
            '**/*.jpg',
            '**/*.jpeg'
        ]
    }),
]

const baseConfig = {
    plugins: {
        preVue: [
            alias({
                entries: [
                    {
                        find: "@",
                        replacement: `${path.resolve(projectRoot, "src")}`
                    }
                ],
                customResolver: resolve({
                    extensions: [".js", ".jsx", ".vue"]
                })
            })
        ],
        replace: {
            "process.env.NODE_ENV": JSON.stringify("production"),
            __VUE_OPTIONS_API__: JSON.stringify(true),
            __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
            preventAssignment: true
        },
        vue: {
            css: true,
            template: {
                isProduction: true,
            },
        },
        postVue: [
            ...postVueConfig
        ],
        babel: {
            exclude: "node_modules/**",
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
            babelHelpers: "bundled"
        }
    }
};

const components = fs
    .readdirSync(baseFolder + componentsFolder)
    .filter(f =>
        fs.statSync(path.join(baseFolder + componentsFolder, f)).isDirectory()
    );

const entriespath = {
    index: "./src/index.ts",
    ...components.reduce((obj, name) => {
        obj[name] = baseFolder + componentsFolder + name + "/index.ts";
        return obj;
    }, {})
};

const capitalize = s => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
};

let buildFormats = [];

const mapComponent = name => {
    return [
        {
            ...baseConfig,
            input: baseFolder + componentsFolder + `${name}/index.ts`,
            external,
            output: {
                format: "umd",
                name: capitalize(name),
                file: `dist/components/${name}/index.ts`,
                exports: "named",
                globals
            },
            plugins: [
                ...baseConfig.plugins.preVue,
                vue({ ...baseConfig.plugins.vue }),
                ...baseConfig.plugins.postVue,
                typescript({
                    useTsconfigDeclarationDir: true,
                    emitDeclarationOnly: true,
                }),
                babel({
                    ...baseConfig.plugins.babel,
                    presets: [["@babel/preset-env", { modules: false }]]
                }),
                commonjs()
            ]
        }
    ];
};

if (!argv.format || argv.format === "es") {
    const esConfig = {
        ...baseConfig,
        input: entriespath,
        external,
        output: {
            format: "esm",
            dir: "dist/esm",
            exports: "named",
            globals
        },
        plugins: [
            replace(baseConfig.plugins.replace),
            ...baseConfig.plugins.preVue,
            vue(baseConfig.plugins.vue),
            ...baseConfig.plugins.postVue,
            typescript({
                useTsconfigDeclarationDir: true,
                emitDeclarationOnly: true,
            }),
            babel({
                ...baseConfig.plugins.babel,
                presets: [["@babel/preset-env", { modules: false }]]
            }),
            commonjs(),
        ]
    };

    const merged = {
        ...baseConfig,
        input: "src/index.ts",
        external,
        output: {
            format: "esm",
            file: "dist/vuelib.esm.js",
            exports: "named",
            globals
        },
        plugins: [
            replace(baseConfig.plugins.replace),
            ...baseConfig.plugins.preVue,
            vue(baseConfig.plugins.vue),
            ...baseConfig.plugins.postVue,
            typescript({
                useTsconfigDeclarationDir: true,
                emitDeclarationOnly: true,
            }),
            babel({
                ...baseConfig.plugins.babel,
                presets: [["@babel/preset-env", { modules: false }]]
            }),
            commonjs(),
        ]
    };
    const ind = [
        ...components.map(f => mapComponent(f)).reduce((r, a) => r.concat(a), [])
    ];
    buildFormats.push(esConfig);
    buildFormats.push(merged);
    buildFormats = [...buildFormats, ...ind];
}

if (!argv.format || argv.format === "iife") {
    const unpkgConfig = {
        ...baseConfig,
        input: "./src/index.ts",
        external,
        output: {
            compact: true,
            file: "dist/vuelib-browser.min.js",
            format: "iife",
            name: "vuelib",
            exports: "named",
            globals
        },
        plugins: [
            replace(baseConfig.plugins.replace),
            ...baseConfig.plugins.preVue,
            vue(baseConfig.plugins.vue),
            ...baseConfig.plugins.postVue,
            typescript({
                useTsconfigDeclarationDir: true,
                emitDeclarationOnly: true,
            }),
            babel(baseConfig.plugins.babel),
            commonjs(),
            terser({
                output: {
                    ecma: 5
                }
            })
        ]
    };
    buildFormats.push(unpkgConfig);
}

if (!argv.format || argv.format === "cjs") {
    const cjsConfig = {
        ...baseConfig,
        input: entriespath,
        external,
        output: {
            compact: true,
            format: "cjs",
            dir: "dist/cjs",
            exports: "named",
            globals
        },
        plugins: [
            replace(baseConfig.plugins.replace),
            ...baseConfig.plugins.preVue,
            vue({
                ...baseConfig.plugins.vue,
                template: {
                    ...baseConfig.plugins.vue.template,
                    optimizeSSR: true
                }
            }),
            ...baseConfig.plugins.postVue,
            typescript({
                useTsconfigDeclarationDir: true,
                emitDeclarationOnly: true,
            }),
            babel(baseConfig.plugins.babel),
            commonjs(),
        ]
    };
    buildFormats.push(cjsConfig);
}

export default buildFormats;