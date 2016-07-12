var colorVars, iconDimension, textureVars,
	async = require( "async" ),
	extend = require( "util" )._extend,
	Image = require( "./themeroller-image" ),
	querystring = require( "querystring" ),
	semver = require( "semver" ),
	textures = require( "./themeroller-textures" );

colorVars = "bgColorActive bgColorContent bgColorDefault bgColorError bgColorHeader bgColorHighlight bgColorHover bgColorOverlay bgColorShadow borderColorActive borderColorContent borderColorDefault borderColorError borderColorHeader borderColorHighlight borderColorHover fcActive fcContent fcDefault fcError fcHeader fcHighlight fcHover iconColorActive iconColorContent iconColorDefault iconColorError iconColorHeader iconColorHighlight iconColorHover".split( " " );
textureVars = "bgTextureDefault bgTextureHover bgTextureActive bgTextureHeader bgTextureContent bgTextureHighlight bgTextureError bgTextureOverlay bgTextureShadow".split( " " );

// Hard coded css Y image positioning - context accepts button or panel
function cssYPos( texture, context ){
	var YPos;
	if ( texture === "flat" ) {
		return "";
	}
	YPos = "50%";
	if( context === "panel" ){
		if( texture === "highlight_soft" || texture === "highlight_hard" || texture === "gloss_wave" ){
			YPos = "top";
		}
		else if( texture === "inset_soft" || texture === "inset_hard" ){
			YPos = "bottom";
		}
		else if( texture === "glow_ball" ){
			YPos = "35%";
		}
		else if( texture === "spotlight" ){
			YPos = "2%";
		}
	}
	return YPos;
}

// Hard coded css X image positioning - context accepts button or panel
function cssXPos( texture ){
	if ( texture === "flat" ) {
		return "";
	}
	// No conditions yet, may need some for vertical slider patterns.
	// XPos = "50%";
	return "50%";
}

// Add '#' in the beginning of the colors if needed
function hashColor( color ) {
		if (color && ( color.length === 3 || color.length === 6 ) && /^[0-9a-f]+$/i.test( color ) ) {
			color = "#" + color;
		}
		return color;
}

// Update textureVars from previous filename format (eg. 02_glass.png) to type-only format (eg. glass). Changed on images generation rewrite (port to nodejs).
function oldImagesBackCompat( vars ) {
	textureVars.forEach(function( textureVar ) {
		var newValue, value;
		if ( textureVar in vars ) {
			value = vars[ textureVar ];
			newValue = value.replace( /[0-9]*_([^\.]*).png/, "$1" );
			if ( value !== newValue ) {
				vars[ textureVar ] = newValue;
			}
		}
	});
}

textures = textures.reduce(function( sum, texture ) {
	sum[ texture.type ] = texture;
	return sum;
}, {});

iconDimension = [ "256", "240" ];


/**
 * ThemeRoller
 */
