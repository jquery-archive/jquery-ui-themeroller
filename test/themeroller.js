var expect = require( "chai" ).expect,
	fs = require( "fs" ),
	ThemeRoller = require( "../lib/themeroller.js" );

describe( "ThemeRoller", function() {

	it( "should build just fine", function() {
		var theme,
			baseThemeCss = fs.readFileSync( __dirname + "/fixtures/jquery-ui-1.12/base/theme.css" ),
			vars = require( "./fixtures/vars/base.json" );

		theme = new ThemeRoller( baseThemeCss, vars );
		expect( theme.css() ).to.equal(
			fs.readFileSync( __dirname + "/fixtures/jquery-ui-1.12/themes/base.css" ).toString( "utf-8" )
		);
	});

});
