import jqueryConfig from "eslint-config-jquery";
import globals from "globals";

export default [
	{
		ignores: [
			"test/fixtures/**"
		]
	},

	{
		languageOptions: {
			globals: {
				...globals.node
			}
		},
		rules: {
			...jqueryConfig.rules,
			strict: [ "error", "global" ],

			// Too many errors
			"max-len": "off"
		}
	},

	{
		files: [
			"test/*.js"
		],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.mocha
			}
		},
		rules: {
			...jqueryConfig.rules,

			// Chai `expect` API violates this rule
			"no-unused-expressions": "off",

			// Too many errors
			"max-len": "off"
		}
	}
];
