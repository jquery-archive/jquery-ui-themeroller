import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "chai";
import ThemeRoller from "../lib/themeroller.js";

const dirname = path.dirname( fileURLToPath( import.meta.url ) );

describe( "ThemeRoller", function() {
	let theme;

	[ "1.12.1", "1.13.3" ].forEach( ( jQueryUiVersion ) => {
		describe( `with jQuery UI ${ jQueryUiVersion }`, function() {
			beforeEach( async function() {
				const baseThemeCss = await fs.readFile( `${ dirname }/fixtures/jquery-ui-${ jQueryUiVersion }/base/theme.css`, "utf-8" );
				const varsString = await fs.readFile( `${ dirname }/fixtures/vars/smoothness.json`, "utf-8" );
				const vars = JSON.parse( varsString );

				theme = new ThemeRoller( baseThemeCss, vars, { version: jQueryUiVersion } );
			} );

			it( "should instantiate", async function() {
				expect( theme ).to.be.an.instanceof( ThemeRoller );
			} );

			it( "should generate the theme CSS", async function() {
				const smoothnessCssFixture = await fs.readFile( `${ dirname }/fixtures/jquery-ui-${ jQueryUiVersion }/themes/smoothness.css`, "utf-8" );
				expect( theme.css() ).to.equal( smoothnessCssFixture );
			} );

			it( "should generate images", async function() {
				return new Promise( ( resolve ) => {
					theme.generateImages( function( error, images ) {
						try {
							expect( error ).to.be.null;
							expect( images ).to.be.an( "object" );
						} finally {
							resolve();
						}
					} );
				} );
			} );
		} );
	} );

} );
