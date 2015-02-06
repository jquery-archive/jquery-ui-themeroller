## Why jquery-ui-themeroller?

Use `jquery-ui-themeroller` to generate the CSS of your jQuery UI theme.

## Usage

   npm install jquery-ui-themeroller

```javascript
var fs = require( "js" );
var ThemeRoller = require( "jquery-ui-themeroller" );

var baseThemeCss = fs.readFileSync( "./jquery-ui/base/theme.css" );

var themeroller = new ThemeRoller( baseThemeCss, myThemeVars );
var myThemeCss = themeroller.css();
```

## API

- **`ThemeRoller( baseThemeCss, vars )`**

**baseThemeCss** *String/Buffer* containing jQuery UI's `./base/theme.css`.

**vars** *Object* containing (theme property, value) key-value pairs. See
https://github.com/jquery/download.jqueryui.com/blob/master/lib/themeroller-themegallery.js
for more details.

## Test

    npm test