function ThemeRoller( baseThemeCss, vars, options ) {
	var opacityFilter, opacityFix;
	if ( typeof baseThemeCss !== "string" ) {
		baseThemeCss = baseThemeCss.toString( "utf-8" );
	}
	this.baseThemeCss = baseThemeCss;
	options = options || {};
	if ( typeof vars !== "object" ) {
		throw new Error( "Wrong type `vars`" );
	}
	if ( typeof options !== "object" ) {
		throw new Error( "Wrong type `options`" );
	}
	this.vars = vars = extend( {}, vars );
	if ( vars.zThemeParams ) {
		throw new Error( "vars.zThemeParams unsupported at the moment. Unzipped vars only." );
	}
	oldImagesBackCompat( vars || {} );
	this.serializedVars = querystring.stringify( vars );
	this.images = [];

	// Opacity fix
	// TODO: Remove `filter` style when dropping support for IE8 and earlier.
	vars.opacityOverlayPerc = vars.opacityOverlay;
	vars.opacityShadowPerc = vars.opacityShadow;
	if ( options.version && semver.lt( options.version, "1.10.0" ) ) {

		// For version < 1.10.0, opacity (w3c) and filter (IE) are combined into the same line.
		opacityFix = function( opacity ) {
			return /* w3c */ ( opacity / 100 ).toString().replace( /^0\./, "." ) + /* IE */ ";filter:Alpha(Opacity=" + opacity + ")";
		};
		vars.opacityOverlay = opacityFix( vars.opacityOverlay );
		vars.opacityShadow = opacityFix( vars.opacityShadow );

	} else {

		// For version >= 1.10.0, filter has its own separate line and variable name.
		opacityFix = function( opacity ) {
			return ( opacity / 100 ).toString().replace( /^0\./, "." );
		};
		opacityFilter = function( opacity ) {
			return "Alpha(Opacity=" + opacity + ")";
		};
		vars.opacityFilterOverlay = opacityFilter( vars.opacityOverlay );
		vars.opacityFilterShadow = opacityFilter( vars.opacityShadow );
		vars.opacityOverlay = opacityFix( vars.opacityOverlay );
		vars.opacityShadow = opacityFix( vars.opacityShadow );
	}

	// Add '#' in the beginning of the colors if needed
	colorVars.forEach(function( colorVar ) {
		vars[ colorVar ] = hashColor( vars[ colorVar ] );
	});

	// Set hard coded image url
	vars.bgImgUrlActive = this._textureUrl( vars.bgColorActive, vars.bgTextureActive, vars.bgImgOpacityActive );
	vars.bgImgUrlContent = this._textureUrl( vars.bgColorContent, vars.bgTextureContent, vars.bgImgOpacityContent );
	vars.bgImgUrlDefault = this._textureUrl( vars.bgColorDefault, vars.bgTextureDefault, vars.bgImgOpacityDefault );
	vars.bgImgUrlError = this._textureUrl( vars.bgColorError, vars.bgTextureError, vars.bgImgOpacityError );
	vars.bgImgUrlHeader = this._textureUrl( vars.bgColorHeader, vars.bgTextureHeader, vars.bgImgOpacityHeader );
	vars.bgImgUrlHighlight = this._textureUrl( vars.bgColorHighlight, vars.bgTextureHighlight, vars.bgImgOpacityHighlight );
	vars.bgImgUrlHover = this._textureUrl( vars.bgColorHover, vars.bgTextureHover, vars.bgImgOpacityHover );
	vars.bgImgUrlOverlay = this._textureUrl( vars.bgColorOverlay, vars.bgTextureOverlay, vars.bgImgOpacityOverlay );
	vars.bgImgUrlShadow = this._textureUrl( vars.bgColorShadow, vars.bgTextureShadow, vars.bgImgOpacityShadow );
	vars.iconsActive = this._iconUrl( vars.iconColorActive );
	vars.iconsContent = this._iconUrl( vars.iconColorContent );
	vars.iconsDefault = this._iconUrl( vars.iconColorDefault );
	vars.iconsError = this._iconUrl( vars.iconColorError );
	vars.iconsHeader = this._iconUrl( vars.iconColorHeader );
	vars.iconsHighlight = this._iconUrl( vars.iconColorHighlight );
	vars.iconsHover = this._iconUrl( vars.iconColorHover );

	// Set hard coded css image repeats
	vars.bgDefaultRepeat = this._cssRepeat( vars.bgTextureDefault );
	vars.bgHoverRepeat = this._cssRepeat( vars.bgTextureHover );
	vars.bgActiveRepeat = this._cssRepeat( vars.bgTextureActive );
	vars.bgHeaderRepeat = this._cssRepeat( vars.bgTextureHeader );
	vars.bgContentRepeat = this._cssRepeat( vars.bgTextureContent );
	vars.bgHighlightRepeat = this._cssRepeat( vars.bgTextureHighlight );
	vars.bgErrorRepeat = this._cssRepeat( vars.bgTextureError );
	vars.bgOverlayRepeat = this._cssRepeat( vars.bgTextureOverlay );
	vars.bgShadowRepeat = this._cssRepeat( vars.bgTextureShadow );

	// Set hard coded css Y image positioning
	vars.bgDefaultYPos = cssYPos( vars.bgTextureDefault, "button" );
	vars.bgHoverYPos = cssYPos( vars.bgTextureHover, "button" );
	vars.bgActiveYPos = cssYPos( vars.bgTextureActive, "button" );
	vars.bgHeaderYPos = cssYPos( vars.bgTextureHeader, "button" );
	vars.bgContentYPos = cssYPos( vars.bgTextureContent, "panel" );
	vars.bgHighlightYPos = cssYPos( vars.bgTextureHighlight, "panel" );
	vars.bgErrorYPos = cssYPos( vars.bgTextureError, "panel" );
	vars.bgOverlayYPos = cssYPos( vars.bgTextureOverlay, "panel" );
	vars.bgShadowYPos = cssYPos( vars.bgTextureShadow, "panel" );

	// Set hard coded css X image positioning
	vars.bgDefaultXPos = cssXPos( vars.bgTextureDefault, "button" );
	vars.bgHoverXPos = cssXPos( vars.bgTextureHover, "button" );
	vars.bgActiveXPos = cssXPos( vars.bgTextureActive, "button" );
	vars.bgHeaderXPos = cssXPos( vars.bgTextureHeader, "button" );
	vars.bgContentXPos = cssXPos( vars.bgTextureContent, "panel" );
	vars.bgHighlightXPos = cssXPos( vars.bgTextureHighlight, "panel" );
	vars.bgErrorXPos = cssXPos( vars.bgTextureError, "panel" );
	vars.bgOverlayXPos = cssXPos( vars.bgTextureOverlay, "panel" );
	vars.bgShadowXPos = cssXPos( vars.bgTextureShadow, "panel" );

	// This is the fix for when no font-family is specified
	if ( vars.ffDefault === "" || !vars.ffDefault ) {
		vars.ffDefault = "inherit";
	}
}

