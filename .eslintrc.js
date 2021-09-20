module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "no-useless-constructor": "off",
        "no-unused-vars": "off",
        "react/prop-types": 0,
        "react/no-unescaped-entities": 0,
        "no-extra-semi": 0,
        "react/display-name": 0,
        "react/jsx-key": 0,
        "no-mixed-spaces-and-tabs": 0,
        "react/no-string-refs": 0,
        "no-constant-condition": 0,
        "function-calc-no-unspaced-operator": 0,
        "function-calc-no-invalid": 0

    }
};