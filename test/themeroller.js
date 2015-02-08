var expect = require( "chai" ).expect,
	fs = require( "fs" ),
	ThemeRoller = require( "../lib/themeroller.js" );

describe( "ThemeRoller", function() {
	var theme;

	it( "should instantiate", function() {
		var baseThemeCss = fs.readFileSync( __dirname + "/fixtures/jquery-ui-1.12/base/theme.css" ),
			vars = require( "./fixtures/vars/base.json" );

		theme = new ThemeRoller( baseThemeCss, vars );
		expect( theme ).to.be.an.instanceof( ThemeRoller );
	});

	it( "should generate the theme CSS", function() {
		expect( theme.css() ).to.equal(
			fs.readFileSync( __dirname + "/fixtures/jquery-ui-1.12/themes/base.css" ).toString( "utf-8" )
		);
	});

	it( "should generate images", function( done ) {
		theme.generateImages(function( error, images ) {
			try {
				expect( error ).to.be.null;
				expect( images ).to.be.an( "object" );
			} finally {
				done();
			}
		});
	});

});
