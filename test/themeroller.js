import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "chai";
import ThemeRoller from "../lib/themeroller.js";

const dirname = path.dirname( fileURLToPath( import.meta.url ) );

describe( "ThemeRoller", function() {
	let theme;

	beforeEach( async function() {
		const baseThemeCss = await fs.readFile( `${ dirname }/fixtures/jquery-ui-1.12/base/theme.css`, "utf-8" );
		const varsString = await fs.readFile( `${ dirname }/fixtures/vars/base.json`, "utf-8" );
		const vars = JSON.parse( varsString );

		theme = new ThemeRoller( baseThemeCss, vars );
	} );

	it( "should instantiate", async function() {
		expect( theme ).to.be.an.instanceof( ThemeRoller );
	} );

	it( "should generate the theme CSS", async function() {
		const baseCssFixture = await fs.readFile( dirname + "/fixtures/jquery-ui-1.12/themes/base.css", "utf-8" );
		expect( theme.css() ).to.equal( baseCssFixture );
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