ThemeRoller.prototype = {
	_cssRepeat: function( textureType ) {
		var texture;
		if ( textureType === "flat" ) {
			return "";
		}
		texture = textures[ textureType ];
		if ( typeof texture === "undefined" ) {
			throw new Error( "Texture \"" + textureType + "\" not defined" );
		}
		return texture.repeat;
	},

	_iconUrl: function( color ) {
		var image = new Image({
			icon: { color: color }
		});
		this.images.push( image );
		return this._imageUrl( image.filename() );
	},

	_imageUrl: function( filename ) {
		if ( this.vars.dynamicImage ) {
			return "url(\"" + this.vars.dynamicImageHost + "/themeroller/images/" + filename + "\")";
		} else {
			return "url(\"images/" + filename + "\")";
		}
	},

	_textureUrl: function( color, textureType, opacity ) {
		var image, texture;
		if ( textureType === "flat" ) {
			return "";
		}
		texture = textures[ textureType ];
		if ( typeof texture === "undefined" ) {
			throw new Error( "No dimensions set for texture \"" + textureType + "\"" );
		}
		image = new Image({
			texture: {
				color: color,
				height: texture.height,
				opacity: opacity,
				texture: true,
				type: texture.type,
				width: texture.width
			}
		});
		this.images.push( image );
		return this._imageUrl( image.filename() );
	},

	css: function() {
		if ( !this._css ) {
			var vars = this.vars;
			this._css = this.baseThemeCss.replace( /([\s]+[\S]+| )\/\*\{([^\}\*\/]+)\}\*\//g, function( match, g1, p1 ) {
				return " " + vars[ p1 ];
			}).replace( /[\s]+;/g, ";" );
			if ( this.serializedVars.length > 0 ) {
				// Theme url
				this._css = this._css.replace( /\/themeroller\//, this.url() );
			}
		}
		return this._css;
	},

	generateImages: function( callback ) {
		var generated = {};
		async.parallel( this.images.map(function( image ) {
			return function( callback ) {
				image.get(function( error, filename, data ) {
					if ( generated[ filename ] ) {
						return callback();
					}
					generated[ filename ] = true;
					callback( error, {
						path: filename,
						data: data
					});
				});
			};
		}), function( error, results ) {
			var imageFiles = {};
			if ( error ) {
				return callback( error );
			}
			results.forEach(function( file ) {
				if ( file && file.path && file.data ) {
					imageFiles[ file.path ] = file.data;
				}
			});
			callback( null, imageFiles );
		});
	},

	isEqual: function( theme ) {
		var self = this;
		return Object.keys( this.vars ).every(function( key ) {
			return self.vars[ key ] === theme.vars[ key ];
		});
	},

	url: function() {
		var querystring = this.serializedVars;
		return "/themeroller/" + ( querystring.length ? "?" + querystring : querystring );
	}
};

module.exports = ThemeRoller;
