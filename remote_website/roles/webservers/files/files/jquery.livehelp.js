/*! Third Party jQuery Plugins Licensed under MIT or LGPL - Licenses: /livehelp/scripts/LICENSES.TXT */

/*
 * jQuery JSON Plugin
 * version: 2.3 (2011-09-17)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Brantley Harris wrote this plugin. It is based somewhat on the JSON.org
 * website's http://www.json.org/json2.js, which proclaims:
 * "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 * I uphold.
 *
 * It is also influenced heavily by MochiKit's serializeJSON, which is
 * copyrighted 2005 by Bob Ippolito.
 */

(function ($) {

	var	escapeable = /["\\\x00-\x1f\x7f-\x9f]/g,
		meta = {
			'\b': '\\b',
			'\t': '\\t',
			'\n': '\\n',
			'\f': '\\f',
			'\r': '\\r',
			'"' : '\\"',
			'\\': '\\\\'
		};

	/*
	 * jQuery.toJSON
	 * Converts the given argument into a JSON respresentation.
	 *
	 * @param o {Mixed} The json-serializble *thing* to be converted
	 *
	 * If an object has a toJSON prototype, that will be used to get the representation.
	 * Non-integer/string keys are skipped in the object, as are keys that point to a
	 * function.
	 *
	 */
	$.toJSON = typeof JSON === 'object' && JSON.stringify
		? JSON.stringify
		: function( o ) {

		if ( o === null ) {
			return 'null';
		}

		var type = typeof o;

		if ( type === 'undefined' ) {
			return undefined;
		}
		if ( type === 'number' || type === 'boolean' ) {
			return '' + o;
		}
		if ( type === 'string') {
			return $.quoteString( o );
		}
		if ( type === 'object' ) {
			if ( typeof o.toJSON === 'function' ) {
				return $.toJSON( o.toJSON() );
			}
			if ( o.constructor === Date ) {
				var	month = o.getUTCMonth() + 1,
					day = o.getUTCDate(),
					year = o.getUTCFullYear(),
					hours = o.getUTCHours(),
					minutes = o.getUTCMinutes(),
					seconds = o.getUTCSeconds(),
					milli = o.getUTCMilliseconds();

				if ( month < 10 ) {
					month = '0' + month;
				}
				if ( day < 10 ) {
					day = '0' + day;
				}
				if ( hours < 10 ) {
					hours = '0' + hours;
				}
				if ( minutes < 10 ) {
					minutes = '0' + minutes;
				}
				if ( seconds < 10 ) {
					seconds = '0' + seconds;
				}
				if ( milli < 100 ) {
					milli = '0' + milli;
				}
				if ( milli < 10 ) {
					milli = '0' + milli;
				}
				return '"' + year + '-' + month + '-' + day + 'T' +
					hours + ':' + minutes + ':' + seconds +
					'.' + milli + 'Z"';
			}
			if ( o.constructor === Array ) {
				var ret = [];
				for ( var i = 0; i < o.length; i++ ) {
					ret.push( $.toJSON( o[i] ) || 'null' );
				}
				return '[' + ret.join(',') + ']';
			}
			var	name,
				val,
				pairs = [];
			for ( var k in o ) {
				type = typeof k;
				if ( type === 'number' ) {
					name = '"' + k + '"';
				} else if (type === 'string') {
					name = $.quoteString(k);
				} else {
					// Keys must be numerical or string. Skip others
					continue;
				}
				type = typeof o[k];

				if ( type === 'function' || type === 'undefined' ) {
					// Invalid values like these return undefined
					// from toJSON, however those object members
					// shouldn't be included in the JSON string at all.
					continue;
				}
				val = $.toJSON( o[k] );
				pairs.push( name + ':' + val );
			}
			return '{' + pairs.join( ',' ) + '}';
		}
	};

	/*
	 * jQuery.evalJSON
	 * Evaluates a given piece of json source.
	 *
	 * @param src {String}
	 */
	$.evalJSON = typeof JSON === 'object' && JSON.parse
		? JSON.parse
		: function( src ) {
		return (new Function('return ' + src))();
	};

	/*
	 * jQuery.secureEvalJSON
	 * Evals JSON in a way that is *more* secure.
	 *
	 * @param src {String}
	 */
	$.secureEvalJSON = typeof JSON === 'object' && JSON.parse
		? JSON.parse
		: function( src ) {

		var filtered = 
			src
			.replace( /\\["\\\/bfnrtu]/g, '@' )
			.replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
			.replace( /(?:^|:|,)(?:\s*\[)+/g, '');

		if ( /^[\],:{}\s]*$/.test( filtered ) ) {
			return (new Function('return ' + src))();
		} else {
			throw new SyntaxError( 'Error parsing JSON, source is not valid.' );
		}
	};

	/*
	 * jQuery.quoteString
	 * Returns a string-repr of a string, escaping quotes intelligently.
	 * Mostly a support function for toJSON.
	 * Examples:
	 * >>> jQuery.quoteString('apple')
	 * "apple"
	 *
	 * >>> jQuery.quoteString('"Where are we going?", she asked.')
	 * "\"Where are we going?\", she asked."
	 */
	$.quoteString = function( string ) {
		if ( string.match( escapeable ) ) {
			return '"' + string.replace( escapeable, function( a ) {
				var c = meta[a];
				if ( typeof c === 'string' ) {
					return c;
				}
				c = a.charCodeAt();
				return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
			}) + '"';
		}
		return '"' + string + '"';
	};

})( jQuery );

/*
 * jQuery JSONP Core Plugin 2.4.0 (2012-08-21)
 *
 * https://github.com/jaubourg/jquery-jsonp
 *
 * Copyright (c) 2012 Julian Aubourg
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 */
( function( $ ) {

	// ###################### UTILITIES ##

	// Noop
	function noop() {
	}

	// Generic callback
	function genericCallback( data ) {
		lastValue = [ data ];
	}

	// Call if defined
	function callIfDefined( method , object , parameters ) {
		return method && method.apply( object.context || object , parameters );
	}

	// Give joining character given url
	function qMarkOrAmp( url ) {
		return /\?/ .test( url ) ? "&" : "?";
	}

	var // String constants (for better minification)
		STR_ASYNC = "async",
		STR_CHARSET = "charset",
		STR_EMPTY = "",
		STR_ERROR = "error",
		STR_INSERT_BEFORE = "insertBefore",
		STR_JQUERY_JSONP = "_jqjsp",
		STR_ON = "on",
		STR_ON_CLICK = STR_ON + "click",
		STR_ON_ERROR = STR_ON + STR_ERROR,
		STR_ON_LOAD = STR_ON + "load",
		STR_ON_READY_STATE_CHANGE = STR_ON + "readystatechange",
		STR_READY_STATE = "readyState",
		STR_REMOVE_CHILD = "removeChild",
		STR_SCRIPT_TAG = "<script>",
		STR_SUCCESS = "success",
		STR_TIMEOUT = "timeout",

		// Window
		win = window,
		// Deferred
		Deferred = $.Deferred,
		// Head element
		head = $( "head" )[ 0 ] || document.documentElement,
		// Page cache
		pageCache = {},
		// Counter
		count = 0,
		// Last returned value
		lastValue,

		// ###################### DEFAULT OPTIONS ##
		xOptionsDefaults = {
			//beforeSend: undefined,
			//cache: false,
			callback: STR_JQUERY_JSONP,
			//callbackParameter: undefined,
			//charset: undefined,
			//complete: undefined,
			//context: undefined,
			//data: "",
			//dataFilter: undefined,
			//error: undefined,
			//pageCache: false,
			//success: undefined,
			//timeout: 0,
			//traditional: false,
			url: location.href
		},

		// opera demands sniffing :/
		opera = win.opera,

		// IE < 10
		oldIE = !!$( "<div>" ).html( "<!--[if IE]><i><![endif]-->" ).find("i").length;

	// ###################### MAIN FUNCTION ##
	function jsonp( xOptions ) {

		// Build data with default
		xOptions = $.extend( {} , xOptionsDefaults , xOptions );

		// References to xOptions members (for better minification)
		var successCallback = xOptions.success,
			errorCallback = xOptions.error,
			completeCallback = xOptions.complete,
			dataFilter = xOptions.dataFilter,
			callbackParameter = xOptions.callbackParameter,
			successCallbackName = xOptions.callback,
			cacheFlag = xOptions.cache,
			pageCacheFlag = xOptions.pageCache,
			charset = xOptions.charset,
			url = xOptions.url,
			data = xOptions.data,
			timeout = xOptions.timeout,
			pageCached,

			// Abort/done flag
			done = 0,

			// Life-cycle functions
			cleanUp = noop,

			// Support vars
			supportOnload,
			supportOnreadystatechange,

			// Request execution vars
			firstChild,
			script,
			scriptAfter,
			timeoutTimer;

		// If we have Deferreds:
		// - substitute callbacks
		// - promote xOptions to a promise
		Deferred && Deferred(function( defer ) {
			defer.done( successCallback ).fail( errorCallback );
			successCallback = defer.resolve;
			errorCallback = defer.reject;
		}).promise( xOptions );

		// Create the abort method
		xOptions.abort = function() {
			!( done++ ) && cleanUp();
		};

		// Call beforeSend if provided (early abort if false returned)
		if ( callIfDefined( xOptions.beforeSend , xOptions , [ xOptions ] ) === !1 || done ) {
			return xOptions;
		}

		// Control entries
		url = url || STR_EMPTY;
		data = data ? ( (typeof data) == "string" ? data : $.param( data , xOptions.traditional ) ) : STR_EMPTY;

		// Build final url
		url += data ? ( qMarkOrAmp( url ) + data ) : STR_EMPTY;

		// Add callback parameter if provided as option
		callbackParameter && ( url += qMarkOrAmp( url ) + encodeURIComponent( callbackParameter ) + "=?" );

		// Add anticache parameter if needed
		!cacheFlag && !pageCacheFlag && ( url += qMarkOrAmp( url ) + "_" + ( new Date() ).getTime() + "=" );

		// Replace last ? by callback parameter
		url = url.replace( /=\?(&|$)/ , "=" + successCallbackName + "$1" );

		// Success notifier
		function notifySuccess( json ) {

			if ( !( done++ ) ) {

				cleanUp();
				// Pagecache if needed
				pageCacheFlag && ( pageCache [ url ] = { s: [ json ] } );
				// Apply the data filter if provided
				dataFilter && ( json = dataFilter.apply( xOptions , [ json ] ) );
				// Call success then complete
				callIfDefined( successCallback , xOptions , [ json , STR_SUCCESS, xOptions ] );
				callIfDefined( completeCallback , xOptions , [ xOptions , STR_SUCCESS ] );

			}
		}

		// Error notifier
		function notifyError( type ) {

			if ( !( done++ ) ) {

				// Clean up
				cleanUp();
				// If pure error (not timeout), cache if needed
				pageCacheFlag && type != STR_TIMEOUT && ( pageCache[ url ] = type );
				// Call error then complete
				callIfDefined( errorCallback , xOptions , [ xOptions , type ] );
				callIfDefined( completeCallback , xOptions , [ xOptions , type ] );

			}
		}

		// Check page cache
		if ( pageCacheFlag && ( pageCached = pageCache[ url ] ) ) {

			pageCached.s ? notifySuccess( pageCached.s[ 0 ] ) : notifyError( pageCached );

		} else {

			// Install the generic callback
			// (BEWARE: global namespace pollution ahoy)
			win[ successCallbackName ] = genericCallback;

			// Create the script tag
			script = $( STR_SCRIPT_TAG )[ 0 ];
			script.id = STR_JQUERY_JSONP + count++;

			// Set charset if provided
			if ( charset ) {
				script[ STR_CHARSET ] = charset;
			}

			opera && opera.version() < 11.60 ?
				// onerror is not supported: do not set as async and assume in-order execution.
				// Add a trailing script to emulate the event
				( ( scriptAfter = $( STR_SCRIPT_TAG )[ 0 ] ).text = "document.getElementById('" + script.id + "')." + STR_ON_ERROR + "()" )
			:
				// onerror is supported: set the script as async to avoid requests blocking each others
				( script[ STR_ASYNC ] = STR_ASYNC )

			;

			// Internet Explorer: event/htmlFor trick
			if ( oldIE ) {
				script.htmlFor = script.id;
				script.event = STR_ON_CLICK;
			}

			// Attached event handlers
			script[ STR_ON_LOAD ] = script[ STR_ON_ERROR ] = script[ STR_ON_READY_STATE_CHANGE ] = function ( result ) {

				// Test readyState if it exists
				if ( !script[ STR_READY_STATE ] || !/i/.test( script[ STR_READY_STATE ] ) ) {

					try {

						script[ STR_ON_CLICK ] && script[ STR_ON_CLICK ]();

					} catch( _ ) {}

					result = lastValue;
					lastValue = 0;
					result ? notifySuccess( result[ 0 ] ) : notifyError( STR_ERROR );

				}
			};

			// Set source
			script.src = url;

			// Re-declare cleanUp function
			cleanUp = function( i ) {
				timeoutTimer && clearTimeout( timeoutTimer );
				script[ STR_ON_READY_STATE_CHANGE ] = script[ STR_ON_LOAD ] = script[ STR_ON_ERROR ] = null;
				head[ STR_REMOVE_CHILD ]( script );
				scriptAfter && head[ STR_REMOVE_CHILD ]( scriptAfter );
			};

			// Append main script
			head[ STR_INSERT_BEFORE ]( script , ( firstChild = head.firstChild ) );

			// Append trailing script if needed
			scriptAfter && head[ STR_INSERT_BEFORE ]( scriptAfter , firstChild );

			// If a timeout is needed, install it
			timeoutTimer = timeout > 0 && setTimeout( function() {
				notifyError( STR_TIMEOUT );
			} , timeout );

		}

		return xOptions;
	}

	// ###################### SETUP FUNCTION ##
	jsonp.setup = function( xOptions ) {
		$.extend( xOptionsDefaults , xOptions );
	};

	// ###################### INSTALL in jQuery ##
	$.jsonp = jsonp;

} )( jQuery );

/*
 * Crypto-JS v2.5.3
 * http://code.google.com/p/crypto-js/
 * (c) 2009-2012 by Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */
(typeof Crypto=="undefined"||!Crypto.util)&&function(){var e=window.Crypto={},k=e.util={rotl:function(b,c){return b<<c|b>>>32-c},rotr:function(b,c){return b<<32-c|b>>>c},endian:function(b){if(b.constructor==Number)return k.rotl(b,8)&16711935|k.rotl(b,24)&4278255360;for(var c=0;c<b.length;c++)b[c]=k.endian(b[c]);return b},randomBytes:function(b){for(var c=[];b>0;b--)c.push(Math.floor(Math.random()*256));return c},bytesToWords:function(b){for(var c=[],a=0,i=0;a<b.length;a++,i+=8)c[i>>>5]|=(b[a]&255)<<
24-i%32;return c},wordsToBytes:function(b){for(var c=[],a=0;a<b.length*32;a+=8)c.push(b[a>>>5]>>>24-a%32&255);return c},bytesToHex:function(b){for(var c=[],a=0;a<b.length;a++)c.push((b[a]>>>4).toString(16)),c.push((b[a]&15).toString(16));return c.join("")},hexToBytes:function(b){for(var c=[],a=0;a<b.length;a+=2)c.push(parseInt(b.substr(a,2),16));return c},bytesToBase64:function(b){if(typeof btoa=="function")return btoa(d.bytesToString(b));for(var c=[],a=0;a<b.length;a+=3)for(var i=b[a]<<16|b[a+1]<<
8|b[a+2],l=0;l<4;l++)a*8+l*6<=b.length*8?c.push("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i>>>6*(3-l)&63)):c.push("=");return c.join("")},base64ToBytes:function(b){if(typeof atob=="function")return d.stringToBytes(atob(b));for(var b=b.replace(/[^A-Z0-9+\/]/ig,""),c=[],a=0,i=0;a<b.length;i=++a%4)i!=0&&c.push(("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(b.charAt(a-1))&Math.pow(2,-2*i+8)-1)<<i*2|"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(b.charAt(a))>>>
6-i*2);return c}},e=e.charenc={};e.UTF8={stringToBytes:function(b){return d.stringToBytes(unescape(encodeURIComponent(b)))},bytesToString:function(b){return decodeURIComponent(escape(d.bytesToString(b)))}};var d=e.Binary={stringToBytes:function(b){for(var c=[],a=0;a<b.length;a++)c.push(b.charCodeAt(a)&255);return c},bytesToString:function(b){for(var c=[],a=0;a<b.length;a++)c.push(String.fromCharCode(b[a]));return c.join("")}}}();
(function(){var e=Crypto,k=e.util,d=e.charenc,b=d.UTF8,c=d.Binary,a=e.SHA1=function(b,l){var f=k.wordsToBytes(a._sha1(b));return l&&l.asBytes?f:l&&l.asString?c.bytesToString(f):k.bytesToHex(f)};a._sha1=function(a){a.constructor==String&&(a=b.stringToBytes(a));var c=k.bytesToWords(a),f=a.length*8,a=[],e=1732584193,g=-271733879,d=-1732584194,j=271733878,m=-1009589776;c[f>>5]|=128<<24-f%32;c[(f+64>>>9<<4)+15]=f;for(f=0;f<c.length;f+=16){for(var p=e,q=g,r=d,s=j,t=m,h=0;h<80;h++){if(h<16)a[h]=c[f+h];else{var n=
a[h-3]^a[h-8]^a[h-14]^a[h-16];a[h]=n<<1|n>>>31}n=(e<<5|e>>>27)+m+(a[h]>>>0)+(h<20?(g&d|~g&j)+1518500249:h<40?(g^d^j)+1859775393:h<60?(g&d|g&j|d&j)-1894007588:(g^d^j)-899497514);m=j;j=d;d=g<<30|g>>>2;g=e;e=n}e+=p;g+=q;d+=r;j+=s;m+=t}return[e,g,d,j,m]};a._blocksize=16;a._digestsize=20})();
(function(){var e=Crypto,k=e.util,d=e.charenc,b=d.UTF8,c=d.Binary;e.HMAC=function(a,e,d,f){e.constructor==String&&(e=b.stringToBytes(e));d.constructor==String&&(d=b.stringToBytes(d));d.length>a._blocksize*4&&(d=a(d,{asBytes:!0}));for(var o=d.slice(0),d=d.slice(0),g=0;g<a._blocksize*4;g++)o[g]^=92,d[g]^=54;a=a(o.concat(a(d.concat(e),{asBytes:!0})),{asBytes:!0});return f&&f.asBytes?a:f&&f.asString?c.bytesToString(a):k.bytesToHex(a)}})();

/*
 * ----------------------------- JSTORAGE -------------------------------------
 * Simple local storage wrapper to save data on the browser side, supporting
 * all major browsers - IE6+, Firefox2+, Safari4+, Chrome4+ and Opera 10.5+
 *
 * Copyright (c) 2010 Andris Reinman, andris.reinman@gmail.com
 * Project homepage: www.jstorage.info
 *
 * Licensed under MIT-style license:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * $.jStorage
 *
 * USAGE:
 *
 * jStorage requires Prototype, MooTools or jQuery! If jQuery is used, then
 * jQuery-JSON (http://code.google.com/p/jquery-json/) is also needed.
 * (jQuery-JSON needs to be loaded BEFORE jStorage!)
 *
 * Methods:
 *
 * -set(key, value)
 * $.jStorage.set(key, value) -> saves a value
 *
 * -get(key[, default])
 * value = $.jStorage.get(key [, default]) ->
 *    retrieves value if key exists, or default if it doesn't
 *
 * -deleteKey(key)
 * $.jStorage.deleteKey(key) -> removes a key from the storage
 *
 * -flush()
 * $.jStorage.flush() -> clears the cache
 *
 * -storageObj()
 * $.jStorage.storageObj() -> returns a read-ony copy of the actual storage
 *
 * -storageSize()
 * $.jStorage.storageSize() -> returns the size of the storage in bytes
 *
 * -index()
 * $.jStorage.index() -> returns the used keys as an array
 *
 * -storageAvailable()
 * $.jStorage.storageAvailable() -> returns true if storage is available
 *
 * -reInit()
 * $.jStorage.reInit() -> reloads the data from browser storage
 *
 * <value> can be any JSON-able value, including objects and arrays.
 *
 */

(function($){
	if(!$ || !($.toJSON || Object.toJSON || window.JSON)){
		throw new Error("jQuery, MooTools or Prototype needs to be loaded before jStorage!");
	}

	var
		/* This is the object, that holds the cached values */
		_storage = {},

		/* Actual browser storage (localStorage or globalStorage['domain']) */
		_storage_service = {jStorage:"{}"},

		/* DOM element for older IE versions, holds userData behavior */
		_storage_elm = null,

		/* How much space does the storage take */
		_storage_size = 0,

		/* function to encode objects to JSON strings */
		json_encode = $.toJSON || Object.toJSON || (window.JSON && (JSON.encode || JSON.stringify)),

		/* function to decode objects from JSON strings */
		json_decode = $.evalJSON || (window.JSON && (JSON.decode || JSON.parse)) || function(str){
			return String(str).evalJSON();
		},

		/* which backend is currently used */
		_backend = false,

		/* Next check for TTL */
		_ttl_timeout,

		/**
		 * XML encoding and decoding as XML nodes can't be JSON'ized
		 * XML nodes are encoded and decoded if the node is the value to be saved
		 * but not if it's as a property of another object
		 * Eg. -
		 *   $.jStorage.set("key", xmlNode);        // IS OK
		 *   $.jStorage.set("key", {xml: xmlNode}); // NOT OK
		 */
		_XMLService = {

			/**
			 * Validates a XML node to be XML
			 * based on jQuery.isXML function
			 */
			isXML: function(elm){
				var documentElement = (elm ? elm.ownerDocument || elm : 0).documentElement;
				return documentElement ? documentElement.nodeName !== "HTML" : false;
			},

			/**
			 * Encodes a XML node to string
			 * based on http://www.mercurytide.co.uk/news/article/issues-when-working-ajax/
			 */
			encode: function(xmlNode) {
				if(!this.isXML(xmlNode)){
					return false;
				}
				try{ // Mozilla, Webkit, Opera
					return new XMLSerializer().serializeToString(xmlNode);
				}catch(E1) {
					try {  // IE
						return xmlNode.xml;
					}catch(E2){}
				}
				return false;
			},

			/**
			 * Decodes a XML node from string
			 * loosely based on http://outwestmedia.com/jquery-plugins/xmldom/
			 */
			decode: function(xmlString){
				var dom_parser = ("DOMParser" in window && (new DOMParser()).parseFromString) ||
						(window.ActiveXObject && function(_xmlString) {
					var xml_doc = new ActiveXObject('Microsoft.XMLDOM');
					xml_doc.async = 'false';
					xml_doc.loadXML(_xmlString);
					return xml_doc;
				}),
				resultXML;
				if(!dom_parser){
					return false;
				}
				resultXML = dom_parser.call("DOMParser" in window && (new DOMParser()) || window, xmlString, 'text/xml');
				return this.isXML(resultXML)?resultXML:false;
			}
		};

	////////////////////////// PRIVATE METHODS ////////////////////////

	/**
	 * Initialization function. Detects if the browser supports DOM Storage
	 * or userData behavior and behaves accordingly.
	 * @returns undefined
	 */
	function _init(){
		/* Check if browser supports localStorage */
		var localStorageReallyWorks = false;
		if("localStorage" in window){
			try {
				window.localStorage.setItem('_tmptest', 'tmpval');
				localStorageReallyWorks = true;
				window.localStorage.removeItem('_tmptest');
			} catch(BogusQuotaExceededErrorOnIos5) {
				// Thanks be to iOS5 Private Browsing mode which throws
				// QUOTA_EXCEEDED_ERRROR DOM Exception 22.
			}
		}
		if(localStorageReallyWorks){
			try {
				if(window.localStorage) {
					_storage_service = window.localStorage;
					_backend = "localStorage";
				}
			} catch(E3) {/* Firefox fails when touching localStorage and cookies are disabled */}
		}
		/* Check if browser supports globalStorage */
		else if("globalStorage" in window){
			try {
				if(window.globalStorage) {
					_storage_service = window.globalStorage[window.location.hostname];
					_backend = "globalStorage";
				}
			} catch(E4) {/* Firefox fails when touching localStorage and cookies are disabled */}
		}
		/* Check if browser supports userData behavior */
		else {
			_storage_elm = document.createElement('link');
			if(_storage_elm.addBehavior){

				/* Use a DOM element to act as userData storage */
				_storage_elm.style.behavior = 'url(#default#userData)';

				/* userData element needs to be inserted into the DOM! */
				document.getElementsByTagName('head')[0].appendChild(_storage_elm);

				_storage_elm.load("jStorage");
				var data = "{}";
				try{
					data = _storage_elm.getAttribute("jStorage");
				}catch(E5){}
				_storage_service.jStorage = data;
				_backend = "userDataBehavior";
			}else{
				_storage_elm = null;
				return;
			}
		}

		_load_storage();

		// remove dead keys
		_handleTTL();
	}

	/**
	 * Loads the data from the storage based on the supported mechanism
	 * @returns undefined
	 */
	function _load_storage(){
		/* if jStorage string is retrieved, then decode it */
		if(_storage_service.jStorage){
			try{
				_storage = json_decode(String(_storage_service.jStorage));
			}catch(E6){_storage_service.jStorage = "{}";}
		}else{
			_storage_service.jStorage = "{}";
		}
		_storage_size = _storage_service.jStorage?String(_storage_service.jStorage).length:0;
	}

	/**
	 * This functions provides the "save" mechanism to store the jStorage object
	 * @returns undefined
	 */
	function _save(){
		try{
			_storage_service.jStorage = json_encode(_storage);
			// If userData is used as the storage engine, additional
			if(_storage_elm) {
				_storage_elm.setAttribute("jStorage",_storage_service.jStorage);
				_storage_elm.save("jStorage");
			}
			_storage_size = _storage_service.jStorage?String(_storage_service.jStorage).length:0;
		}catch(E7){/* probably cache is full, nothing is saved this way*/}
	}

	/**
	 * Function checks if a key is set and is string or numberic
	 */
	function _checkKey(key){
		if(!key || (typeof key != "string" && typeof key != "number")){
			throw new TypeError('Key name must be string or numeric');
		}
		if(key == "__jstorage_meta"){
			throw new TypeError('Reserved key name');
		}
		return true;
	}

	/**
	 * Removes expired keys
	 */
	function _handleTTL(){
		var curtime, i, TTL, nextExpire = Infinity, changed = false;

		clearTimeout(_ttl_timeout);

		if(!_storage.__jstorage_meta || typeof _storage.__jstorage_meta.TTL != "object"){
			// nothing to do here
			return;
		}

		curtime = +new Date();
		TTL = _storage.__jstorage_meta.TTL;
		for(i in TTL){
			if(TTL.hasOwnProperty(i)){
				if(TTL[i] <= curtime){
					delete TTL[i];
					delete _storage[i];
					changed = true;
				}else if(TTL[i] < nextExpire){
					nextExpire = TTL[i];
				}
			}
		}

		// set next check
		if(nextExpire != Infinity){
			_ttl_timeout = setTimeout(_handleTTL, nextExpire - curtime);
		}

		// save changes
		if(changed){
			_save();
		}
	}

	////////////////////////// PUBLIC INTERFACE /////////////////////////

	$.jStorage = {
		/* Version number */
		version: "0.1.6.1",

		/**
		 * Sets a key's value.
		 *
		 * @param {String} key - Key to set. If this value is not set or not
		 *              a string an exception is raised.
		 * @param value - Value to set. This can be any value that is JSON
		 *              compatible (Numbers, Strings, Objects etc.).
		 * @returns the used value
		 */
		set: function(key, value){
			_checkKey(key);
			if(_XMLService.isXML(value)){
				value = {_is_xml:true,xml:_XMLService.encode(value)};
			}else if(typeof value == "function"){
				value = null; // functions can't be saved!
			}else if(value && typeof value == "object"){
				// clone the object before saving to _storage tree
				value = json_decode(json_encode(value));
			}
			_storage[key] = value;
			_save();
			return value;
		},

		/**
		 * Looks up a key in cache
		 *
		 * @param {String} key - Key to look up.
		 * @param {mixed} def - Default value to return, if key didn't exist.
		 * @returns the key value, default value or <null>
		 */
		get: function(key, def){
			_checkKey(key);
			if(key in _storage){
				if(_storage[key] && typeof _storage[key] == "object" &&
						_storage[key]._is_xml &&
							_storage[key]._is_xml){
					return _XMLService.decode(_storage[key].xml);
				}else{
					return _storage[key];
				}
			}
			return typeof(def) == 'undefined' ? null : def;
		},

		/**
		 * Deletes a key from cache.
		 *
		 * @param {String} key - Key to delete.
		 * @returns true if key existed or false if it didn't
		 */
		deleteKey: function(key){
			_checkKey(key);
			if(key in _storage){
				delete _storage[key];
				// remove from TTL list
				if(_storage.__jstorage_meta &&
				  typeof _storage.__jstorage_meta.TTL == "object" &&
				  key in _storage.__jstorage_meta.TTL){
					delete _storage.__jstorage_meta.TTL[key];
				}
				_save();
				return true;
			}
			return false;
		},

		/**
		 * Sets a TTL for a key, or remove it if ttl value is 0 or below
		 *
		 * @param {String} key - key to set the TTL for
		 * @param {Number} ttl - TTL timeout in milliseconds
		 * @returns true if key existed or false if it didn't
		 */
		setTTL: function(key, ttl){
			var curtime = +new Date();
			_checkKey(key);
			ttl = Number(ttl) || 0;
			if(key in _storage){

				if(!_storage.__jstorage_meta){
					_storage.__jstorage_meta = {};
				}
				if(!_storage.__jstorage_meta.TTL){
					_storage.__jstorage_meta.TTL = {};
				}

				// Set TTL value for the key
				if(ttl>0){
					_storage.__jstorage_meta.TTL[key] = curtime + ttl;
				}else{
					delete _storage.__jstorage_meta.TTL[key];
				}

				_save();

				_handleTTL();
				return true;
			}
			return false;
		},

		/**
		 * Deletes everything in cache.
		 *
		 * @return true
		 */
		flush: function(){
			_storage = {};
			_save();
			return true;
		},

		/**
		 * Returns a read-only copy of _storage
		 *
		 * @returns Object
		*/
		storageObj: function(){
			function F() {}
			F.prototype = _storage;
			return new F();
		},

		/**
		 * Returns an index of all used keys as an array
		 * ['key1', 'key2',..'keyN']
		 *
		 * @returns Array
		*/
		index: function(){
			var index = [], i;
			for(i in _storage){
				if(_storage.hasOwnProperty(i) && i != "__jstorage_meta"){
					index.push(i);
				}
			}
			return index;
		},

		/**
		 * How much space in bytes does the storage take?
		 *
		 * @returns Number
		 */
		storageSize: function(){
			return _storage_size;
		},

		/**
		 * Which backend is currently in use?
		 *
		 * @returns String
		 */
		currentBackend: function(){
			return _backend;
		},

		/**
		 * Test if storage is available
		 *
		 * @returns Boolean
		 */
		storageAvailable: function(){
			return !!_backend;
		},

		/**
		 * Reloads the data from browser storage
		 *
		 * @returns undefined
		 */
		reInit: function(){
			var new_storage_elm, data;
			if(_storage_elm && _storage_elm.addBehavior){
				new_storage_elm = document.createElement('link');

				_storage_elm.parentNode.replaceChild(new_storage_elm, _storage_elm);
				_storage_elm = new_storage_elm;

				/* Use a DOM element to act as userData storage */
				_storage_elm.style.behavior = 'url(#default#userData)';

				/* userData element needs to be inserted into the DOM! */
				document.getElementsByTagName('head')[0].appendChild(_storage_elm);

				_storage_elm.load("jStorage");
				data = "{}";
				try{
					data = _storage_elm.getAttribute("jStorage");
				}catch(E5){}
				_storage_service.jStorage = data;
				_backend = "userDataBehavior";
			}

			_load_storage();
		}
	};

	// Initialize jStorage
	_init();

})(window.jQuery || window.$);

/*
 * Pulse plugin for jQuery 
 * ---
 * @author James Padolsey (http://james.padolsey.com)
 * @version 0.1
 * @updated 16-DEC-09
 * ---
 * Note: In order to animate color properties, you need
 * the color plugin from here: http://plugins.jquery.com/project/color
 * ---
 * @info http://james.padolsey.com/javascript/simple-pulse-plugin-for-jquery/
 */
jQuery.fn.pulse = function( prop, speed, times, easing, callback ) {
	
	if ( isNaN(times) ) {
		callback = easing;
		easing = times;
		times = 1;
	}
	
	var optall = jQuery.speed(speed, easing, callback),
		queue = optall.queue !== false,
		largest = 0;
		
	for (var p in prop) {
		largest = Math.max(prop[p].length, largest);
	}
	
	optall.times = optall.times || times;
	
	return this[queue?'queue':'each'](function(){
		
		var counts = {},
			opt = jQuery.extend({}, optall),
			self = jQuery(this);
			
		pulse();
		
		function pulse() {
			
			var propsSingle = {},
				doAnimate = false;
			
			for (var p in prop) {
				
				// Make sure counter is setup for current prop
				counts[p] = counts[p] || {runs:0,cur:-1};
				
				// Set "cur" to reflect new position in pulse array
				if ( counts[p].cur < prop[p].length - 1 ) {
					++counts[p].cur;
				} else {
					// Reset to beginning of pulse array
					counts[p].cur = 0;
					++counts[p].runs;
				}
				
				if ( prop[p].length === largest ) {
					doAnimate = opt.times > counts[p].runs;
				}
				
				propsSingle[p] = prop[p][counts[p].cur];
				
			}
			
			opt.complete = pulse;
			opt.queue = false;
			
			if (doAnimate) {
				self.animate(propsSingle, opt);
			} else {
				optall.complete.call(self[0]);
			}
			
		}
			
	});
	
};

/*! jQuery UI - v1.9.2 - 2013-01-10
* http://jqueryui.com
* Includes: jquery.ui.core.js, jquery.ui.effect.js, jquery.ui.effect-bounce.js, jquery.ui.effect-pulsate.js
* Copyright (c) 2013 jQuery Foundation and other contributors Licensed MIT */

(function( $, undefined ) {

var uuid = 0,
	runiqueId = /^ui-id-\d+$/;

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.ui = $.ui || {};
if ( $.ui.version ) {
	return;
}

$.extend( $.ui, {
	version: "1.9.2",

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
});

// plugins
$.fn.extend({
	_focus: $.fn.focus,
	focus: function( delay, fn ) {
		return typeof delay === "number" ?
			this.each(function() {
				var elem = this;
				setTimeout(function() {
					$( elem ).focus();
					if ( fn ) {
						fn.call( elem );
					}
				}, delay );
			}) :
			this._focus.apply( this, arguments );
	},

	scrollParent: function() {
		var scrollParent;
		if (($.ui.ie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.css(this,'position')) && (/(auto|scroll)/).test($.css(this,'overflow')+$.css(this,'overflow-y')+$.css(this,'overflow-x'));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.css(this,'overflow')+$.css(this,'overflow-y')+$.css(this,'overflow-x'));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	uniqueId: function() {
		return this.each(function() {
			if ( !this.id ) {
				this.id = "ui-id-" + (++uuid);
			}
		});
	},

	removeUniqueId: function() {
		return this.each(function() {
			if ( runiqueId.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().andSelf().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support
$(function() {
	var body = document.body,
		div = body.appendChild( div = document.createElement( "div" ) );

	// access offsetHeight before setting the style to prevent a layout bug
	// in IE 9 which causes the element to continue to take up space even
	// after it is removed from the DOM (#8026)
	div.offsetHeight;

	$.extend( div.style, {
		minHeight: "100px",
		height: "auto",
		padding: 0,
		borderWidth: 0
	});

	$.support.minHeight = div.offsetHeight === 100;
	$.support.selectstart = "onselectstart" in div;

	// set display to none to avoid a layout bug in IE
	// http://dev.jquery.com/ticket/4014
	body.removeChild( div ).style.display = "none";
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}





// deprecated

(function() {
	var uaMatch = /msie ([\w.]+)/.exec( navigator.userAgent.toLowerCase() ) || [];
	$.ui.ie = uaMatch.length ? true : false;
	$.ui.ie6 = parseFloat( uaMatch[ 1 ], 10 ) === 6;
})();

$.fn.extend({
	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

$.extend( $.ui, {
	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function( module, option, set ) {
			var i,
				proto = $.ui[ module ].prototype;
			for ( i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var i,
				set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) {
				return;
			}

			for ( i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},

	contains: $.contains,

	// only used by resizable
	hasScroll: function( el, a ) {

		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}

		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;

		if ( el[ scroll ] > 0 ) {
			return true;
		}

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},

	// these are odd functions, fix the API or move into individual plugins
	isOverAxis: function( x, reference, size ) {
		//Determines when x coordinate is over "b" element axis
		return ( x > reference ) && ( x < ( reference + size ) );
	},
	isOver: function( y, x, top, left, height, width ) {
		//Determines when x, y coordinates is over "b" element
		return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
	}
});

})( jQuery );
;(jQuery.effects || (function($, undefined) {

var backCompat = $.uiBackCompat !== false,
	// prefix used for storing data on .data()
	dataSpace = "ui-effects-";

$.effects = {
	effect: {}
};

/*!
 * jQuery Color Animations v2.0.0
 * http://jquery.com/
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Date: Mon Aug 13 13:41:02 2012 -0500
 */
(function( jQuery, undefined ) {

	var stepHooks = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor".split(" "),

	// plusequals test for += 100 -= 100
	rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
	// a set of RE's that can match strings and generate color tuples.
	stringParsers = [{
			re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
			parse: function( execResult ) {
				return [
					execResult[ 1 ],
					execResult[ 2 ],
					execResult[ 3 ],
					execResult[ 4 ]
				];
			}
		}, {
			re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
			parse: function( execResult ) {
				return [
					execResult[ 1 ] * 2.55,
					execResult[ 2 ] * 2.55,
					execResult[ 3 ] * 2.55,
					execResult[ 4 ]
				];
			}
		}, {
			// this regex ignores A-F because it's compared against an already lowercased string
			re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
			parse: function( execResult ) {
				return [
					parseInt( execResult[ 1 ], 16 ),
					parseInt( execResult[ 2 ], 16 ),
					parseInt( execResult[ 3 ], 16 )
				];
			}
		}, {
			// this regex ignores A-F because it's compared against an already lowercased string
			re: /#([a-f0-9])([a-f0-9])([a-f0-9])/,
			parse: function( execResult ) {
				return [
					parseInt( execResult[ 1 ] + execResult[ 1 ], 16 ),
					parseInt( execResult[ 2 ] + execResult[ 2 ], 16 ),
					parseInt( execResult[ 3 ] + execResult[ 3 ], 16 )
				];
			}
		}, {
			re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
			space: "hsla",
			parse: function( execResult ) {
				return [
					execResult[ 1 ],
					execResult[ 2 ] / 100,
					execResult[ 3 ] / 100,
					execResult[ 4 ]
				];
			}
		}],

	// jQuery.Color( )
	color = jQuery.Color = function( color, green, blue, alpha ) {
		return new jQuery.Color.fn.parse( color, green, blue, alpha );
	},
	spaces = {
		rgba: {
			props: {
				red: {
					idx: 0,
					type: "byte"
				},
				green: {
					idx: 1,
					type: "byte"
				},
				blue: {
					idx: 2,
					type: "byte"
				}
			}
		},

		hsla: {
			props: {
				hue: {
					idx: 0,
					type: "degrees"
				},
				saturation: {
					idx: 1,
					type: "percent"
				},
				lightness: {
					idx: 2,
					type: "percent"
				}
			}
		}
	},
	propTypes = {
		"byte": {
			floor: true,
			max: 255
		},
		"percent": {
			max: 1
		},
		"degrees": {
			mod: 360,
			floor: true
		}
	},
	support = color.support = {},

	// element for support tests
	supportElem = jQuery( "<p>" )[ 0 ],

	// colors = jQuery.Color.names
	colors,

	// local aliases of functions called often
	each = jQuery.each;

// determine rgba support immediately
supportElem.style.cssText = "background-color:rgba(1,1,1,.5)";
support.rgba = supportElem.style.backgroundColor.indexOf( "rgba" ) > -1;

// define cache name and alpha properties
// for rgba and hsla spaces
each( spaces, function( spaceName, space ) {
	space.cache = "_" + spaceName;
	space.props.alpha = {
		idx: 3,
		type: "percent",
		def: 1
	};
});

function clamp( value, prop, allowEmpty ) {
	var type = propTypes[ prop.type ] || {};

	if ( value == null ) {
		return (allowEmpty || !prop.def) ? null : prop.def;
	}

	// ~~ is an short way of doing floor for positive numbers
	value = type.floor ? ~~value : parseFloat( value );

	// IE will pass in empty strings as value for alpha,
	// which will hit this case
	if ( isNaN( value ) ) {
		return prop.def;
	}

	if ( type.mod ) {
		// we add mod before modding to make sure that negatives values
		// get converted properly: -10 -> 350
		return (value + type.mod) % type.mod;
	}

	// for now all property types without mod have min and max
	return 0 > value ? 0 : type.max < value ? type.max : value;
}

function stringParse( string ) {
	var inst = color(),
		rgba = inst._rgba = [];

	string = string.toLowerCase();

	each( stringParsers, function( i, parser ) {
		var parsed,
			match = parser.re.exec( string ),
			values = match && parser.parse( match ),
			spaceName = parser.space || "rgba";

		if ( values ) {
			parsed = inst[ spaceName ]( values );

			// if this was an rgba parse the assignment might happen twice
			// oh well....
			inst[ spaces[ spaceName ].cache ] = parsed[ spaces[ spaceName ].cache ];
			rgba = inst._rgba = parsed._rgba;

			// exit each( stringParsers ) here because we matched
			return false;
		}
	});

	// Found a stringParser that handled it
	if ( rgba.length ) {

		// if this came from a parsed string, force "transparent" when alpha is 0
		// chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
		if ( rgba.join() === "0,0,0,0" ) {
			jQuery.extend( rgba, colors.transparent );
		}
		return inst;
	}

	// named colors
	return colors[ string ];
}

color.fn = jQuery.extend( color.prototype, {
	parse: function( red, green, blue, alpha ) {
		if ( red === undefined ) {
			this._rgba = [ null, null, null, null ];
			return this;
		}
		if ( red.jquery || red.nodeType ) {
			red = jQuery( red ).css( green );
			green = undefined;
		}

		var inst = this,
			type = jQuery.type( red ),
			rgba = this._rgba = [];

		// more than 1 argument specified - assume ( red, green, blue, alpha )
		if ( green !== undefined ) {
			red = [ red, green, blue, alpha ];
			type = "array";
		}

		if ( type === "string" ) {
			return this.parse( stringParse( red ) || colors._default );
		}

		if ( type === "array" ) {
			each( spaces.rgba.props, function( key, prop ) {
				rgba[ prop.idx ] = clamp( red[ prop.idx ], prop );
			});
			return this;
		}

		if ( type === "object" ) {
			if ( red instanceof color ) {
				each( spaces, function( spaceName, space ) {
					if ( red[ space.cache ] ) {
						inst[ space.cache ] = red[ space.cache ].slice();
					}
				});
			} else {
				each( spaces, function( spaceName, space ) {
					var cache = space.cache;
					each( space.props, function( key, prop ) {

						// if the cache doesn't exist, and we know how to convert
						if ( !inst[ cache ] && space.to ) {

							// if the value was null, we don't need to copy it
							// if the key was alpha, we don't need to copy it either
							if ( key === "alpha" || red[ key ] == null ) {
								return;
							}
							inst[ cache ] = space.to( inst._rgba );
						}

						// this is the only case where we allow nulls for ALL properties.
						// call clamp with alwaysAllowEmpty
						inst[ cache ][ prop.idx ] = clamp( red[ key ], prop, true );
					});

					// everything defined but alpha?
					if ( inst[ cache ] && $.inArray( null, inst[ cache ].slice( 0, 3 ) ) < 0 ) {
						// use the default of 1
						inst[ cache ][ 3 ] = 1;
						if ( space.from ) {
							inst._rgba = space.from( inst[ cache ] );
						}
					}
				});
			}
			return this;
		}
	},
	is: function( compare ) {
		var is = color( compare ),
			same = true,
			inst = this;

		each( spaces, function( _, space ) {
			var localCache,
				isCache = is[ space.cache ];
			if (isCache) {
				localCache = inst[ space.cache ] || space.to && space.to( inst._rgba ) || [];
				each( space.props, function( _, prop ) {
					if ( isCache[ prop.idx ] != null ) {
						same = ( isCache[ prop.idx ] === localCache[ prop.idx ] );
						return same;
					}
				});
			}
			return same;
		});
		return same;
	},
	_space: function() {
		var used = [],
			inst = this;
		each( spaces, function( spaceName, space ) {
			if ( inst[ space.cache ] ) {
				used.push( spaceName );
			}
		});
		return used.pop();
	},
	transition: function( other, distance ) {
		var end = color( other ),
			spaceName = end._space(),
			space = spaces[ spaceName ],
			startColor = this.alpha() === 0 ? color( "transparent" ) : this,
			start = startColor[ space.cache ] || space.to( startColor._rgba ),
			result = start.slice();

		end = end[ space.cache ];
		each( space.props, function( key, prop ) {
			var index = prop.idx,
				startValue = start[ index ],
				endValue = end[ index ],
				type = propTypes[ prop.type ] || {};

			// if null, don't override start value
			if ( endValue === null ) {
				return;
			}
			// if null - use end
			if ( startValue === null ) {
				result[ index ] = endValue;
			} else {
				if ( type.mod ) {
					if ( endValue - startValue > type.mod / 2 ) {
						startValue += type.mod;
					} else if ( startValue - endValue > type.mod / 2 ) {
						startValue -= type.mod;
					}
				}
				result[ index ] = clamp( ( endValue - startValue ) * distance + startValue, prop );
			}
		});
		return this[ spaceName ]( result );
	},
	blend: function( opaque ) {
		// if we are already opaque - return ourself
		if ( this._rgba[ 3 ] === 1 ) {
			return this;
		}

		var rgb = this._rgba.slice(),
			a = rgb.pop(),
			blend = color( opaque )._rgba;

		return color( jQuery.map( rgb, function( v, i ) {
			return ( 1 - a ) * blend[ i ] + a * v;
		}));
	},
	toRgbaString: function() {
		var prefix = "rgba(",
			rgba = jQuery.map( this._rgba, function( v, i ) {
				return v == null ? ( i > 2 ? 1 : 0 ) : v;
			});

		if ( rgba[ 3 ] === 1 ) {
			rgba.pop();
			prefix = "rgb(";
		}

		return prefix + rgba.join() + ")";
	},
	toHslaString: function() {
		var prefix = "hsla(",
			hsla = jQuery.map( this.hsla(), function( v, i ) {
				if ( v == null ) {
					v = i > 2 ? 1 : 0;
				}

				// catch 1 and 2
				if ( i && i < 3 ) {
					v = Math.round( v * 100 ) + "%";
				}
				return v;
			});

		if ( hsla[ 3 ] === 1 ) {
			hsla.pop();
			prefix = "hsl(";
		}
		return prefix + hsla.join() + ")";
	},
	toHexString: function( includeAlpha ) {
		var rgba = this._rgba.slice(),
			alpha = rgba.pop();

		if ( includeAlpha ) {
			rgba.push( ~~( alpha * 255 ) );
		}

		return "#" + jQuery.map( rgba, function( v ) {

			// default to 0 when nulls exist
			v = ( v || 0 ).toString( 16 );
			return v.length === 1 ? "0" + v : v;
		}).join("");
	},
	toString: function() {
		return this._rgba[ 3 ] === 0 ? "transparent" : this.toRgbaString();
	}
});
color.fn.parse.prototype = color.fn;

// hsla conversions adapted from:
// https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021

function hue2rgb( p, q, h ) {
	h = ( h + 1 ) % 1;
	if ( h * 6 < 1 ) {
		return p + (q - p) * h * 6;
	}
	if ( h * 2 < 1) {
		return q;
	}
	if ( h * 3 < 2 ) {
		return p + (q - p) * ((2/3) - h) * 6;
	}
	return p;
}

spaces.hsla.to = function ( rgba ) {
	if ( rgba[ 0 ] == null || rgba[ 1 ] == null || rgba[ 2 ] == null ) {
		return [ null, null, null, rgba[ 3 ] ];
	}
	var r = rgba[ 0 ] / 255,
		g = rgba[ 1 ] / 255,
		b = rgba[ 2 ] / 255,
		a = rgba[ 3 ],
		max = Math.max( r, g, b ),
		min = Math.min( r, g, b ),
		diff = max - min,
		add = max + min,
		l = add * 0.5,
		h, s;

	if ( min === max ) {
		h = 0;
	} else if ( r === max ) {
		h = ( 60 * ( g - b ) / diff ) + 360;
	} else if ( g === max ) {
		h = ( 60 * ( b - r ) / diff ) + 120;
	} else {
		h = ( 60 * ( r - g ) / diff ) + 240;
	}

	if ( l === 0 || l === 1 ) {
		s = l;
	} else if ( l <= 0.5 ) {
		s = diff / add;
	} else {
		s = diff / ( 2 - add );
	}
	return [ Math.round(h) % 360, s, l, a == null ? 1 : a ];
};

spaces.hsla.from = function ( hsla ) {
	if ( hsla[ 0 ] == null || hsla[ 1 ] == null || hsla[ 2 ] == null ) {
		return [ null, null, null, hsla[ 3 ] ];
	}
	var h = hsla[ 0 ] / 360,
		s = hsla[ 1 ],
		l = hsla[ 2 ],
		a = hsla[ 3 ],
		q = l <= 0.5 ? l * ( 1 + s ) : l + s - l * s,
		p = 2 * l - q;

	return [
		Math.round( hue2rgb( p, q, h + ( 1 / 3 ) ) * 255 ),
		Math.round( hue2rgb( p, q, h ) * 255 ),
		Math.round( hue2rgb( p, q, h - ( 1 / 3 ) ) * 255 ),
		a
	];
};


each( spaces, function( spaceName, space ) {
	var props = space.props,
		cache = space.cache,
		to = space.to,
		from = space.from;

	// makes rgba() and hsla()
	color.fn[ spaceName ] = function( value ) {

		// generate a cache for this space if it doesn't exist
		if ( to && !this[ cache ] ) {
			this[ cache ] = to( this._rgba );
		}
		if ( value === undefined ) {
			return this[ cache ].slice();
		}

		var ret,
			type = jQuery.type( value ),
			arr = ( type === "array" || type === "object" ) ? value : arguments,
			local = this[ cache ].slice();

		each( props, function( key, prop ) {
			var val = arr[ type === "object" ? key : prop.idx ];
			if ( val == null ) {
				val = local[ prop.idx ];
			}
			local[ prop.idx ] = clamp( val, prop );
		});

		if ( from ) {
			ret = color( from( local ) );
			ret[ cache ] = local;
			return ret;
		} else {
			return color( local );
		}
	};

	// makes red() green() blue() alpha() hue() saturation() lightness()
	each( props, function( key, prop ) {
		// alpha is included in more than one space
		if ( color.fn[ key ] ) {
			return;
		}
		color.fn[ key ] = function( value ) {
			var vtype = jQuery.type( value ),
				fn = ( key === "alpha" ? ( this._hsla ? "hsla" : "rgba" ) : spaceName ),
				local = this[ fn ](),
				cur = local[ prop.idx ],
				match;

			if ( vtype === "undefined" ) {
				return cur;
			}

			if ( vtype === "function" ) {
				value = value.call( this, cur );
				vtype = jQuery.type( value );
			}
			if ( value == null && prop.empty ) {
				return this;
			}
			if ( vtype === "string" ) {
				match = rplusequals.exec( value );
				if ( match ) {
					value = cur + parseFloat( match[ 2 ] ) * ( match[ 1 ] === "+" ? 1 : -1 );
				}
			}
			local[ prop.idx ] = value;
			return this[ fn ]( local );
		};
	});
});

// add .fx.step functions
each( stepHooks, function( i, hook ) {
	jQuery.cssHooks[ hook ] = {
		set: function( elem, value ) {
			var parsed, curElem,
				backgroundColor = "";

			if ( jQuery.type( value ) !== "string" || ( parsed = stringParse( value ) ) ) {
				value = color( parsed || value );
				if ( !support.rgba && value._rgba[ 3 ] !== 1 ) {
					curElem = hook === "backgroundColor" ? elem.parentNode : elem;
					while (
						(backgroundColor === "" || backgroundColor === "transparent") &&
						curElem && curElem.style
					) {
						try {
							backgroundColor = jQuery.css( curElem, "backgroundColor" );
							curElem = curElem.parentNode;
						} catch ( e ) {
						}
					}

					value = value.blend( backgroundColor && backgroundColor !== "transparent" ?
						backgroundColor :
						"_default" );
				}

				value = value.toRgbaString();
			}
			try {
				elem.style[ hook ] = value;
			} catch( error ) {
				// wrapped to prevent IE from throwing errors on "invalid" values like 'auto' or 'inherit'
			}
		}
	};
	jQuery.fx.step[ hook ] = function( fx ) {
		if ( !fx.colorInit ) {
			fx.start = color( fx.elem, hook );
			fx.end = color( fx.end );
			fx.colorInit = true;
		}
		jQuery.cssHooks[ hook ].set( fx.elem, fx.start.transition( fx.end, fx.pos ) );
	};
});

jQuery.cssHooks.borderColor = {
	expand: function( value ) {
		var expanded = {};

		each( [ "Top", "Right", "Bottom", "Left" ], function( i, part ) {
			expanded[ "border" + part + "Color" ] = value;
		});
		return expanded;
	}
};

// Basic color names only.
// Usage of any of the other color names requires adding yourself or including
// jquery.color.svg-names.js.
colors = jQuery.Color.names = {
	// 4.1. Basic color keywords
	aqua: "#00ffff",
	black: "#000000",
	blue: "#0000ff",
	fuchsia: "#ff00ff",
	gray: "#808080",
	green: "#008000",
	lime: "#00ff00",
	maroon: "#800000",
	navy: "#000080",
	olive: "#808000",
	purple: "#800080",
	red: "#ff0000",
	silver: "#c0c0c0",
	teal: "#008080",
	white: "#ffffff",
	yellow: "#ffff00",

	// 4.2.3. "transparent" color keyword
	transparent: [ null, null, null, 0 ],

	_default: "#ffffff"
};

})( jQuery );



/******************************************************************************/
/****************************** CLASS ANIMATIONS ******************************/
/******************************************************************************/
(function() {

var classAnimationActions = [ "add", "remove", "toggle" ],
	shorthandStyles = {
		border: 1,
		borderBottom: 1,
		borderColor: 1,
		borderLeft: 1,
		borderRight: 1,
		borderTop: 1,
		borderWidth: 1,
		margin: 1,
		padding: 1
	};

$.each([ "borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle" ], function( _, prop ) {
	$.fx.step[ prop ] = function( fx ) {
		if ( fx.end !== "none" && !fx.setAttr || fx.pos === 1 && !fx.setAttr ) {
			jQuery.style( fx.elem, prop, fx.end );
			fx.setAttr = true;
		}
	};
});

function getElementStyles() {
	var style = this.ownerDocument.defaultView ?
			this.ownerDocument.defaultView.getComputedStyle( this, null ) :
			this.currentStyle,
		newStyle = {},
		key,
		len;

	// webkit enumerates style porperties
	if ( style && style.length && style[ 0 ] && style[ style[ 0 ] ] ) {
		len = style.length;
		while ( len-- ) {
			key = style[ len ];
			if ( typeof style[ key ] === "string" ) {
				newStyle[ $.camelCase( key ) ] = style[ key ];
			}
		}
	} else {
		for ( key in style ) {
			if ( typeof style[ key ] === "string" ) {
				newStyle[ key ] = style[ key ];
			}
		}
	}

	return newStyle;
}


function styleDifference( oldStyle, newStyle ) {
	var diff = {},
		name, value;

	for ( name in newStyle ) {
		value = newStyle[ name ];
		if ( oldStyle[ name ] !== value ) {
			if ( !shorthandStyles[ name ] ) {
				if ( $.fx.step[ name ] || !isNaN( parseFloat( value ) ) ) {
					diff[ name ] = value;
				}
			}
		}
	}

	return diff;
}

$.effects.animateClass = function( value, duration, easing, callback ) {
	var o = $.speed( duration, easing, callback );

	return this.queue( function() {
		var animated = $( this ),
			baseClass = animated.attr( "class" ) || "",
			applyClassChange,
			allAnimations = o.children ? animated.find( "*" ).andSelf() : animated;

		// map the animated objects to store the original styles.
		allAnimations = allAnimations.map(function() {
			var el = $( this );
			return {
				el: el,
				start: getElementStyles.call( this )
			};
		});

		// apply class change
		applyClassChange = function() {
			$.each( classAnimationActions, function(i, action) {
				if ( value[ action ] ) {
					animated[ action + "Class" ]( value[ action ] );
				}
			});
		};
		applyClassChange();

		// map all animated objects again - calculate new styles and diff
		allAnimations = allAnimations.map(function() {
			this.end = getElementStyles.call( this.el[ 0 ] );
			this.diff = styleDifference( this.start, this.end );
			return this;
		});

		// apply original class
		animated.attr( "class", baseClass );

		// map all animated objects again - this time collecting a promise
		allAnimations = allAnimations.map(function() {
			var styleInfo = this,
				dfd = $.Deferred(),
				opts = jQuery.extend({}, o, {
					queue: false,
					complete: function() {
						dfd.resolve( styleInfo );
					}
				});

			this.el.animate( this.diff, opts );
			return dfd.promise();
		});

		// once all animations have completed:
		$.when.apply( $, allAnimations.get() ).done(function() {

			// set the final class
			applyClassChange();

			// for each animated element,
			// clear all css properties that were animated
			$.each( arguments, function() {
				var el = this.el;
				$.each( this.diff, function(key) {
					el.css( key, '' );
				});
			});

			// this is guarnteed to be there if you use jQuery.speed()
			// it also handles dequeuing the next anim...
			o.complete.call( animated[ 0 ] );
		});
	});
};

$.fn.extend({
	_addClass: $.fn.addClass,
	addClass: function( classNames, speed, easing, callback ) {
		return speed ?
			$.effects.animateClass.call( this,
				{ add: classNames }, speed, easing, callback ) :
			this._addClass( classNames );
	},

	_removeClass: $.fn.removeClass,
	removeClass: function( classNames, speed, easing, callback ) {
		return speed ?
			$.effects.animateClass.call( this,
				{ remove: classNames }, speed, easing, callback ) :
			this._removeClass( classNames );
	},

	_toggleClass: $.fn.toggleClass,
	toggleClass: function( classNames, force, speed, easing, callback ) {
		if ( typeof force === "boolean" || force === undefined ) {
			if ( !speed ) {
				// without speed parameter
				return this._toggleClass( classNames, force );
			} else {
				return $.effects.animateClass.call( this,
					(force ? { add: classNames } : { remove: classNames }),
					speed, easing, callback );
			}
		} else {
			// without force parameter
			return $.effects.animateClass.call( this,
				{ toggle: classNames }, force, speed, easing );
		}
	},

	switchClass: function( remove, add, speed, easing, callback) {
		return $.effects.animateClass.call( this, {
			add: add,
			remove: remove
		}, speed, easing, callback );
	}
});

})();

/******************************************************************************/
/*********************************** EFFECTS **********************************/
/******************************************************************************/

(function() {

$.extend( $.effects, {
	version: "1.9.2",

	// Saves a set of properties in a data storage
	save: function( element, set ) {
		for( var i=0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				element.data( dataSpace + set[ i ], element[ 0 ].style[ set[ i ] ] );
			}
		}
	},

	// Restores a set of previously saved properties from a data storage
	restore: function( element, set ) {
		var val, i;
		for( i=0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				val = element.data( dataSpace + set[ i ] );
				// support: jQuery 1.6.2
				// http://bugs.jquery.com/ticket/9917
				// jQuery 1.6.2 incorrectly returns undefined for any falsy value.
				// We can't differentiate between "" and 0 here, so we just assume
				// empty string since it's likely to be a more common value...
				if ( val === undefined ) {
					val = "";
				}
				element.css( set[ i ], val );
			}
		}
	},

	setMode: function( el, mode ) {
		if (mode === "toggle") {
			mode = el.is( ":hidden" ) ? "show" : "hide";
		}
		return mode;
	},

	// Translates a [top,left] array into a baseline value
	// this should be a little more flexible in the future to handle a string & hash
	getBaseline: function( origin, original ) {
		var y, x;
		switch ( origin[ 0 ] ) {
			case "top": y = 0; break;
			case "middle": y = 0.5; break;
			case "bottom": y = 1; break;
			default: y = origin[ 0 ] / original.height;
		}
		switch ( origin[ 1 ] ) {
			case "left": x = 0; break;
			case "center": x = 0.5; break;
			case "right": x = 1; break;
			default: x = origin[ 1 ] / original.width;
		}
		return {
			x: x,
			y: y
		};
	},

	// Wraps the element around a wrapper that copies position properties
	createWrapper: function( element ) {

		// if the element is already wrapped, return it
		if ( element.parent().is( ".ui-effects-wrapper" )) {
			return element.parent();
		}

		// wrap the element
		var props = {
				width: element.outerWidth(true),
				height: element.outerHeight(true),
				"float": element.css( "float" )
			},
			wrapper = $( "<div></div>" )
				.addClass( "ui-effects-wrapper" )
				.css({
					fontSize: "100%",
					background: "transparent",
					border: "none",
					margin: 0,
					padding: 0
				}),
			// Store the size in case width/height are defined in % - Fixes #5245
			size = {
				width: element.width(),
				height: element.height()
			},
			active = document.activeElement;

		// support: Firefox
		// Firefox incorrectly exposes anonymous content
		// https://bugzilla.mozilla.org/show_bug.cgi?id=561664
		try {
			active.id;
		} catch( e ) {
			active = document.body;
		}

		element.wrap( wrapper );

		// Fixes #7595 - Elements lose focus when wrapped.
		if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
			$( active ).focus();
		}

		wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually lose the reference to the wrapped element

		// transfer positioning properties to the wrapper
		if ( element.css( "position" ) === "static" ) {
			wrapper.css({ position: "relative" });
			element.css({ position: "relative" });
		} else {
			$.extend( props, {
				position: element.css( "position" ),
				zIndex: element.css( "z-index" )
			});
			$.each([ "top", "left", "bottom", "right" ], function(i, pos) {
				props[ pos ] = element.css( pos );
				if ( isNaN( parseInt( props[ pos ], 10 ) ) ) {
					props[ pos ] = "auto";
				}
			});
			element.css({
				position: "relative",
				top: 0,
				left: 0,
				right: "auto",
				bottom: "auto"
			});
		}
		element.css(size);

		return wrapper.css( props ).show();
	},

	removeWrapper: function( element ) {
		var active = document.activeElement;

		if ( element.parent().is( ".ui-effects-wrapper" ) ) {
			element.parent().replaceWith( element );

			// Fixes #7595 - Elements lose focus when wrapped.
			if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
				$( active ).focus();
			}
		}


		return element;
	},

	setTransition: function( element, list, factor, value ) {
		value = value || {};
		$.each( list, function( i, x ) {
			var unit = element.cssUnit( x );
			if ( unit[ 0 ] > 0 ) {
				value[ x ] = unit[ 0 ] * factor + unit[ 1 ];
			}
		});
		return value;
	}
});

// return an effect options object for the given parameters:
function _normalizeArguments( effect, options, speed, callback ) {

	// allow passing all options as the first parameter
	if ( $.isPlainObject( effect ) ) {
		options = effect;
		effect = effect.effect;
	}

	// convert to an object
	effect = { effect: effect };

	// catch (effect, null, ...)
	if ( options == null ) {
		options = {};
	}

	// catch (effect, callback)
	if ( $.isFunction( options ) ) {
		callback = options;
		speed = null;
		options = {};
	}

	// catch (effect, speed, ?)
	if ( typeof options === "number" || $.fx.speeds[ options ] ) {
		callback = speed;
		speed = options;
		options = {};
	}

	// catch (effect, options, callback)
	if ( $.isFunction( speed ) ) {
		callback = speed;
		speed = null;
	}

	// add options to effect
	if ( options ) {
		$.extend( effect, options );
	}

	speed = speed || options.duration;
	effect.duration = $.fx.off ? 0 :
		typeof speed === "number" ? speed :
		speed in $.fx.speeds ? $.fx.speeds[ speed ] :
		$.fx.speeds._default;

	effect.complete = callback || options.complete;

	return effect;
}

function standardSpeed( speed ) {
	// valid standard speeds
	if ( !speed || typeof speed === "number" || $.fx.speeds[ speed ] ) {
		return true;
	}

	// invalid strings - treat as "normal" speed
	if ( typeof speed === "string" && !$.effects.effect[ speed ] ) {
		// TODO: remove in 2.0 (#7115)
		if ( backCompat && $.effects[ speed ] ) {
			return false;
		}
		return true;
	}

	return false;
}

$.fn.extend({
	effect: function( /* effect, options, speed, callback */ ) {
		var args = _normalizeArguments.apply( this, arguments ),
			mode = args.mode,
			queue = args.queue,
			effectMethod = $.effects.effect[ args.effect ],

			// DEPRECATED: remove in 2.0 (#7115)
			oldEffectMethod = !effectMethod && backCompat && $.effects[ args.effect ];

		if ( $.fx.off || !( effectMethod || oldEffectMethod ) ) {
			// delegate to the original method (e.g., .show()) if possible
			if ( mode ) {
				return this[ mode ]( args.duration, args.complete );
			} else {
				return this.each( function() {
					if ( args.complete ) {
						args.complete.call( this );
					}
				});
			}
		}

		function run( next ) {
			var elem = $( this ),
				complete = args.complete,
				mode = args.mode;

			function done() {
				if ( $.isFunction( complete ) ) {
					complete.call( elem[0] );
				}
				if ( $.isFunction( next ) ) {
					next();
				}
			}

			// if the element is hiddden and mode is hide,
			// or element is visible and mode is show
			if ( elem.is( ":hidden" ) ? mode === "hide" : mode === "show" ) {
				done();
			} else {
				effectMethod.call( elem[0], args, done );
			}
		}

		// TODO: remove this check in 2.0, effectMethod will always be true
		if ( effectMethod ) {
			return queue === false ? this.each( run ) : this.queue( queue || "fx", run );
		} else {
			// DEPRECATED: remove in 2.0 (#7115)
			return oldEffectMethod.call(this, {
				options: args,
				duration: args.duration,
				callback: args.complete,
				mode: args.mode
			});
		}
	},

	_show: $.fn.show,
	show: function( speed ) {
		if ( standardSpeed( speed ) ) {
			return this._show.apply( this, arguments );
		} else {
			var args = _normalizeArguments.apply( this, arguments );
			args.mode = "show";
			return this.effect.call( this, args );
		}
	},

	_hide: $.fn.hide,
	hide: function( speed ) {
		if ( standardSpeed( speed ) ) {
			return this._hide.apply( this, arguments );
		} else {
			var args = _normalizeArguments.apply( this, arguments );
			args.mode = "hide";
			return this.effect.call( this, args );
		}
	},

	// jQuery core overloads toggle and creates _toggle
	__toggle: $.fn.toggle,
	toggle: function( speed ) {
		if ( standardSpeed( speed ) || typeof speed === "boolean" || $.isFunction( speed ) ) {
			return this.__toggle.apply( this, arguments );
		} else {
			var args = _normalizeArguments.apply( this, arguments );
			args.mode = "toggle";
			return this.effect.call( this, args );
		}
	},

	// helper functions
	cssUnit: function(key) {
		var style = this.css( key ),
			val = [];

		$.each( [ "em", "px", "%", "pt" ], function( i, unit ) {
			if ( style.indexOf( unit ) > 0 ) {
				val = [ parseFloat( style ), unit ];
			}
		});
		return val;
	}
});

})();

/******************************************************************************/
/*********************************** EASING ***********************************/
/******************************************************************************/

(function() {

// based on easing equations from Robert Penner (http://www.robertpenner.com/easing)

var baseEasings = {};

$.each( [ "Quad", "Cubic", "Quart", "Quint", "Expo" ], function( i, name ) {
	baseEasings[ name ] = function( p ) {
		return Math.pow( p, i + 2 );
	};
});

$.extend( baseEasings, {
	Sine: function ( p ) {
		return 1 - Math.cos( p * Math.PI / 2 );
	},
	Circ: function ( p ) {
		return 1 - Math.sqrt( 1 - p * p );
	},
	Elastic: function( p ) {
		return p === 0 || p === 1 ? p :
			-Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
	},
	Back: function( p ) {
		return p * p * ( 3 * p - 2 );
	},
	Bounce: function ( p ) {
		var pow2,
			bounce = 4;

		while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
		return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
	}
});

$.each( baseEasings, function( name, easeIn ) {
	$.easing[ "easeIn" + name ] = easeIn;
	$.easing[ "easeOut" + name ] = function( p ) {
		return 1 - easeIn( 1 - p );
	};
	$.easing[ "easeInOut" + name ] = function( p ) {
		return p < 0.5 ?
			easeIn( p * 2 ) / 2 :
			1 - easeIn( p * -2 + 2 ) / 2;
	};
});

})();

})(jQuery));
(function( $, undefined ) {

if ($.effects.effect !== undefined) {
	$.effects.effect.bounce = function( o, done ) {
		var el = $( this ),
			props = [ "position", "top", "bottom", "left", "right", "height", "width" ],

			// defaults:
			mode = $.effects.setMode( el, o.mode || "effect" ),
			hide = mode === "hide",
			show = mode === "show",
			direction = o.direction || "up",
			distance = o.distance,
			times = o.times || 5,

			// number of internal animations
			anims = times * 2 + ( show || hide ? 1 : 0 ),
			speed = o.duration / anims,
			easing = o.easing,

			// utility:
			ref = ( direction === "up" || direction === "down" ) ? "top" : "left",
			motion = ( direction === "up" || direction === "left" ),
			i,
			upAnim,
			downAnim,

			// we will need to re-assemble the queue to stack our animations in place
			queue = el.queue(),
			queuelen = queue.length;

		// Avoid touching opacity to prevent clearType and PNG issues in IE
		if ( show || hide ) {
			props.push( "opacity" );
		}

		$.effects.save( el, props );
		el.show();
		$.effects.createWrapper( el ); // Create Wrapper

		// default distance for the BIGGEST bounce is the outer Distance / 3
		if ( !distance ) {
			distance = el[ ref === "top" ? "outerHeight" : "outerWidth" ]() / 3;
		}

		if ( show ) {
			downAnim = { opacity: 1 };
			downAnim[ ref ] = 0;

			// if we are showing, force opacity 0 and set the initial position
			// then do the "first" animation
			el.css( "opacity", 0 )
				.css( ref, motion ? -distance * 2 : distance * 2 )
				.animate( downAnim, speed, easing );
		}

		// start at the smallest distance if we are hiding
		if ( hide ) {
			distance = distance / Math.pow( 2, times - 1 );
		}

		downAnim = {};
		downAnim[ ref ] = 0;
		// Bounces up/down/left/right then back to 0 -- times * 2 animations happen here
		for ( i = 0; i < times; i++ ) {
			upAnim = {};
			upAnim[ ref ] = ( motion ? "-=" : "+=" ) + distance;

			el.animate( upAnim, speed, easing )
				.animate( downAnim, speed, easing );

			distance = hide ? distance * 2 : distance / 2;
		}

		// Last Bounce when Hiding
		if ( hide ) {
			upAnim = { opacity: 0 };
			upAnim[ ref ] = ( motion ? "-=" : "+=" ) + distance;

			el.animate( upAnim, speed, easing );
		}

		el.queue(function() {
			if ( hide ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		});

		// inject all the animations we just queued to be first in line (after "inprogress")
		if ( queuelen > 1) {
			queue.splice.apply( queue,
				[ 1, 0 ].concat( queue.splice( queuelen, anims + 1 ) ) );
		}
		el.dequeue();

	};
}

})(jQuery);
(function( $, undefined ) {

if ($.effects.effect !== undefined) {
	$.effects.effect.pulsate = function( o, done ) {
		var elem = $( this ),
			mode = $.effects.setMode( elem, o.mode || "show" ),
			show = mode === "show",
			hide = mode === "hide",
			showhide = ( show || mode === "hide" ),

			// showing or hiding leaves of the "last" animation
			anims = ( ( o.times || 5 ) * 2 ) + ( showhide ? 1 : 0 ),
			duration = o.duration / anims,
			animateTo = 0,
			queue = elem.queue(),
			queuelen = queue.length,
			i;

		if ( show || !elem.is(":visible")) {
			elem.css( "opacity", 0 ).show();
			animateTo = 1;
		}

		// anims - 1 opacity "toggles"
		for ( i = 1; i < anims; i++ ) {
			elem.animate({
				opacity: animateTo
			}, duration, o.easing );
			animateTo = 1 - animateTo;
		}

		elem.animate({
			opacity: animateTo
		}, duration, o.easing);

		elem.queue(function() {
			if ( hide ) {
				elem.hide();
			}
			done();
		});

		// We just queued up "anims" animations, we need to put them next in the queue
		if ( queuelen > 1 ) {
			queue.splice.apply( queue,
				[ 1, 0 ].concat( queue.splice( queuelen, anims + 1 ) ) );
		}
		elem.dequeue();
	};
}

})(jQuery);


/*
 * jQuery.ScrollTo
 * Copyright (c) 2007-2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 9/11/2008
 *
 * @projectDescription Easy element scrolling using jQuery.
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * Tested with jQuery 1.2.6. On FF 2/3, IE 6/7, Opera 9.2/5 and Safari 3. on Windows.
 *
 * @author Ariel Flesler
 * @version 1.4
 *
 * @id jQuery.scrollTo
 * @id jQuery.fn.scrollTo
 * @param {String, Number, DOMElement, jQuery, Object} target Where to scroll the matched elements.
 *	  The different options for target are:
 *		- A number position (will be applied to all axes).
 *		- A string position ('44', '100px', '+=90', etc ) will be applied to all axes
 *		- A jQuery/DOM element ( logically, child of the element to scroll )
 *		- A string selector, that will be relative to the element to scroll ( 'li:eq(2)', etc )
 *		- A hash { top:x, left:y }, x and y can be any kind of number/string like above.
 * @param {Number} duration The OVERALL length of the animation, this argument can be the settings object instead.
 * @param {Object,Function} settings Optional set of settings or the onAfter callback.
 *	 @option {String} axis Which axis must be scrolled, use 'x', 'y', 'xy' or 'yx'.
 *	 @option {Number} duration The OVERALL length of the animation.
 *	 @option {String} easing The easing method for the animation.
 *	 @option {Boolean} margin If true, the margin of the target element will be deducted from the final position.
 *	 @option {Object, Number} offset Add/deduct from the end position. One number for both axes or { top:x, left:y }.
 *	 @option {Object, Number} over Add/deduct the height/width multiplied by 'over', can be { top:x, left:y } when using both axes.
 *	 @option {Boolean} queue If true, and both axis are given, the 2nd axis will only be animated after the first one ends.
 *	 @option {Function} onAfter Function to be called after the scrolling ends. 
 *	 @option {Function} onAfterFirst If queuing is activated, this function will be called after the first scrolling ends.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @desc Scroll to a fixed position
 * @example $('div').scrollTo( 340 );
 *
 * @desc Scroll relatively to the actual position
 * @example $('div').scrollTo( '+=340px', { axis:'y' } );
 *
 * @dec Scroll using a selector (relative to the scrolled element)
 * @example $('div').scrollTo( 'p.paragraph:eq(2)', 500, { easing:'swing', queue:true, axis:'xy' } );
 *
 * @ Scroll to a DOM element (same for jQuery object)
 * @example var second_child = document.getElementById('container').firstChild.nextSibling;
 *			$('#container').scrollTo( second_child, { duration:500, axis:'x', onAfter:function(){
 *				alert('scrolled!!');																   
 *			}});
 *
 * @desc Scroll on both axes, to different values
 * @example $('div').scrollTo( { top: 300, left:'+=200' }, { axis:'xy', offset:-20 } );
 */
;(function( $ ){
	
	var $scrollTo = $.scrollTo = function( target, duration, settings ){
		$(window).scrollTo( target, duration, settings );
	};

	$scrollTo.defaults = {
		axis:'y',
		duration:1
	};

	// Returns the element that needs to be animated to scroll the window.
	// Kept for backwards compatibility (specially for localScroll & serialScroll)
	$scrollTo.window = function( scope ){
		return $(window).scrollable();
	};

	// Hack, hack, hack... stay away!
	// Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
	$.fn.scrollable = function(){
		return this.map(function(){
			// Just store it, we might need it
			var win = this.parentWindow || this.defaultView,
				// If it's a document, get its iframe or the window if it's THE document
				elem = this.nodeName == '#document' ? win.frameElement || win : this,
				// Get the corresponding document
				doc = elem.contentDocument || (elem.contentWindow || elem).document,
				isWin = elem.setInterval;

			return elem.nodeName == 'IFRAME' || isWin && $.browser.safari ? doc.body
				: isWin ? doc.documentElement
				: this;
		});
	};

	$.fn.scrollTo = function( target, duration, settings ){
		if( typeof duration == 'object' ){
			settings = duration;
			duration = 0;
		}
		if( typeof settings == 'function' )
			settings = { onAfter:settings };
			
		settings = $.extend( {}, $scrollTo.defaults, settings );
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.speed || settings.duration;
		// Make sure the settings are given right
		settings.queue = settings.queue && settings.axis.length > 1;
		
		if( settings.queue )
			// Let's keep the overall duration
			duration /= 2;
		settings.offset = both( settings.offset );
		settings.over = both( settings.over );

		return this.scrollable().each(function(){
			var elem = this,
				$elem = $(elem),
				targ = target, toff, attr = {},
				win = $elem.is('html,body');

			switch( typeof targ ){
				// A number will pass the regex
				case 'number':
				case 'string':
					if( /^([+-]=)?\d+(px)?$/.test(targ) ){
						targ = both( targ );
						// We are done
						break;
					}
					// Relative selector, no break!
					targ = $(targ,this);
				case 'object':
					// DOMElement / jQuery
					if( targ.is || targ.style )
						// Get the real position of the target 
						toff = (targ = $(targ)).offset();
			}
			$.each( settings.axis.split(''), function( i, axis ){
				var Pos	= axis == 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					old = elem[key],
					Dim = axis == 'x' ? 'Width' : 'Height',
					dim = Dim.toLowerCase();

				if( toff ){// jQuery / DOMElement
					attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

					// If it's a dom element, reduce the margin
					if( settings.margin ){
						attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
					}
					
					attr[key] += settings.offset[pos] || 0;
					
					if( settings.over[pos] )
						// Scroll to a fraction of its width/height
						attr[key] += targ[dim]() * settings.over[pos];
				}else
					attr[key] = targ[pos];

				// Number or 'number'
				if( /^\d+$/.test(attr[key]) )
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max(Dim) );

				// Queueing axes
				if( !i && settings.queue ){
					// Don't waste time animating, if there's no need.
					if( old != attr[key] )
						// Intermediate animation
						animate( settings.onAfterFirst );
					// Don't animate this axis again in the next iteration.
					delete attr[key];
				}
			});			
			animate( settings.onAfter );			

			function animate( callback ){
				$elem.animate( attr, duration, settings.easing, callback && function(){
					callback.call(this, target, settings);
				});
			};
			function max( Dim ){
				var attr ='scroll'+Dim,
					doc = elem.ownerDocument;
				
				return win
						? Math.max( doc.documentElement[attr], doc.body[attr]  )
						: elem[attr];
			};
		}).end();
	};

	function both( val ){
		return typeof val == 'object' ? val : { top:val, left:val };
	};

})( jQuery );

// ----------------------------------------------------------------------------
// Buzz, a Javascript HTML5 Audio library
// v 1.0.5 beta
// Licensed under the MIT license.
// http://buzz.jaysalvat.com/
// ----------------------------------------------------------------------------
// Copyright (C) 2011 Jay Salvat
// http://jaysalvat.com/
// ----------------------------------------------------------------------------
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files ( the "Software" ), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ----------------------------------------------------------------------------

var buzz = {
	defaults: {
		autoplay: false,
		duration: 5000,
		formats: [],
		loop: false,
		placeholder: '--',
		preload: 'metadata',
		volume: 80
	},
	types: {
		'mp3': 'audio/mpeg',
		'ogg': 'audio/ogg',
		'wav': 'audio/wav',
		'aac': 'audio/aac',
		'm4a': 'audio/x-m4a'
	},
	sounds: [],
	el: document.createElement( 'audio' ),

	sound: function( src, options ) {
		options = options || {};

		var pid = 0,
			events = [],
			eventsOnce = {},
			supported = buzz.isSupported();

		// publics
		this.load = function() {
			if ( !supported ) {
			  return this;
			}

			this.sound.load();
			return this;
		};

		this.play = function() {
			if ( !supported ) {
			  return this;
			}

			this.sound.play();
			return this;
		};

		this.togglePlay = function() {
			if ( !supported ) {
			  return this;
			}

			if ( this.sound.paused ) {
				this.sound.play();
			} else {
				this.sound.pause();
			}
			return this;
		};

		this.pause = function() {
			if ( !supported ) {
			  return this;
			}

			this.sound.pause();
			return this;
		};

		this.isPaused = function() {
			if ( !supported ) {
			  return null;
			}

			return this.sound.paused;
		};

		this.stop = function() {
			if ( !supported  ) {
			  return this;
			}

			this.setTime( this.getDuration() );
			this.sound.pause();
			return this;
		};

		this.isEnded = function() {
			if ( !supported ) {
			  return null;
			}

			return this.sound.ended;
		};

		this.loop = function() {
			if ( !supported ) {
			  return this;
			}

			this.sound.loop = 'loop';
			this.bind( 'ended.buzzloop', function() {
				this.currentTime = 0;
				this.play();
			});
			return this;
		};

		this.unloop = function() {
			if ( !supported ) {
			  return this;
			}

			this.sound.removeAttribute( 'loop' );
			this.unbind( 'ended.buzzloop' );
			return this;
		};

		this.mute = function() {
			if ( !supported ) {
			  return this;
			}

			this.sound.muted = true;
			return this;
		};

		this.unmute = function() {
			if ( !supported ) {
			  return this;
			}

			this.sound.muted = false;
			return this;
		};

		this.toggleMute = function() {
			if ( !supported ) {
			  return this;
			}

			this.sound.muted = !this.sound.muted;
			return this;
		};

		this.isMuted = function() {
			if ( !supported ) {
			  return null;
			}

			return this.sound.muted;
		};

		this.setVolume = function( volume ) {
			if ( !supported ) {
			  return this;
			}

			if ( volume < 0 ) {
			  volume = 0;
			}
			if ( volume > 100 ) {
			  volume = 100;
			}
		  
			this.volume = volume;
			this.sound.volume = volume / 100;
			return this;
		};
	  
		this.getVolume = function() {
			if ( !supported ) {
			  return this;
			}

			return this.volume;
		};

		this.increaseVolume = function( value ) {
			return this.setVolume( this.volume + ( value || 1 ) );
		};

		this.decreaseVolume = function( value ) {
			return this.setVolume( this.volume - ( value || 1 ) );
		};

		this.setTime = function( time ) {
			if ( !supported ) {
			  return this;
			}

			this.whenReady( function() {
				this.sound.currentTime = time;
			});
			return this;
		};

		this.getTime = function() {
			if ( !supported ) {
			  return null;
			}

			var time = Math.round( this.sound.currentTime * 100 ) / 100;
			return isNaN( time ) ? buzz.defaults.placeholder : time;
		};

		this.setPercent = function( percent ) {
			if ( !supported ) {
			  return this;
			}

			return this.setTime( buzz.fromPercent( percent, this.sound.duration ) );
		};

		this.getPercent = function() {
			if ( !supported ) {
			  return null;
			}

			var percent = Math.round( buzz.toPercent( this.sound.currentTime, this.sound.duration ) );
			return isNaN( percent ) ? buzz.defaults.placeholder : percent;
		};

		this.setSpeed = function( duration ) {
			if ( !supported ) {
			  return this;
			}

			this.sound.playbackRate = duration;
		};

		this.getSpeed = function() {
			if ( !supported ) {
			  return null;
			}

			return this.sound.playbackRate;
		};

		this.getDuration = function() {
			if ( !supported ) {
			  return null;
			}

			var duration = Math.round( this.sound.duration * 100 ) / 100;
			return isNaN( duration ) ? buzz.defaults.placeholder : duration;
		};

		this.getPlayed = function() {
			if ( !supported ) {
			  return null;
			}

			return timerangeToArray( this.sound.played );
		};

		this.getBuffered = function() {
			if ( !supported ) {
			  return null;
			}

			return timerangeToArray( this.sound.buffered );
		};

		this.getSeekable = function() {
			if ( !supported ) {
			  return null;
			}

			return timerangeToArray( this.sound.seekable );
		};

		this.getErrorCode = function() {
			if ( supported && this.sound.error ) {
				return this.sound.error.code;
			}
			return 0;
		};

		this.getErrorMessage = function() {
			if ( !supported ) {
			  return null;
			}

			switch( this.getErrorCode() ) {
				case 1:
					return 'MEDIA_ERR_ABORTED';
				case 2:
					return 'MEDIA_ERR_NETWORK';
				case 3:
					return 'MEDIA_ERR_DECODE';
				case 4:
					return 'MEDIA_ERR_SRC_NOT_SUPPORTED';
				default:
					return null;
			}
		};

		this.getStateCode = function() {
			if ( !supported ) {
			  return null;
			}

			return this.sound.readyState;
		};

		this.getStateMessage = function() {
			if ( !supported ) {
			  return null;
			}

			switch( this.getStateCode() ) {
				case 0:
					return 'HAVE_NOTHING';
				case 1:
					return 'HAVE_METADATA';
				case 2:
					return 'HAVE_CURRENT_DATA';
				case 3:
					return 'HAVE_FUTURE_DATA';
				case 4:
					return 'HAVE_ENOUGH_DATA';
				default:
					return null;
			}
		};

		this.getNetworkStateCode = function() {
			if ( !supported ) {
			  return null;
			}

			return this.sound.networkState;
		};

		this.getNetworkStateMessage = function() {
			if ( !supported ) {
			  return null;
			}

			switch( this.getNetworkStateCode() ) {
				case 0:
					return 'NETWORK_EMPTY';
				case 1:
					return 'NETWORK_IDLE';
				case 2:
					return 'NETWORK_LOADING';
				case 3:
					return 'NETWORK_NO_SOURCE';
				default:
					return null;
			}
		};

		this.set = function( key, value ) {
			if ( !supported ) {
			  return this;
			}

			this.sound[ key ] = value;
			return this;
		};

		this.get = function( key ) {
			if ( !supported ) {
			  return null;
			}

			return key ? this.sound[ key ] : this.sound;
		};

		this.bind = function( types, func ) {
			if ( !supported ) {
			  return this;
			}

			types = types.split( ' ' );

			var that = this,
				efunc = function( e ) { func.call( that, e ); };

			for( var t = 0; t < types.length; t++ ) {
				var type = types[ t ],
					idx = type;
					type = idx.split( '.' )[ 0 ];

					events.push( { idx: idx, func: efunc } );
					this.sound.addEventListener( type, efunc, true );
			}
			return this;
		};

		this.unbind = function( types ) {
			if ( !supported ) {
			  return this;
			}

			types = types.split( ' ' );

			for( var t = 0; t < types.length; t++ ) {
				var idx = types[ t ],
					type = idx.split( '.' )[ 0 ];

				for( var i = 0; i < events.length; i++ ) {
					var namespace = events[ i ].idx.split( '.' );
					if ( events[ i ].idx == idx || ( namespace[ 1 ] && namespace[ 1 ] == idx.replace( '.', '' ) ) ) {
						this.sound.removeEventListener( type, events[ i ].func, true );
						delete events[ i ];
					}
				}
			}
			return this;
		};

		this.bindOnce = function( type, func ) {
			if ( !supported ) {
			  return this;
			}

			var that = this;

			eventsOnce[ pid++ ] = false;
			this.bind( pid + type, function() {
			   if ( !eventsOnce[ pid ] ) {
				   eventsOnce[ pid ] = true;
				   func.call( that );
			   }
			   that.unbind( pid + type );
			});
		};

		this.trigger = function( types ) {
			if ( !supported ) {
			  return this;
			}

			types = types.split( ' ' );

			for( var t = 0; t < types.length; t++ ) {
				var idx = types[ t ];

				for( var i = 0; i < events.length; i++ ) {
					var eventType = events[ i ].idx.split( '.' );
					if ( events[ i ].idx == idx || ( eventType[ 0 ] && eventType[ 0 ] == idx.replace( '.', '' ) ) ) {
						var evt = document.createEvent('HTMLEvents');
						evt.initEvent( eventType[ 0 ], false, true );
						this.sound.dispatchEvent( evt );
					}
				}
			}
			return this;
		};

		this.fadeTo = function( to, duration, callback ) {
			if ( !supported ) {
			  return this;
			}

			if ( duration instanceof Function ) {
				callback = duration;
				duration = buzz.defaults.duration;
			} else {
				duration = duration || buzz.defaults.duration;
			}

			var from = this.volume,
				delay = duration / Math.abs( from - to ),
				that = this;
			this.play();

			function doFade() {
				setTimeout( function() {
					if ( from < to && that.volume < to ) {
						that.setVolume( that.volume += 1 );
						doFade();
					} else if ( from > to && that.volume > to ) {
						that.setVolume( that.volume -= 1 );
						doFade();
					} else if ( callback instanceof Function ) {
						callback.apply( that );
					}
				}, delay );
			}
			this.whenReady( function() {
				doFade();
			});

			return this;
		};

		this.fadeIn = function( duration, callback ) {
			if ( !supported ) {
			  return this;
			}

			return this.setVolume(0).fadeTo( 100, duration, callback );
		};

		this.fadeOut = function( duration, callback ) {
			if ( !supported ) {
			  return this;
			}

			return this.fadeTo( 0, duration, callback );
		};

		this.fadeWith = function( sound, duration ) {
			if ( !supported ) {
			  return this;
			}

			this.fadeOut( duration, function() {
				this.stop();
			});

			sound.play().fadeIn( duration );

			return this;
		};

		this.whenReady = function( func ) {
			if ( !supported ) {
			  return null;
			}

			var that = this;
			if ( this.sound.readyState === 0 ) {
				this.bind( 'canplay.buzzwhenready', function() {
					func.call( that );
				});
			} else {
				func.call( that );
			}
		};

		// privates
		function timerangeToArray( timeRange ) {
			var array = [],
				length = timeRange.length - 1;

			for( var i = 0; i <= length; i++ ) {
				array.push({
					start: timeRange.start( length ),
					end: timeRange.end( length )
				});
			}
			return array;
		}

		function getExt( filename ) {
			return filename.split('.').pop();
		}
		
		function addSource( sound, src ) {
			var source = document.createElement( 'source' );
			source.src = src;
			if ( buzz.types[ getExt( src ) ] ) {
				source.type = buzz.types[ getExt( src ) ];
			}
			sound.appendChild( source );
		}

		// init
		if ( supported ) {
		  
			for(var i in buzz.defaults ) {
			  if(buzz.defaults.hasOwnProperty(i)) {
				options[ i ] = options[ i ] || buzz.defaults[ i ];
			  }
			}

			this.sound = document.createElement( 'audio' );

			if ( src instanceof Array ) {
				for( var j in src ) {
				  if(src.hasOwnProperty(j)) {
					addSource( this.sound, src[ j ] );
				  }
				}
			} else if ( options.formats.length ) {
				for( var k in options.formats ) {
				  if(options.formats.hasOwnProperty(k)) {
					addSource( this.sound, src + '.' + options.formats[ k ] );
				  }
				}
			} else {
				addSource( this.sound, src );
			}

			if ( options.loop ) {
				this.loop();
			}

			if ( options.autoplay ) {
				this.sound.autoplay = 'autoplay';
			}

			if ( options.preload === true ) {
				this.sound.preload = 'auto';
			} else if ( options.preload === false ) {
				this.sound.preload = 'none';
			} else {
				this.sound.preload = options.preload;
			}

			this.setVolume( options.volume );

			buzz.sounds.push( this );
		}
	},

	group: function( sounds ) {
		sounds = argsToArray( sounds, arguments );

		// publics
		this.getSounds = function() {
			return sounds;
		};

		this.add = function( soundArray ) {
			soundArray = argsToArray( soundArray, arguments );
			for( var a = 0; a < soundArray.length; a++ ) {
				sounds.push( soundArray[ a ] );
			}
		};

		this.remove = function( soundArray ) {
			soundArray = argsToArray( soundArray, arguments );
			for( var a = 0; a < soundArray.length; a++ ) {
				for( var i = 0; i < sounds.length; i++ ) {
					if ( sounds[ i ] == soundArray[ a ] ) {
						delete sounds[ i ];
						break;
					}
				}
			}
		};

		this.load = function() {
			fn( 'load' );
			return this;
		};

		this.play = function() {
			fn( 'play' );
			return this;
		};

		this.togglePlay = function( ) {
			fn( 'togglePlay' );
			return this;
		};

		this.pause = function( time ) {
			fn( 'pause', time );
			return this;
		};

		this.stop = function() {
			fn( 'stop' );
			return this;
		};

		this.mute = function() {
			fn( 'mute' );
			return this;
		};

		this.unmute = function() {
			fn( 'unmute' );
			return this;
		};

		this.toggleMute = function() {
			fn( 'toggleMute' );
			return this;
		};

		this.setVolume = function( volume ) {
			fn( 'setVolume', volume );
			return this;
		};

		this.increaseVolume = function( value ) {
			fn( 'increaseVolume', value );
			return this;
		};

		this.decreaseVolume = function( value ) {
			fn( 'decreaseVolume', value );
			return this;
		};

		this.loop = function() {
			fn( 'loop' );
			return this;
		};

		this.unloop = function() {
			fn( 'unloop' );
			return this;
		};

		this.setTime = function( time ) {
			fn( 'setTime', time );
			return this;
		};

		this.setduration = function( duration ) {
			fn( 'setduration', duration );
			return this;
		};

		this.set = function( key, value ) {
			fn( 'set', key, value );
			return this;
		};

		this.bind = function( type, func ) {
			fn( 'bind', type, func );
			return this;
		};

		this.unbind = function( type ) {
			fn( 'unbind', type );
			return this;
		};

		this.bindOnce = function( type, func ) {
			fn( 'bindOnce', type, func );
			return this;
		};

		this.trigger = function( type ) {
			fn( 'trigger', type );
			return this;
		};

		this.fade = function( from, to, duration, callback ) {
			fn( 'fade', from, to, duration, callback );
			return this;
		};

		this.fadeIn = function( duration, callback ) {
			fn( 'fadeIn', duration, callback );
			return this;
		};

		this.fadeOut = function( duration, callback ) {
			fn( 'fadeOut', duration, callback );
			return this;
		};

		// privates
		function fn() {
			var args = argsToArray( null, arguments ),
				func = args.shift();

			for( var i = 0; i < sounds.length; i++ ) {
				sounds[ i ][ func ].apply( sounds[ i ], args );
			}
		}

		function argsToArray( array, args ) {
			return ( array instanceof Array ) ? array : Array.prototype.slice.call( args );
		}
	},

	all: function() {
	  return new buzz.group( buzz.sounds );
	},

	isSupported: function() {
		return !!buzz.el.canPlayType;
	},

	isOGGSupported: function() {
		return !!buzz.el.canPlayType && buzz.el.canPlayType( 'audio/ogg; codecs="vorbis"' );
	},

	isWAVSupported: function() {
		return !!buzz.el.canPlayType && buzz.el.canPlayType( 'audio/wav; codecs="1"' );
	},

	isMP3Supported: function() {
		return !!buzz.el.canPlayType && buzz.el.canPlayType( 'audio/mpeg;' );
	},

	isAACSupported: function() {
		return !!buzz.el.canPlayType && ( buzz.el.canPlayType( 'audio/x-m4a;' ) || buzz.el.canPlayType( 'audio/aac;' ) );
	},

	toTimer: function( time, withHours ) {
		var h, m, s;
		h = Math.floor( time / 3600 );
		h = isNaN( h ) ? '--' : ( h >= 10 ) ? h : '0' + h;
		m = withHours ? Math.floor( time / 60 % 60 ) : Math.floor( time / 60 );
		m = isNaN( m ) ? '--' : ( m >= 10 ) ? m : '0' + m;
		s = Math.floor( time % 60 );
		s = isNaN( s ) ? '--' : ( s >= 10 ) ? s : '0' + s;
		return withHours ? h + ':' + m + ':' + s : m + ':' + s;
	},

	fromTimer: function( time ) {
		var splits = time.toString().split( ':' );
		if ( splits && splits.length == 3 ) {
			time = ( parseInt( splits[ 0 ], 10 ) * 3600 ) + ( parseInt(splits[ 1 ], 10 ) * 60 ) + parseInt( splits[ 2 ], 10 );
		}
		if ( splits && splits.length == 2 ) {
			time = ( parseInt( splits[ 0 ], 10 ) * 60 ) + parseInt( splits[ 1 ], 10 );
		}
		return time;
	},

	toPercent: function( value, total, decimal ) {
		var r = Math.pow( 10, decimal || 0 );

		return Math.round( ( ( value * 100 ) / total ) * r ) / r;
	},

	fromPercent: function( percent, total, decimal ) {
		var r = Math.pow( 10, decimal || 0 );

		return  Math.round( ( ( total / 100 ) * percent ) * r ) / r;
	}
};

/*
 * bubbletip
 *
 *	Copyright (c) 2009-2010, UhLeeKa.
 *	Version: 1.0.6
 *	Licensed under the GNU Lesser General Public License:
 *		http://www.gnu.org/licenses/lgpl-3.0.html
 *	Author Website: 
 *		http://www.uhleeka.com
 *	Project Hosting on Google Code: 
 *		http://code.google.com/p/bubbletip/
 */

(function ($) {
	var bindIndex = 0;
	$.fn.extend({
		open: function () {
			$(this).trigger('open.bubbletip');
		},
		close: function () {
			$(this).trigger('close.bubbletip');
		},
		bubbletip: function (tip, options) {
			$(this).data('tip', $(tip).get(0).id);
			
			// check to see if the tip is a descendant of 
			// a table.bubbletip element and therefore
			// has already been instantiated as a bubbletip
			if ($('table.bubbletip #' + $(tip).get(0).id).length > 0) {
				return this;
			}
			var _this, _tip, _options, _calc, _timeoutAnimate, _timeoutRefresh, _isActive, _isHiding, _wrapper, _bindIndex;
			// hack for IE6,IE7
			var _windowWidth, _windowHeight;

			_this = $(this);
			_tip = $(tip);
			_bindIndex = bindIndex++;  // for window.resize namespace binding
			_options = {
				id: '',
				position: 'fixed', // absolute | fixed
				fixedHorizontal: 'right', // left | right
				fixedVertical: 'bottom', // top | bottom
				positionAt: 'element', // element | body | mouse
				positionAtElement: _this,
				offsetTop: 0,
				offsetLeft: 0,
				deltaPosition: 30,
				deltaDirection: 'up', // direction: up | down | left | right
				animationDuration: 250,
				animationEasing: 'swing', // linear | swing
				delayShow: 0,
				delayHide: 500,
				calculateOnShow: false
			};
			if (options) {
				_options = $.extend(_options, options);
			}
			// calculated values
			_calc = {
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				delta: 0,
				mouseTop: 0,
				mouseLeft: 0,
				tipHeight: 0
			};
			_timeoutAnimate = null;
			_timeoutRefresh = null;
			_isActive = false;
			_isHiding = false;

			// store the tip id for removeBubbletip
			if (!_this.data('bubbletip_tips')) {
				_this.data('bubbletip_tips', [[_tip.get(0).id, _bindIndex]]);
			} else {
				_this.data('bubbletip_tips', $.merge(_this.data('bubbletip_tips'), [[_tip.get(0).id, _bindIndex]]));
			}


			// validate _options
			if (!_options.fixedVertical.match(/^top|bottom$/i)) {
				_options.positionAt = 'top';
			}
			if (!_options.fixedHorizontal.match(/^left|right$/i)) {
				_options.positionAt = 'left';
			}
			if (!_options.positionAt.match(/^element|body|mouse$/i)) {
				_options.positionAt = 'element';
			}
			if (!_options.deltaDirection.match(/^up|down|left|right$/i)) {
				_options.deltaDirection = 'up';
			}
			if (_options.id.length > 0) {
				_options.id = ' id="' + _options.id + '"';
			}

			// create the wrapper table element
			if (_options.deltaDirection.match(/^up$/i)) {
				_wrapper = $('<table' + _options.id + ' class="bubbletip" cellspacing="0" cellpadding="0"><tbody><tr><td class="bt-topleft"></td><td class="bt-top"></td><td class="bt-topright"></td></tr><tr><td class="bt-left"></td><td class="bt-content"></td><td class="bt-right"></td></tr><tr><td class="bt-bottomleft"></td><td><table class="bt-bottom" cellspacing="0" cellpadding="0"><tr><th></th><td><div></div></td><th></th></tr></table></td><td class="bt-bottomright"></td></tr></tbody></table>');
			} else if (_options.deltaDirection.match(/^down$/i)) {
				_wrapper = $('<table' + _options.id + ' class="bubbletip" cellspacing="0" cellpadding="0"><tbody><tr><td class="bt-topleft"></td><td><table class="bt-top" cellspacing="0" cellpadding="0"><tr><th></th><td><div></div></td><th></th></tr></table></td><td class="bt-topright"></td></tr><tr><td class="bt-left"></td><td class="bt-content"></td><td class="bt-right"></td></tr><tr><td class="bt-bottomleft"></td><td class="bt-bottom"></td><td class="bt-bottomright"></td></tr></tbody></table>');
			} else if (_options.deltaDirection.match(/^left$/i)) {
				_wrapper = $('<table' + _options.id + ' class="bubbletip" cellspacing="0" cellpadding="0"><tbody><tr><td class="bt-topleft"></td><td class="bt-top"></td><td class="bt-topright"></td></tr><tr><td class="bt-left"></td><td class="bt-content"></td><td class="bt-right-tail"><div class="bt-right"></div><div class="bt-right-tail"></div><div class="bt-right"></div></td></tr><tr><td class="bt-bottomleft"></td><td class="bt-bottom"></td><td class="bt-bottomright"></td></tr></tbody></table>');
			} else if (_options.deltaDirection.match(/^right$/i)) {
				_wrapper = $('<table' + _options.id + ' class="bubbletip" cellspacing="0" cellpadding="0"><tbody><tr><td class="bt-topleft"></td><td class="bt-top"></td><td class="bt-topright"></td></tr><tr><td class="bt-left-tail"><div class="bt-left"></div><div class="bt-left-tail"></div><div class="bt-left"></div></td><td class="bt-content"></td><td class="bt-right"></td></tr><tr><td class="bt-bottomleft"></td><td class="bt-bottom"></td><td class="bt-bottomright"></td></tr></tbody></table>');
			}

			// append the wrapper to the document body
			_wrapper.appendTo('body');

			// apply IE filters to _wrapper elements
			if ((/msie/.test(navigator.userAgent.toLowerCase())) && (!/opera/.test(navigator.userAgent.toLowerCase()))) {
				$('*', _wrapper).each(function () {
					var image = $(this).css('background-image');
					if (image.match(/^url\(["']?(.*\.png)["']?\)$/i)) {
						image = RegExp.$1;
						$(this).css({
							'backgroundImage': 'none',
							'filter': 'progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=' + ($(this).css('backgroundRepeat') == 'no-repeat' ? 'crop' : 'scale') + ', src=\'' + image + '\')'
						}).each(function () {
							var position = $(this).css('position');
							if (position != 'absolute' && position != 'relative')
								$(this).css('position', 'relative');
						});
					}
				});
			}
			// move the tip element into the content section of the wrapper
			$('.bt-content', _wrapper).append(_tip);
			// show the tip (in case it is hidden) so that we can calculate its dimensions
			_tip.show();
			// handle left|right delta
			if (_options.deltaDirection.match(/^left|right$/i)) {
				// tail is 40px, so divide height by two and subtract 20px;
				_calc.tipHeight = parseInt(_tip.height() / 2, 10);
				// handle odd integer height
				if ((_tip.height() % 2) == 1) {
					_calc.tipHeight++;
				}
				_calc.tipHeight = (_calc.tipHeight < 20) ? 1 : _calc.tipHeight - 20;
				if (_options.deltaDirection.match(/^left$/i)) {
					$('div.bt-right', _wrapper).css('height', _calc.tipHeight + 'px');
				} else {
					$('div.bt-left', _wrapper).css('height', _calc.tipHeight + 'px');
				}
			}
			// set the opacity of the wrapper to 0
			_wrapper.css('opacity', 0);
			// hack for FF 3.6
			_wrapper.css({ 'width': _wrapper.width(), 'height': _wrapper.height() });
			// execute initial calculations
			_Calculate();
			_wrapper.hide();

			// handle window.resize
			$(window).bind('resize.bubbletip' + _bindIndex, function () {
				var w = $(window).width();
				var h = $(window).height();

				if (_options.position.match(/^fixed$/i) || ((w === _windowWidth) && (h === _windowHeight))) {
					return;
				}
				_windowWidth = w;
				_windowHeight = h;

				if (_timeoutRefresh) {
					clearTimeout(_timeoutRefresh);
				}
				_timeoutRefresh = setTimeout(function () {
					_Calculate();
				}, 250);
			});
			$([_wrapper.get(0), this.get(0)]).bind('open.bubbletip', function () {
				_isActive = false;
				if (_timeoutAnimate) {
					clearTimeout(_timeoutAnimate);
				}
				if (_options.delayShow === 0) {
					_Show();
				} else {
					_timeoutAnimate = setTimeout(function () {
						_Show();
					}, _options.delayShow);
				}
				return false;
			});
			
			$([_wrapper.get(0), this.get(0)]).bind('close.bubbletip', function () {
				if (_timeoutAnimate) {
					clearTimeout(_timeoutAnimate);
				}
				if (_options.delayHide === 0) {
					_Hide();
				} else {
					_timeoutAnimate = setTimeout(function () {
						_Hide();
					}, _options.delayHide);
				}
				return false;
			});
			
			
			function _Show() {
				var animation;

				if (_isActive) { // the tip is currently showing; do nothing
					return;
				}
				_isActive = true;
				if (_isHiding) { // the tip is currently hiding; interrupt and start showing again
					_wrapper.stop(true, false);
				}

				if (_options.calculateOnShow) {
					_Calculate();
				}
				if (_options.position.match(/^fixed$/i)) {
					animation = {};
					if (_options.deltaDirection.match(/^up|down$/i)) {
						if (_options.fixedVertical.match(/^top$/i)) {
							if (!_isHiding) {
								_wrapper.css('top', parseInt(_calc.top - _calc.delta, 10) + 'px');
							}
							animation.top = parseInt(_calc.top, 10) + 'px';
						} else {
							if (!_isHiding) {
								_wrapper.css('bottom', parseInt(_calc.bottom + _calc.delta, 10) + 'px');
							}
							animation.bottom = parseInt(_calc.bottom, 10) + 'px';
						}
					} else {
						if (_options.fixedHorizontal.match(/^right$/i)) {
							if (!_isHiding) {
								if (_options.fixedVertical.match(/^top$/i)) {
									_wrapper.css({ 'top': parseInt(_calc.top, 10) + 'px', 'right': parseInt(_calc.right - _calc.delta, 10) + 'px' });
								} else {
									_wrapper.css({ 'bottom': parseInt(_calc.bottom, 10) + 'px', 'right': parseInt(_calc.right - _calc.delta, 10) + 'px' });
								}
							}
							animation.right = parseInt(_calc.right, 10) + 'px';
						} else {
							if (!_isHiding) {
								if (_options.fixedVertical.match(/^top$/i)) {
									_wrapper.css({ 'top': parseInt(_calc.top, 10) + 'px', 'left': parseInt(_calc.left + _calc.delta, 10) + 'px' });
								} else {
									_wrapper.css({ 'bottom': parseInt(_calc.bottom, 10) + 'px', 'left': parseInt(_calc.left + _calc.delta, 10) + 'px' });
								}
							}
							animation.left = parseInt(_calc.left, 10) + 'px';
						}
					}
				} else {
					if (_options.positionAt.match(/^element|body$/i)) {
						if (_options.deltaDirection.match(/^up|down$/i)) {
							if (!_isHiding) {
								_wrapper.css('top', parseInt(_calc.top - _calc.delta, 10) + 'px');
							}
							animation = { 'top': _calc.top + 'px' };
						} else {
							if (!_isHiding) {
								_wrapper.css('left', parseInt(_calc.left - _calc.delta, 10) + 'px');
							}
							animation = { 'left': _calc.left + 'px' };
						}
					} else {
						if (_options.deltaDirection.match(/^up|down$/i)) {
							if (!_isHiding) {
								_calc.mouseTop = e.pageY + _calc.top;
								_wrapper.css({ 'top': parseInt(_calc.mouseTop + _calc.delta, 10) + 'px', 'left': parseInt(e.pageX - (_wrapper.width() / 2), 10) + 'px' });
							}
							animation = { 'top': _calc.mouseTop + 'px' };
						} else {
							if (!_isHiding) {
								_calc.mouseLeft = e.pageX + _calc.left;
								_wrapper.css({ 'left': parseInt(_calc.mouseLeft + _calc.delta, 10) + 'px', 'top': parseInt(e.pageY - (_wrapper.height() / 2), 10) + 'px' });
							}
							animation = { 'left': _calc.left + 'px' };
						}
					}
				}
				_isHiding = false;
				_wrapper.show();
				animation = $.extend(animation, { 'opacity': 1 });
				_wrapper.animate(animation, _options.animationDuration, _options.animationEasing, function () {
					if (_options.position.match(/^fixed$/i)) {
						_wrapper.css({
							'opacity': '',
							'position': 'fixed',
							'top': _calc.top,
							'left': _calc.left
						});
					} else {
						_wrapper.css('opacity', '');
					}
					_isActive = true;
				});
			}
			function _Hide() {
				var animation;

				_isActive = false;
				_isHiding = true;
				if (_options.position.match(/^fixed$/i)) {
					animation = {};
					if (_options.deltaDirection.match(/^up|down$/i))  {
						if (_calc.bottom !== '') { animation.bottom = parseInt(_calc.bottom + _calc.delta, 10) + 'px'; }
						if (_calc.top !== '') { animation.top = parseInt(_calc.top - _calc.delta, 10) + 'px'; }
					} else {
						if (_options.fixedHorizontal.match(/^left$/i)) {
							if (_calc.right !== '') { animation.right = parseInt(_calc.right + _calc.delta, 10) + 'px'; }
							if (_calc.left !== '') { animation.left = parseInt(_calc.left + _calc.delta, 10) + 'px'; }
						} else {
							if (_calc.right !== '') { animation.right = parseInt(_calc.right - _calc.delta, 10) + 'px'; }
							if (_calc.left !== '') { animation.left = parseInt(_calc.left - _calc.delta, 10) + 'px'; }
						}
					}
				} else {
					if (_options.positionAt.match(/^element|body$/i)) {
						if (_options.deltaDirection.match(/^up|down$/i)) {
							animation = { 'top': parseInt(_calc.top - _calc.delta, 10) + 'px' };
						} else {
							animation = { 'left': parseInt(_calc.left - _calc.delta, 10) + 'px' };
						}
					} else {
						if (_options.deltaDirection.match(/^up|down$/i)) {
							animation = { 'top': parseInt(_calc.mouseTop - _calc.delta, 10) + 'px' };
						} else {
							animation = { 'left': parseInt(_calc.mouseLeft - _calc.delta, 10) + 'px' };
						}
					}
				}
				animation = $.extend(animation, {
					'opacity': 0
				});
				_wrapper.animate(animation, _options.animationDuration, _options.animationEasing, function () {
					_wrapper.hide();
					_isHiding = false;
				});
			}
			function _Calculate() {
				var offset;
				// calculate values
				if (_options.position.match(/^fixed$/i)) {
					offset = _options.positionAtElement.offset();
					if (_options.fixedHorizontal.match(/^left$/i)) {
						_calc.left = offset.left + (_options.positionAtElement.outerWidth() / 2);
					} else {
						_calc.left = '';
					}
					if (_options.fixedHorizontal.match(/^right$/i)) {
						_calc.right = ($(window).width() - offset.left) - ((_options.positionAtElement.outerWidth() + _wrapper.outerWidth()) / 2);
					} else {
						_calc.right = '';
					}
					if (_options.fixedVertical.match(/^top$/i)) {
						_calc.top = offset.top - $(window).scrollTop() - _wrapper.outerHeight();
					} else {
						_calc.top = '';
					}
					if (_options.fixedVertical.match(/^bottom$/i)) {
						_calc.bottom = $(window).scrollTop() + $(window).height() - offset.top + _options.offsetTop;
					} else {
						_calc.bottom = '';
					}
					if (_options.deltaDirection.match(/^left|right$/i)) {
						if (_options.fixedVertical.match(/^top$/i)) {
							_calc.top = _calc.top + (_wrapper.outerHeight() / 2) + (_options.positionAtElement.outerHeight() / 2);
						} else {
							_calc.bottom = _calc.bottom - (_wrapper.outerHeight() / 2) - (_options.positionAtElement.outerHeight() / 2);
						}
					}
					if (_options.deltaDirection.match(/^left$/i)) {
						if (_options.fixedHorizontal.match(/^left$/i)) {
							_calc.left = _calc.left - _wrapper.outerWidth();
						} else {
							_calc.right = _calc.right + (_wrapper.outerWidth() / 2);
						}
					} else if (_options.deltaDirection.match(/^right$/i)) {
						if (_options.fixedHorizontal.match(/^left$/i)) {
							_calc.left = _calc.left;
						} else {
							_calc.right = _calc.right - (_wrapper.outerWidth() / 2);
						}
					} else if (_options.deltaDirection.match(/^down$/i)) {
						if (_options.fixedVertical.match(/^top$/i)) {
							_calc.top = _calc.top + _wrapper.outerHeight() + _options.positionAtElement.outerHeight();
						} else {
							_calc.bottom = _calc.bottom - _wrapper.outerHeight() - _options.positionAtElement.outerHeight();
						}
						if (_options.fixedHorizontal.match(/^left$/i)) {
							_calc.left = _calc.left - (_wrapper.outerWidth() / 2);
						}
					} else {
						if (_options.fixedHorizontal.match(/^left$/i)) {
							_calc.left = _calc.left - (_wrapper.outerWidth() / 2);
						}
					}
					if (_options.deltaDirection.match(/^up|right$/i) && _options.fixedHorizontal.match(/^left|right$/i)) {
						_calc.delta = _options.deltaPosition;
					} else {
						_calc.delta = -_options.deltaPosition;
					}
				} else if (_options.positionAt.match(/^element$/i)) {
					offset = _options.positionAtElement.offset();
					if (_options.deltaDirection.match(/^up$/i)) {
						_calc.top = offset.top + _options.offsetTop - _wrapper.outerHeight();
						_calc.left = offset.left + _options.offsetLeft + ((_options.positionAtElement.outerWidth() - _wrapper.outerWidth()) / 2);
						_calc.delta = _options.deltaPosition;
					} else if (_options.deltaDirection.match(/^down$/i)) {
						_calc.top = offset.top + _options.positionAtElement.outerHeight() + _options.offsetTop;
						_calc.left = offset.left + _options.offsetLeft + ((_options.positionAtElement.outerWidth() - _wrapper.outerWidth()) / 2);
						_calc.delta = -_options.deltaPosition;
					} else if (_options.deltaDirection.match(/^left$/i)) {
						_calc.top = offset.top + _options.offsetTop + ((_options.positionAtElement.outerHeight() - _wrapper.outerHeight()) / 2);
						_calc.left = offset.left + _options.offsetLeft - _wrapper.outerWidth();
						_calc.delta = _options.deltaPosition;
					} else if (_options.deltaDirection.match(/^right$/i)) {
						_calc.top = offset.top + _options.offsetTop + ((_options.positionAtElement.outerHeight() - _wrapper.outerHeight()) / 2);
						_calc.left = offset.left + _options.positionAtElement.outerWidth() + _options.offsetLeft;
						_calc.delta = -_options.deltaPosition;
					}
				} else if (_options.positionAt.match(/^body$/i)) {
					if (_options.deltaDirection.match(/^up|left$/i)) {
						_calc.top = _options.offsetTop;
						_calc.left = _options.offsetLeft;
						// up or left
						_calc.delta = _options.deltaPosition;
					} else {
						if (_options.deltaDirection.match(/^down$/i)) {
							_calc.top = parseInt(_options.offsetTop + _wrapper.outerHeight(), 10);
							_calc.left = _options.offsetLeft;
						} else {
							_calc.top = _options.offsetTop;
							_calc.left = parseInt(_options.offsetLeft + _wrapper.outerWidth(), 10);
						}
						// down or right
						_calc.delta = -_options.deltaPosition;
					}
				} else if (_options.positionAt.match(/^mouse$/i)) {
					if (_options.deltaDirection.match(/^up|left$/i)) {
						if (_options.deltaDirection.match(/^up$/i)) {
							_calc.top = -(_options.offsetTop + _wrapper.outerHeight());
							_calc.left = _options.offsetLeft;
						} else if (_options.deltaDirection.match(/^left$/i)) {
							_calc.top = _options.offsetTop;
							_calc.left = -(_options.offsetLeft + _wrapper.outerWidth());
						}
						// up or left
						_calc.delta = _options.deltaPosition;
					} else {
						_calc.top = _options.offsetTop;
						_calc.left = _options.offsetLeft;
						// down or right
						_calc.delta = -_options.deltaPosition;
					}
				}

				// handle the wrapper (element|body) positioning
				if (_options.position.match(/^fixed$/i)) {
					if (_options.positionAt.match(/^element|body$/i)) {
						_wrapper.css({
							'position': 'fixed',
							'left': _calc.left,
							'top': _calc.top,
							'right': _calc.right + 'px',
							'bottom': _calc.bottom + 'px'
						});
					}
				} else {
					if (_options.positionAt.match(/^element|body$/i)) {
						_wrapper.css({
							'position': 'absolute',
							'top': _calc.top + 'px',
							'left': _calc.left + 'px'
						});
					}
				}
			}
			return this;
		},
		removeBubbletip: function (tips) {
			var tipsActive;
			var tipsToRemove = [];
			var tipsActiveAdjusted = [];
			var arr, i, ix;
			var elem;

			tipsActive = $.makeArray($(this).data('bubbletip_tips'));

			// convert the parameter array of tip id's or elements to id's
			arr = $.makeArray(tips);
			for (i = 0; i < arr.length; i++) {
				tipsToRemove.push($(arr[i]).get(0).id);
			}

			for (i = 0; i < tipsActive.length; i++) {
				ix = null;
				if ((tipsToRemove.length === 0) || ((ix = $.inArray(tipsActive[i][0], tipsToRemove)) >= 0)) {
					// remove all tips if there are none specified
					// otherwise, remove only specified tips

					// find the surrounding table.bubbletip
					elem = $('#' + tipsActive[i][0]).get(0).parentNode;
					while (elem.tagName.toLowerCase() != 'table') {
						elem = elem.parentNode;
					}
					// attach the tip element to body and hide
					$('#' + tipsActive[i][0]).appendTo('body').hide();
					// remove the surrounding table.bubbletip
					$(elem).remove();

					// unbind show/hide events
					$(this).unbind('.bubbletip' + tipsActive[i][1]);

					// unbind window.resize event
					$(window).unbind('.bubbletip' + tipsActive[i][1]);
				} else {
					// tip is not being removed, so add it to the adjusted array
					tipsActiveAdjusted.push(tipsActive[i]);
				}
			}
			$(this).data('bubbletip_tips', tipsActiveAdjusted);

			return this;
		}
	});
})(jQuery);

/*!
 * fancyBox - jQuery Plugin
 * version: 2.1.4 (Thu, 10 Jan 2013)
 * @requires jQuery v1.6 or later
 *
 * Examples at http://fancyapps.com/fancybox/
 * License: www.fancyapps.com/fancybox/#license
 *
 * Copyright 2012 Janis Skarnelis - janis@fancyapps.com
 *
 */

(function (window, document, $, undefined) {
	"use strict";

	var W = $(window),
		D = $(document),
		F = $.fancybox = function () {
			F.open.apply( this, arguments );
		},
		IE =  navigator.userAgent.match(/msie/),
		didUpdate = null,
		isTouch	  = document.createTouch !== undefined,

		isQuery	= function(obj) {
			return obj && obj.hasOwnProperty && obj instanceof $;
		},
		isString = function(str) {
			return str && $.type(str) === "string";
		},
		isPercentage = function(str) {
			return isString(str) && str.indexOf('%') > 0;
		},
		isScrollable = function(el) {
			return (el && !(el.style.overflow && el.style.overflow === 'hidden') && ((el.clientWidth && el.scrollWidth > el.clientWidth) || (el.clientHeight && el.scrollHeight > el.clientHeight)));
		},
		getScalar = function(orig, dim) {
			var value = parseInt(orig, 10) || 0;

			if (dim && isPercentage(orig)) {
				value = F.getViewport()[ dim ] / 100 * value;
			}

			return Math.ceil(value);
		},
		getValue = function(value, dim) {
			return getScalar(value, dim) + 'px';
		};

	$.extend(F, {
		// The current version of fancyBox
		version: '2.1.4',

		defaults: {
			padding : 15,
			margin  : 20,

			width     : 800,
			height    : 600,
			minWidth  : 100,
			minHeight : 100,
			maxWidth  : 9999,
			maxHeight : 9999,

			autoSize   : true,
			autoHeight : false,
			autoWidth  : false,

			autoResize  : true,
			autoCenter  : !isTouch,
			fitToView   : true,
			aspectRatio : false,
			topRatio    : 0.5,
			leftRatio   : 0.5,

			scrolling : 'auto', // 'auto', 'yes' or 'no'
			wrapCSS   : '',

			arrows     : true,
			closeBtn   : true,
			closeClick : false,
			nextClick  : false,
			mouseWheel : true,
			autoPlay   : false,
			playSpeed  : 3000,
			preload    : 3,
			modal      : false,
			loop       : true,

			ajax  : {
				dataType : 'html',
				headers  : { 'X-fancyBox': true }
			},
			iframe : {
				scrolling : 'auto',
				preload   : true
			},
			swf : {
				wmode: 'transparent',
				allowfullscreen   : 'true',
				allowscriptaccess : 'always'
			},

			keys  : {
				next : {
					13 : 'left', // enter
					34 : 'up',   // page down
					39 : 'left', // right arrow
					40 : 'up'    // down arrow
				},
				prev : {
					8  : 'right',  // backspace
					33 : 'down',   // page up
					37 : 'right',  // left arrow
					38 : 'down'    // up arrow
				},
				close  : [27], // escape key
				play   : [32], // space - start/stop slideshow
				toggle : [70]  // letter "f" - toggle fullscreen
			},

			direction : {
				next : 'left',
				prev : 'right'
			},

			scrollOutside  : true,

			// Override some properties
			index   : 0,
			type    : null,
			href    : null,
			content : null,
			title   : null,

			// HTML templates
			tpl: {
				wrap     : '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
				image    : '<img class="fancybox-image" src="{href}" alt="" />',
				iframe   : '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (IE ? ' allowtransparency="true"' : '') + '></iframe>',
				error    : '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
				closeBtn : '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
				next     : '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
				prev     : '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
			},

			// Properties for each animation type
			// Opening fancyBox
			openEffect  : 'fade', // 'elastic', 'fade' or 'none'
			openSpeed   : 250,
			openEasing  : 'swing',
			openOpacity : true,
			openMethod  : 'zoomIn',

			// Closing fancyBox
			closeEffect  : 'fade', // 'elastic', 'fade' or 'none'
			closeSpeed   : 250,
			closeEasing  : 'swing',
			closeOpacity : true,
			closeMethod  : 'zoomOut',

			// Changing next gallery item
			nextEffect : 'elastic', // 'elastic', 'fade' or 'none'
			nextSpeed  : 250,
			nextEasing : 'swing',
			nextMethod : 'changeIn',

			// Changing previous gallery item
			prevEffect : 'elastic', // 'elastic', 'fade' or 'none'
			prevSpeed  : 250,
			prevEasing : 'swing',
			prevMethod : 'changeOut',

			// Enable default helpers
			helpers : {
				overlay : true,
				title   : true
			},

			// Callbacks
			onCancel     : $.noop, // If canceling
			beforeLoad   : $.noop, // Before loading
			afterLoad    : $.noop, // After loading
			beforeShow   : $.noop, // Before changing in current item
			afterShow    : $.noop, // After opening
			beforeChange : $.noop, // Before changing gallery item
			beforeClose  : $.noop, // Before closing
			afterClose   : $.noop  // After closing
		},

		//Current state
		group    : {}, // Selected group
		opts     : {}, // Group options
		previous : null,  // Previous element
		coming   : null,  // Element being loaded
		current  : null,  // Currently loaded element
		isActive : false, // Is activated
		isOpen   : false, // Is currently open
		isOpened : false, // Have been fully opened at least once

		wrap  : null,
		skin  : null,
		outer : null,
		inner : null,

		player : {
			timer    : null,
			isActive : false
		},

		// Loaders
		ajaxLoad   : null,
		imgPreload : null,

		// Some collections
		transitions : {},
		helpers     : {},

		/*
		 *	Static methods
		 */

		open: function (group, opts) {
			if (!group) {
				return;
			}

			if (!$.isPlainObject(opts)) {
				opts = {};
			}

			// Close if already active
			if (false === F.close(true)) {
				return;
			}

			// Normalize group
			if (!$.isArray(group)) {
				group = isQuery(group) ? $(group).get() : [group];
			}

			// Recheck if the type of each element is `object` and set content type (image, ajax, etc)
			$.each(group, function(i, element) {
				var obj = {},
					href,
					title,
					content,
					type,
					rez,
					hrefParts,
					selector;

				if ($.type(element) === "object") {
					// Check if is DOM element
					if (element.nodeType) {
						element = $(element);
					}

					if (isQuery(element)) {
						obj = {
							href    : element.data('fancybox-href') || element.attr('href'),
							title   : element.data('fancybox-title') || element.attr('title'),
							isDom   : true,
							element : element
						};

						if ($.metadata) {
							$.extend(true, obj, element.metadata());
						}

					} else {
						obj = element;
					}
				}

				href  = opts.href  || obj.href || (isString(element) ? element : null);
				title = opts.title !== undefined ? opts.title : obj.title || '';

				content = opts.content || obj.content;
				type    = content ? 'html' : (opts.type  || obj.type);

				if (!type && obj.isDom) {
					type = element.data('fancybox-type');

					if (!type) {
						rez  = (jQuery.isFunction(jQuery().prop)) ? element.prop('class').match(/fancybox\.(\w+)/) : false;
						type = rez ? rez[1] : null;
					}
				}

				if (isString(href)) {
					// Try to guess the content type
					if (!type) {
						if (F.isImage(href)) {
							type = 'image';

						} else if (F.isSWF(href)) {
							type = 'swf';

						} else if (href.charAt(0) === '#') {
							type = 'inline';

						} else if (isString(element)) {
							type    = 'html';
							content = element;
						}
					}

					// Split url into two pieces with source url and content selector, e.g,
					// "/mypage.html #my_id" will load "/mypage.html" and display element having id "my_id"
					if (type === 'ajax') {
						hrefParts = href.split(/\s+/, 2);
						href      = hrefParts.shift();
						selector  = hrefParts.shift();
					}
				}

				if (!content) {
					if (type === 'inline') {
						if (href) {
							content = $( isString(href) ? href.replace(/.*(?=#[^\s]+$)/, '') : href ); //strip for ie7

						} else if (obj.isDom) {
							content = element;
						}

					} else if (type === 'html') {
						content = href;

					} else if (!type && !href && obj.isDom) {
						type    = 'inline';
						content = element;
					}
				}

				$.extend(obj, {
					href     : href,
					type     : type,
					content  : content,
					title    : title,
					selector : selector
				});

				group[ i ] = obj;
			});

			// Extend the defaults
			F.opts = $.extend(true, {}, F.defaults, opts);

			// All options are merged recursive except keys
			if (opts.keys !== undefined) {
				F.opts.keys = opts.keys ? $.extend({}, F.defaults.keys, opts.keys) : false;
			}

			F.group = group;

			return F._start(F.opts.index);
		},

		// Cancel image loading or abort ajax request
		cancel: function () {
			var coming = F.coming;

			if (!coming || false === F.trigger('onCancel')) {
				return;
			}

			F.hideLoading();

			if (F.ajaxLoad) {
				F.ajaxLoad.abort();
			}

			F.ajaxLoad = null;

			if (F.imgPreload) {
				F.imgPreload.onload = F.imgPreload.onerror = null;
			}

			if (coming.wrap) {
				coming.wrap.stop(true, true).trigger('onReset').remove();
			}

			F.coming = null;

			// If the first item has been canceled, then clear everything
			if (!F.current) {
				F._afterZoomOut( coming );
			}
		},

		// Start closing animation if is open; remove immediately if opening/closing
		close: function (event) {
			F.cancel();

			if (false === F.trigger('beforeClose')) {
				return;
			}

			F.unbindEvents();

			if (!F.isActive) {
				return;
			}

			if (!F.isOpen || event === true) {
				$('.fancybox-wrap').stop(true).trigger('onReset').remove();

				F._afterZoomOut();

			} else {
				F.isOpen = F.isOpened = false;
				F.isClosing = true;

				$('.fancybox-item, .fancybox-nav').remove();

				F.wrap.stop(true, true).removeClass('fancybox-opened');

				F.transitions[ F.current.closeMethod ]();
			}
		},

		// Manage slideshow:
		//   $.fancybox.play(); - toggle slideshow
		//   $.fancybox.play( true ); - start
		//   $.fancybox.play( false ); - stop
		play: function ( action ) {
			var clear = function () {
					clearTimeout(F.player.timer);
				},
				set = function () {
					clear();

					if (F.current && F.player.isActive) {
						F.player.timer = setTimeout(F.next, F.current.playSpeed);
					}
				},
				stop = function () {
					clear();

					$('body').unbind('.player');

					F.player.isActive = false;

					F.trigger('onPlayEnd');
				},
				start = function () {
					if (F.current && (F.current.loop || F.current.index < F.group.length - 1)) {
						F.player.isActive = true;

						$('body').bind({
							'afterShow.player onUpdate.player'   : set,
							'onCancel.player beforeClose.player' : stop,
							'beforeLoad.player' : clear
						});

						set();

						F.trigger('onPlayStart');
					}
				};

			if (action === true || (!F.player.isActive && action !== false)) {
				start();
			} else {
				stop();
			}
		},

		// Navigate to next gallery item
		next: function ( direction ) {
			var current = F.current;

			if (current) {
				if (!isString(direction)) {
					direction = current.direction.next;
				}

				F.jumpto(current.index + 1, direction, 'next');
			}
		},

		// Navigate to previous gallery item
		prev: function ( direction ) {
			var current = F.current;

			if (current) {
				if (!isString(direction)) {
					direction = current.direction.prev;
				}

				F.jumpto(current.index - 1, direction, 'prev');
			}
		},

		// Navigate to gallery item by index
		jumpto: function ( index, direction, router ) {
			var current = F.current;

			if (!current) {
				return;
			}

			index = getScalar(index);

			F.direction = direction || current.direction[ (index >= current.index ? 'next' : 'prev') ];
			F.router    = router || 'jumpto';

			if (current.loop) {
				if (index < 0) {
					index = current.group.length + (index % current.group.length);
				}

				index = index % current.group.length;
			}

			if (current.group[ index ] !== undefined) {
				F.cancel();

				F._start(index);
			}
		},

		// Center inside viewport and toggle position type to fixed or absolute if needed
		reposition: function (e, onlyAbsolute) {
			var current = F.current,
				wrap    = current ? current.wrap : null,
				pos;

			if (wrap) {
				pos = F._getPosition(onlyAbsolute);

				if (e && e.type === 'scroll') {
					delete pos.position;

					wrap.stop(true, true).animate(pos, 200);

				} else {
					wrap.css(pos);

					current.pos = $.extend({}, current.dim, pos);
				}
			}
		},

		update: function (e) {
			var type = (e && e.type),
				anyway = !type || type === 'orientationchange';

			if (anyway) {
				clearTimeout(didUpdate);

				didUpdate = null;
			}

			if (!F.isOpen || didUpdate) {
				return;
			}

			didUpdate = setTimeout(function() {
				var current = F.current;

				if (!current || F.isClosing) {
					return;
				}

				F.wrap.removeClass('fancybox-tmp');

				if (anyway || type === 'load' || (type === 'resize' && current.autoResize)) {
					F._setDimension();
				}

				if (!(type === 'scroll' && current.canShrink)) {
					F.reposition(e);
				}

				F.trigger('onUpdate');

				didUpdate = null;

			}, (anyway && !isTouch ? 0 : 300));
		},

		// Shrink content to fit inside viewport or restore if resized
		toggle: function ( action ) {
			if (F.isOpen) {
				F.current.fitToView = $.type(action) === "boolean" ? action : !F.current.fitToView;

				// Help browser to restore document dimensions
				if (isTouch) {
					F.wrap.removeAttr('style').addClass('fancybox-tmp');

					F.trigger('onUpdate');
				}

				F.update();
			}
		},

		hideLoading: function () {
			D.unbind('.loading');

			$('#fancybox-loading').remove();
		},

		showLoading: function () {
			var el, viewport;

			F.hideLoading();

			el = $('<div id="fancybox-loading"><div></div></div>').click(F.cancel).appendTo('body');

			// If user will press the escape-button, the request will be canceled
			D.bind('keydown.loading', function(e) {
				if ((e.which || e.keyCode) === 27) {
					e.preventDefault();

					F.cancel();
				}
			});

			if (!F.defaults.fixed) {
				viewport = F.getViewport();

				el.css({
					position : 'absolute',
					top  : (viewport.h * 0.5) + viewport.y,
					left : (viewport.w * 0.5) + viewport.x
				});
			}
		},

		getViewport: function () {
			var locked = (F.current && F.current.locked) || false,
				rez    = {
					x: W.scrollLeft(),
					y: W.scrollTop()
				};

			if (locked) {
				rez.w = locked[0].clientWidth;
				rez.h = locked[0].clientHeight;

			} else {
				// See http://bugs.jquery.com/ticket/6724
				rez.w = isTouch && window.innerWidth  ? window.innerWidth  : W.width();
				rez.h = isTouch && window.innerHeight ? window.innerHeight : W.height();
			}

			return rez;
		},

		// Unbind the keyboard / clicking actions
		unbindEvents: function () {
			if (F.wrap && isQuery(F.wrap)) {
				F.wrap.unbind('.fb');
			}

			D.unbind('.fb');
			W.unbind('.fb');
		},

		bindEvents: function () {
			var current = F.current,
				keys;

			if (!current) {
				return;
			}

			// Changing document height on iOS devices triggers a 'resize' event,
			// that can change document height... repeating infinitely
			W.bind('orientationchange.fb' + (isTouch ? '' : ' resize.fb') + (current.autoCenter && !current.locked ? ' scroll.fb' : ''), F.update);

			keys = current.keys;

			if (keys) {
				D.bind('keydown.fb', function (e) {
					var code   = e.which || e.keyCode,
						target = e.target || e.srcElement;

					// Skip esc key if loading, because showLoading will cancel preloading
					if (code === 27 && F.coming) {
						return false;
					}

					// Ignore key combinations and key events within form elements
					if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && !(target && (target.type || $(target).is('[contenteditable]')))) {
						$.each(keys, function(i, val) {
							if (current.group.length > 1 && val[ code ] !== undefined) {
								F[ i ]( val[ code ] );

								e.preventDefault();
								return false;
							}

							if ($.inArray(code, val) > -1) {
								F[ i ] ();

								e.preventDefault();
								return false;
							}
						});
					}
				});
			}

			if ($.fn.mousewheel && current.mouseWheel) {
				F.wrap.bind('mousewheel.fb', function (e, delta, deltaX, deltaY) {
					var target = e.target || null,
						parent = $(target),
						canScroll = false;

					while (parent.length) {
						if (canScroll || parent.is('.fancybox-skin') || parent.is('.fancybox-wrap')) {
							break;
						}

						canScroll = isScrollable( parent[0] );
						parent    = $(parent).parent();
					}

					if (delta !== 0 && !canScroll) {
						if (F.group.length > 1 && !current.canShrink) {
							if (deltaY > 0 || deltaX > 0) {
								F.prev( deltaY > 0 ? 'down' : 'left' );

							} else if (deltaY < 0 || deltaX < 0) {
								F.next( deltaY < 0 ? 'up' : 'right' );
							}

							e.preventDefault();
						}
					}
				});
			}
		},

		trigger: function (event, o) {
			var ret, obj = o || F.coming || F.current;

			if (!obj) {
				return;
			}

			if ($.isFunction( obj[event] )) {
				ret = obj[event].apply(obj, Array.prototype.slice.call(arguments, 1));
			}

			if (ret === false) {
				return false;
			}

			if (obj.helpers) {
				$.each(obj.helpers, function (helper, opts) {
					if (opts && F.helpers[helper] && $.isFunction(F.helpers[helper][event])) {
						opts = $.extend(true, {}, F.helpers[helper].defaults, opts);

						F.helpers[helper][event](opts, obj);
					}
				});
			}

			$.event.trigger(event + '.fb');
		},

		isImage: function (str) {
			return isString(str) && str.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp)((\?|#).*)?$)/i);
		},

		isSWF: function (str) {
			return isString(str) && str.match(/\.(swf)((\?|#).*)?$/i);
		},

		_start: function (index) {
			var coming = {},
				obj,
				href,
				type,
				margin,
				padding;

			index = getScalar( index );
			obj   = F.group[ index ] || null;

			if (!obj) {
				return false;
			}

			coming = $.extend(true, {}, F.opts, obj);

			// Convert margin and padding properties to array - top, right, bottom, left
			margin  = coming.margin;
			padding = coming.padding;

			if ($.type(margin) === 'number') {
				coming.margin = [margin, margin, margin, margin];
			}

			if ($.type(padding) === 'number') {
				coming.padding = [padding, padding, padding, padding];
			}

			// 'modal' propery is just a shortcut
			if (coming.modal) {
				$.extend(true, coming, {
					closeBtn   : false,
					closeClick : false,
					nextClick  : false,
					arrows     : false,
					mouseWheel : false,
					keys       : null,
					helpers: {
						overlay : {
							closeClick : false
						}
					}
				});
			}

			// 'autoSize' property is a shortcut, too
			if (coming.autoSize) {
				coming.autoWidth = coming.autoHeight = true;
			}

			if (coming.width === 'auto') {
				coming.autoWidth = true;
			}

			if (coming.height === 'auto') {
				coming.autoHeight = true;
			}

			/*
			 * Add reference to the group, so it`s possible to access from callbacks, example:
			 * afterLoad : function() {
			 *     this.title = 'Image ' + (this.index + 1) + ' of ' + this.group.length + (this.title ? ' - ' + this.title : '');
			 * }
			 */

			coming.group  = F.group;
			coming.index  = index;

			// Give a chance for callback or helpers to update coming item (type, title, etc)
			F.coming = coming;

			if (false === F.trigger('beforeLoad')) {
				F.coming = null;

				return;
			}

			type = coming.type;
			href = coming.href;

			if (!type) {
				F.coming = null;

				//If we can not determine content type then drop silently or display next/prev item if looping through gallery
				if (F.current && F.router && F.router !== 'jumpto') {
					F.current.index = index;

					return F[ F.router ]( F.direction );
				}

				return false;
			}

			F.isActive = true;

			if (type === 'image' || type === 'swf') {
				coming.autoHeight = coming.autoWidth = false;
				coming.scrolling  = 'visible';
			}

			if (type === 'image') {
				coming.aspectRatio = true;
			}

			if (type === 'iframe' && isTouch) {
				coming.scrolling = 'scroll';
			}

			// Build the neccessary markup
			coming.wrap = $(coming.tpl.wrap).addClass('fancybox-' + (isTouch ? 'mobile' : 'desktop') + ' fancybox-type-' + type + ' fancybox-tmp ' + coming.wrapCSS).appendTo( coming.parent || 'body' );

			$.extend(coming, {
				skin  : $('.fancybox-skin',  coming.wrap),
				outer : $('.fancybox-outer', coming.wrap),
				inner : $('.fancybox-inner', coming.wrap)
			});

			$.each(["Top", "Right", "Bottom", "Left"], function(i, v) {
				coming.skin.css('padding' + v, getValue(coming.padding[ i ]));
			});

			F.trigger('onReady');

			// Check before try to load; 'inline' and 'html' types need content, others - href
			if (type === 'inline' || type === 'html') {
				if (!coming.content || !coming.content.length) {
					return F._error( 'content' );
				}

			} else if (!href) {
				return F._error( 'href' );
			}

			if (type === 'image') {
				F._loadImage();

			} else if (type === 'ajax') {
				F._loadAjax();

			} else if (type === 'iframe') {
				F._loadIframe();

			} else {
				F._afterLoad();
			}
		},

		_error: function ( type ) {
			$.extend(F.coming, {
				type       : 'html',
				autoWidth  : true,
				autoHeight : true,
				minWidth   : 0,
				minHeight  : 0,
				scrolling  : 'no',
				hasError   : type,
				content    : F.coming.tpl.error
			});

			F._afterLoad();
		},

		_loadImage: function () {
			// Reset preload image so it is later possible to check "complete" property
			var img = F.imgPreload = new Image();

			img.onload = function () {
				this.onload = this.onerror = null;

				F.coming.width  = this.width;
				F.coming.height = this.height;

				F._afterLoad();
			};

			img.onerror = function () {
				this.onload = this.onerror = null;

				F._error( 'image' );
			};

			img.src = F.coming.href;

			if (img.complete !== true) {
				F.showLoading();
			}
		},

		_loadAjax: function () {
			var coming = F.coming;

			F.showLoading();

			F.ajaxLoad = $.ajax($.extend({}, coming.ajax, {
				url: coming.href,
				error: function (jqXHR, textStatus) {
					if (F.coming && textStatus !== 'abort') {
						F._error( 'ajax', jqXHR );

					} else {
						F.hideLoading();
					}
				},
				success: function (data, textStatus) {
					if (textStatus === 'success') {
						coming.content = data;

						F._afterLoad();
					}
				}
			}));
		},

		_loadIframe: function() {
			var coming = F.coming,
				iframe = $(coming.tpl.iframe.replace(/\{rnd\}/g, new Date().getTime()))
					.attr('scrolling', isTouch ? 'auto' : coming.iframe.scrolling)
					.attr('src', coming.href);

			// This helps IE
			$(coming.wrap).bind('onReset', function () {
				try {
					$(this).find('iframe').hide().attr('src', '//about:blank').end().empty();
				} catch (e) {}
			});

			if (coming.iframe.preload) {
				F.showLoading();

				iframe.one('load', function() {
					$(this).data('ready', 1);

					// iOS will lose scrolling if we resize
					if (!isTouch) {
						$(this).bind('load.fb', F.update);
					}

					// Without this trick:
					//   - iframe won't scroll on iOS devices
					//   - IE7 sometimes displays empty iframe
					$(this).parents('.fancybox-wrap').width('100%').removeClass('fancybox-tmp').show();

					F._afterLoad();
				});
			}

			coming.content = iframe.appendTo( coming.inner );

			if (!coming.iframe.preload) {
				F._afterLoad();
			}
		},

		_preloadImages: function() {
			var group   = F.group,
				current = F.current,
				len     = group.length,
				cnt     = current.preload ? Math.min(current.preload, len - 1) : 0,
				item,
				i;

			for (i = 1; i <= cnt; i += 1) {
				item = group[ (current.index + i ) % len ];

				if (item.type === 'image' && item.href) {
					new Image().src = item.href;
				}
			}
		},

		_afterLoad: function () {
			var coming   = F.coming,
				previous = F.current,
				placeholder = 'fancybox-placeholder',
				current,
				content,
				type,
				scrolling,
				href,
				embed;

			F.hideLoading();

			if (!coming || F.isActive === false) {
				return;
			}

			if (false === F.trigger('afterLoad', coming, previous)) {
				coming.wrap.stop(true).trigger('onReset').remove();

				F.coming = null;

				return;
			}

			if (previous) {
				F.trigger('beforeChange', previous);

				previous.wrap.stop(true).removeClass('fancybox-opened')
					.find('.fancybox-item, .fancybox-nav')
					.remove();
			}

			F.unbindEvents();

			current   = coming;
			content   = coming.content;
			type      = coming.type;
			scrolling = coming.scrolling;

			$.extend(F, {
				wrap  : current.wrap,
				skin  : current.skin,
				outer : current.outer,
				inner : current.inner,
				current  : current,
				previous : previous
			});

			href = current.href;

			switch (type) {
				case 'inline':
				case 'ajax':
				case 'html':
					if (current.selector) {
						content = $('<div>').html(content).find(current.selector);

					} else if (isQuery(content)) {
						if (!content.data(placeholder)) {
							content.data(placeholder, $('<div class="' + placeholder + '"></div>').insertAfter( content ).hide() );
						}

						content = content.show().detach();

						current.wrap.bind('onReset', function () {
							var query = (isQuery(content)) ? '#' + content.attr('id') : content;
							if ($(this).find(query).length) {
								content.hide().replaceAll( content.data(placeholder) ).data(placeholder, false);
							}
						});
					}
				break;

				case 'image':
					content = current.tpl.image.replace('{href}', href);
				break;

				case 'swf':
					content = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + href + '"></param>';
					embed   = '';

					$.each(current.swf, function(name, val) {
						content += '<param name="' + name + '" value="' + val + '"></param>';
						embed   += ' ' + name + '="' + val + '"';
					});

					content += '<embed src="' + href + '" type="application/x-shockwave-flash" width="100%" height="100%"' + embed + '></embed></object>';
				break;
			}

			if (!(isQuery(content) && content.parent().length > 0 && content.parent().is(current.inner))) {
				current.inner.append( content );
			}

			// Give a chance for helpers or callbacks to update elements
			F.trigger('beforeShow');

			// Set scrolling before calculating dimensions
			current.inner.css('overflow', scrolling === 'yes' ? 'scroll' : (scrolling === 'no' ? 'hidden' : scrolling));

			// Set initial dimensions and start position
			F._setDimension();

			F.reposition();

			F.isOpen = false;
			F.coming = null;

			F.bindEvents();

			if (!F.isOpened) {
				$('.fancybox-wrap').not( current.wrap ).stop(true).trigger('onReset').remove();

			} else if (previous.prevMethod) {
				F.transitions[ previous.prevMethod ]();
			}

			F.transitions[ F.isOpened ? current.nextMethod : current.openMethod ]();

			F._preloadImages();
		},

		_setDimension: function () {
			var viewport   = F.getViewport(),
				steps      = 0,
				canShrink  = false,
				canExpand  = false,
				wrap       = F.wrap,
				skin       = F.skin,
				inner      = F.inner,
				current    = F.current,
				width      = current.width,
				height     = current.height,
				minWidth   = current.minWidth,
				minHeight  = current.minHeight,
				maxWidth   = current.maxWidth,
				maxHeight  = current.maxHeight,
				scrolling  = current.scrolling,
				scrollOut  = current.scrollOutside ? current.scrollbarWidth : 0,
				margin     = current.margin,
				wMargin    = getScalar(margin[1] + margin[3]),
				hMargin    = getScalar(margin[0] + margin[2]),
				wPadding,
				hPadding,
				wSpace,
				hSpace,
				origWidth,
				origHeight,
				origMaxWidth,
				origMaxHeight,
				ratio,
				width_,
				height_,
				maxWidth_,
				maxHeight_,
				iframe,
				body;

			// Reset dimensions so we could re-check actual size
			wrap.add(skin).add(inner).width('auto').height('auto').removeClass('fancybox-tmp');

			wPadding = getScalar(skin.outerWidth(true)  - skin.width());
			hPadding = getScalar(skin.outerHeight(true) - skin.height());

			// Any space between content and viewport (margin, padding, border, title)
			wSpace = wMargin + wPadding;
			hSpace = hMargin + hPadding;

			origWidth  = isPercentage(width)  ? (viewport.w - wSpace) * getScalar(width)  / 100 : width;
			origHeight = isPercentage(height) ? (viewport.h - hSpace) * getScalar(height) / 100 : height;

			if (current.type === 'iframe') {
				iframe = current.content;

				if (current.autoHeight && iframe.data('ready') === 1) {
					try {
						if (iframe[0].contentWindow.document.location) {
							inner.width( origWidth ).height(9999);

							body = iframe.contents().find('body');

							if (scrollOut) {
								body.css('overflow-x', 'hidden');
							}

							origHeight = body.height();
						}

					} catch (e) {}
				}

			} else if (current.autoWidth || current.autoHeight) {
				inner.addClass( 'fancybox-tmp' );

				// Set width or height in case we need to calculate only one dimension
				if (!current.autoWidth) {
					inner.width( origWidth );
				}

				if (!current.autoHeight) {
					inner.height( origHeight );
				}

				if (current.autoWidth) {
					origWidth = inner.width();
				}

				if (current.autoHeight) {
					origHeight = inner.height();
				}

				inner.removeClass( 'fancybox-tmp' );
			}

			width  = getScalar( origWidth );
			height = getScalar( origHeight );

			ratio  = origWidth / origHeight;

			// Calculations for the content
			minWidth  = getScalar(isPercentage(minWidth) ? getScalar(minWidth, 'w') - wSpace : minWidth);
			maxWidth  = getScalar(isPercentage(maxWidth) ? getScalar(maxWidth, 'w') - wSpace : maxWidth);

			minHeight = getScalar(isPercentage(minHeight) ? getScalar(minHeight, 'h') - hSpace : minHeight);
			maxHeight = getScalar(isPercentage(maxHeight) ? getScalar(maxHeight, 'h') - hSpace : maxHeight);

			// These will be used to determine if wrap can fit in the viewport
			origMaxWidth  = maxWidth;
			origMaxHeight = maxHeight;

			if (current.fitToView) {
				maxWidth  = Math.min(viewport.w - wSpace, maxWidth);
				maxHeight = Math.min(viewport.h - hSpace, maxHeight);
			}

			maxWidth_  = viewport.w - wMargin;
			maxHeight_ = viewport.h - hMargin;

			if (current.aspectRatio) {
				if (width > maxWidth) {
					width  = maxWidth;
					height = getScalar(width / ratio);
				}

				if (height > maxHeight) {
					height = maxHeight;
					width  = getScalar(height * ratio);
				}

				if (width < minWidth) {
					width  = minWidth;
					height = getScalar(width / ratio);
				}

				if (height < minHeight) {
					height = minHeight;
					width  = getScalar(height * ratio);
				}

			} else {
				width = Math.max(minWidth, Math.min(width, maxWidth));

				if (current.autoHeight && current.type !== 'iframe') {
					inner.width( width );

					height = inner.height();
				}

				height = Math.max(minHeight, Math.min(height, maxHeight));
			}

			// Try to fit inside viewport (including the title)
			if (current.fitToView) {
				inner.width( width ).height( height );

				wrap.width( width + wPadding );

				// Real wrap dimensions
				width_  = wrap.width();
				height_ = wrap.height();

				if (current.aspectRatio) {
					while ((width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight) {
						if (steps++ > 19) {
							break;
						}

						height = Math.max(minHeight, Math.min(maxHeight, height - 10));
						width  = getScalar(height * ratio);

						if (width < minWidth) {
							width  = minWidth;
							height = getScalar(width / ratio);
						}

						if (width > maxWidth) {
							width  = maxWidth;
							height = getScalar(width / ratio);
						}

						inner.width( width ).height( height );

						wrap.width( width + wPadding );

						width_  = wrap.width();
						height_ = wrap.height();
					}

				} else {
					width  = Math.max(minWidth,  Math.min(width,  width  - (width_  - maxWidth_)));
					height = Math.max(minHeight, Math.min(height, height - (height_ - maxHeight_)));
				}
			}

			if (scrollOut && scrolling === 'auto' && height < origHeight && (width + wPadding + scrollOut) < maxWidth_) {
				width += scrollOut;
			}

			inner.width( width ).height( height );

			wrap.width( width + wPadding );

			width_  = wrap.width();
			height_ = wrap.height();

			canShrink = (width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight;
			canExpand = current.aspectRatio ? (width < origMaxWidth && height < origMaxHeight && width < origWidth && height < origHeight) : ((width < origMaxWidth || height < origMaxHeight) && (width < origWidth || height < origHeight));

			$.extend(current, {
				dim : {
					width	: getValue( width_ ),
					height	: getValue( height_ )
				},
				origWidth  : origWidth,
				origHeight : origHeight,
				canShrink  : canShrink,
				canExpand  : canExpand,
				wPadding   : wPadding,
				hPadding   : hPadding,
				wrapSpace  : height_ - skin.outerHeight(true),
				skinSpace  : skin.height() - height
			});

			if (!iframe && current.autoHeight && height > minHeight && height < maxHeight && !canExpand) {
				inner.height('auto');
			}
		},

		_getPosition: function (onlyAbsolute) {
			var current  = F.current,
				viewport = F.getViewport(),
				margin   = current.margin,
				width    = F.wrap.width()  + margin[1] + margin[3],
				height   = F.wrap.height() + margin[0] + margin[2],
				rez      = {
					position: 'absolute',
					top  : margin[0],
					left : margin[3]
				};

			if (current.autoCenter && current.fixed && !onlyAbsolute && height <= viewport.h && width <= viewport.w) {
				rez.position = 'fixed';

			} else if (!current.locked) {
				rez.top  += viewport.y;
				rez.left += viewport.x;
			}

			rez.top  = getValue(Math.max(rez.top,  rez.top  + ((viewport.h - height) * current.topRatio)));
			rez.left = getValue(Math.max(rez.left, rez.left + ((viewport.w - width)  * current.leftRatio)));

			return rez;
		},

		_afterZoomIn: function () {
			var current = F.current;

			if (!current) {
				return;
			}

			F.isOpen = F.isOpened = true;

			F.wrap.css('overflow', 'visible').addClass('fancybox-opened');

			F.update();

			// Assign a click event
			if ( current.closeClick || (current.nextClick && F.group.length > 1) ) {
				F.inner.css('cursor', 'pointer').bind('click.fb', function(e) {
					if (!$(e.target).is('a') && !$(e.target).parent().is('a')) {
						e.preventDefault();

						F[ current.closeClick ? 'close' : 'next' ]();
					}
				});
			}

			// Create a close button
			if (current.closeBtn) {
				$(current.tpl.closeBtn).appendTo(F.skin).bind('click.fb', function(e) {
					e.preventDefault();

					F.close();
				});
			}

			// Create navigation arrows
			if (current.arrows && F.group.length > 1) {
				if (current.loop || current.index > 0) {
					$(current.tpl.prev).appendTo(F.outer).bind('click.fb', F.prev);
				}

				if (current.loop || current.index < F.group.length - 1) {
					$(current.tpl.next).appendTo(F.outer).bind('click.fb', F.next);
				}
			}

			F.trigger('afterShow');

			// Stop the slideshow if this is the last item
			if (!current.loop && current.index === current.group.length - 1) {
				F.play( false );

			} else if (F.opts.autoPlay && !F.player.isActive) {
				F.opts.autoPlay = false;

				F.play();
			}
		},

		_afterZoomOut: function ( obj ) {
			obj = obj || F.current;

			$('.fancybox-wrap').trigger('onReset').remove();

			$.extend(F, {
				group  : {},
				opts   : {},
				router : false,
				current   : null,
				isActive  : false,
				isOpened  : false,
				isOpen    : false,
				isClosing : false,
				wrap   : null,
				skin   : null,
				outer  : null,
				inner  : null
			});

			F.trigger('afterClose', obj);
		}
	});

	/*
	 *	Default transitions
	 */

	F.transitions = {
		getOrigPosition: function () {
			var current  = F.current,
				element  = current.element,
				orig     = current.orig,
				pos      = {},
				width    = 50,
				height   = 50,
				hPadding = current.hPadding,
				wPadding = current.wPadding,
				viewport = F.getViewport();

			if (!orig && current.isDom && element.is(':visible')) {
				orig = element.find('img:first');

				if (!orig.length) {
					orig = element;
				}
			}

			if (isQuery(orig)) {
				pos = orig.offset();

				if (orig.is('img')) {
					width  = orig.outerWidth();
					height = orig.outerHeight();
				}

			} else {
				pos.top  = viewport.y + (viewport.h - height) * current.topRatio;
				pos.left = viewport.x + (viewport.w - width)  * current.leftRatio;
			}

			if (F.wrap.css('position') === 'fixed' || current.locked) {
				pos.top  -= viewport.y;
				pos.left -= viewport.x;
			}

			pos = {
				top     : getValue(pos.top  - hPadding * current.topRatio),
				left    : getValue(pos.left - wPadding * current.leftRatio),
				width   : getValue(width  + wPadding),
				height  : getValue(height + hPadding)
			};

			return pos;
		},

		step: function (now, fx) {
			var ratio,
				padding,
				value,
				prop       = fx.prop,
				current    = F.current,
				wrapSpace  = current.wrapSpace,
				skinSpace  = current.skinSpace;

			if (prop === 'width' || prop === 'height') {
				ratio = fx.end === fx.start ? 1 : (now - fx.start) / (fx.end - fx.start);

				if (F.isClosing) {
					ratio = 1 - ratio;
				}

				padding = prop === 'width' ? current.wPadding : current.hPadding;
				value   = now - padding;

				F.skin[ prop ](  getScalar( prop === 'width' ?  value : value - (wrapSpace * ratio) ) );
				F.inner[ prop ]( getScalar( prop === 'width' ?  value : value - (wrapSpace * ratio) - (skinSpace * ratio) ) );
			}
		},

		zoomIn: function () {
			var current  = F.current,
				startPos = current.pos,
				effect   = current.openEffect,
				elastic  = effect === 'elastic',
				endPos   = $.extend({opacity : 1}, startPos);

			// Remove "position" property that breaks older IE
			delete endPos.position;

			if (elastic) {
				startPos = this.getOrigPosition();

				if (current.openOpacity) {
					startPos.opacity = 0.1;
				}

			} else if (effect === 'fade') {
				startPos.opacity = 0.1;
			}

			F.wrap.css(startPos).animate(endPos, {
				duration : effect === 'none' ? 0 : current.openSpeed,
				easing   : current.openEasing,
				step     : elastic ? this.step : null,
				complete : F._afterZoomIn
			});
		},

		zoomOut: function () {
			var current  = F.current,
				effect   = current.closeEffect,
				elastic  = effect === 'elastic',
				endPos   = {opacity : 0.1};

			if (elastic) {
				endPos = this.getOrigPosition();

				if (current.closeOpacity) {
					endPos.opacity = 0.1;
				}
			}

			F.wrap.animate(endPos, {
				duration : effect === 'none' ? 0 : current.closeSpeed,
				easing   : current.closeEasing,
				step     : elastic ? this.step : null,
				complete : F._afterZoomOut
			});
		},

		changeIn: function () {
			var current   = F.current,
				effect    = current.nextEffect,
				startPos  = current.pos,
				endPos    = { opacity : 1 },
				direction = F.direction,
				distance  = 200,
				field;

			startPos.opacity = 0.1;

			if (effect === 'elastic') {
				field = direction === 'down' || direction === 'up' ? 'top' : 'left';

				if (direction === 'down' || direction === 'right') {
					startPos[ field ] = getValue(getScalar(startPos[ field ]) - distance);
					endPos[ field ]   = '+=' + distance + 'px';

				} else {
					startPos[ field ] = getValue(getScalar(startPos[ field ]) + distance);
					endPos[ field ]   = '-=' + distance + 'px';
				}
			}

			// Workaround for http://bugs.jquery.com/ticket/12273
			if (effect === 'none') {
				F._afterZoomIn();

			} else {
				F.wrap.css(startPos).animate(endPos, {
					duration : current.nextSpeed,
					easing   : current.nextEasing,
					complete : F._afterZoomIn
				});
			}
		},

		changeOut: function () {
			var previous  = F.previous,
				effect    = previous.prevEffect,
				endPos    = { opacity : 0.1 },
				direction = F.direction,
				distance  = 200;

			if (effect === 'elastic') {
				endPos[ direction === 'down' || direction === 'up' ? 'top' : 'left' ] = ( direction === 'up' || direction === 'left' ? '-' : '+' ) + '=' + distance + 'px';
			}

			previous.wrap.animate(endPos, {
				duration : effect === 'none' ? 0 : previous.prevSpeed,
				easing   : previous.prevEasing,
				complete : function () {
					$(this).trigger('onReset').remove();
				}
			});
		}
	};

	/*
	 *	Overlay helper
	 */

	F.helpers.overlay = {
		defaults : {
			closeClick : true,  // if true, fancyBox will be closed when user clicks on the overlay
			speedOut   : 200,   // duration of fadeOut animation
			showEarly  : true,  // indicates if should be opened immediately or wait until the content is ready
			css        : {},    // custom CSS properties
			locked     : !isTouch,  // if true, the content will be locked into overlay
			fixed      : true   // if false, the overlay CSS position property will not be set to "fixed"
		},

		overlay : null,   // current handle
		fixed   : false,  // indicates if the overlay has position "fixed"

		// Public methods
		create : function(opts) {
			opts = $.extend({}, this.defaults, opts);

			if (this.overlay) {
				this.close();
			}

			this.overlay = $('<div class="fancybox-overlay"></div>').appendTo( 'body' );
			this.fixed   = false;

			if (opts.fixed && F.defaults.fixed) {
				this.overlay.addClass('fancybox-overlay-fixed');

				this.fixed = true;
			}
		},

		open : function(opts) {
			var that = this;

			opts = $.extend({}, this.defaults, opts);

			if (this.overlay) {
				this.overlay.unbind('.overlay').width('auto').height('auto');

			} else {
				this.create(opts);
			}

			if (!this.fixed) {
				W.bind('resize.overlay', $.proxy( this.update, this) );

				this.update();
			}

			if (opts.closeClick) {
				this.overlay.bind('click.overlay', function(e) {
					if ($(e.target).hasClass('fancybox-overlay')) {
						if (F.isActive) {
							F.close();
						} else {
							that.close();
						}
					}
				});
			}

			this.overlay.css( opts.css ).show();
		},

		close : function() {
			$('.fancybox-overlay').remove();

			W.unbind('resize.overlay');

			this.overlay = null;

			if (this.margin !== false) {
				$('body').css('margin-right', this.margin);

				this.margin = false;
			}

			if (this.el) {
				this.el.removeClass('fancybox-lock');
			}
		},

		// Private, callbacks

		update : function () {
			var width = '100%', offsetWidth;

			// Reset width/height so it will not mess
			this.overlay.width(width).height('100%');

			// jQuery does not return reliable result for IE
			if (IE) {
				offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);

				if (D.width() > offsetWidth) {
					width = D.width();
				}

			} else if (D.width() > W.width()) {
				width = D.width();
			}

			this.overlay.width(width).height(D.height());
		},

		// This is where we can manipulate DOM, because later it would cause iframes to reload
		onReady : function (opts, obj) {
			$('.fancybox-overlay').stop(true, true);

			if (!this.overlay) {
				this.margin = D.height() > W.height() || $('body').css('overflow-y') === 'scroll' ? $('body').css('margin-right') : false;
				this.el     = document.all && !document.querySelector ? $('html') : $('body');

				this.create(opts);
			}

			if (opts.locked && this.fixed) {
				obj.locked = this.overlay.append( obj.wrap );
				obj.fixed  = false;
			}

			if (opts.showEarly === true) {
				this.beforeShow.apply(this, arguments);
			}
		},

		beforeShow : function(opts, obj) {
			if (obj.locked) {
				this.el.addClass('fancybox-lock');

				if (this.margin !== false) {
					$('body').css('margin-right', getScalar( this.margin ) + obj.scrollbarWidth);
				}
			}

			this.open(opts);
		},

		onUpdate : function() {
			if (!this.fixed) {
				this.update();
			}
		},

		afterClose: function (opts) {
			// Remove overlay if exists and fancyBox is not opening
			// (e.g., it is not being open using afterClose callback)
			if (this.overlay && !F.isActive) {
				this.overlay.fadeOut(opts.speedOut, $.proxy( this.close, this ));
			}
		}
	};

	/*
	 *	Title helper
	 */

	F.helpers.title = {
		defaults : {
			type     : 'float', // 'float', 'inside', 'outside' or 'over',
			position : 'bottom' // 'top' or 'bottom'
		},

		beforeShow: function (opts) {
			var current = F.current,
				text    = current.title,
				type    = opts.type,
				title,
				target;

			if ($.isFunction(text)) {
				text = text.call(current.element, current);
			}

			if (!isString(text) || $.trim(text) === '') {
				return;
			}

			title = $('<div class="fancybox-title fancybox-title-' + type + '-wrap">' + text + '</div>');

			switch (type) {
				case 'inside':
					target = F.skin;
				break;

				case 'outside':
					target = F.wrap;
				break;

				case 'over':
					target = F.inner;
				break;

				default: // 'float'
					target = F.skin;

					title.appendTo('body');

					if (IE) {
						title.width( title.width() );
					}

					title.wrapInner('<span class="child"></span>');

					//Increase bottom margin so this title will also fit into viewport
					F.current.margin[2] += Math.abs( getScalar(title.css('margin-bottom')) );
				break;
			}

			title[ (opts.position === 'top' ? 'prependTo'  : 'appendTo') ](target);
		}
	};

	// jQuery plugin initialization
	$.fn.fancybox = function (options) {
		var index,
			that     = $(this),
			selector = this.selector || '',
			run      = function(e) {
				var what = $(this).blur(), idx = index, relType, relVal;

				if (!(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) && !what.is('.fancybox-wrap')) {
					relType = options.groupAttr || 'data-fancybox-group';
					relVal  = what.attr(relType);

					if (!relVal) {
						relType = 'rel';
						relVal  = what.get(0)[ relType ];
					}

					if (relVal && relVal !== '' && relVal !== 'nofollow') {
						what = selector.length ? $(selector) : that;
						what = what.filter('[' + relType + '="' + relVal + '"]');
						idx  = what.index(this);
					}

					options.index = idx;

					// Stop an event from bubbling if everything is fine
					if (F.open(what, options) !== false) {
						e.preventDefault();
					}
				}
			};

		options = options || {};
		index   = options.index || 0;

		if (!selector || options.live === false) {
			that.unbind('click.fb-start').bind('click.fb-start', run);

		} else {
			D.undelegate(selector, 'click.fb-start').delegate(selector + ":not('.fancybox-item, .fancybox-nav')", 'click.fb-start', run);
		}

		this.filter('[data-fancybox-start=1]').trigger('click');

		return this;
	};

	// Tests that need a body at doc ready
	D.ready(function() {
		if ( $.scrollbarWidth === undefined ) {
			// http://benalman.com/projects/jquery-misc-plugins/#scrollbarwidth
			$.scrollbarWidth = function() {
				var parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body'),
					child  = parent.children(),
					width  = child.innerWidth() - child.height( 99 ).innerWidth();

				parent.remove();

				return width;
			};
		}

		if ( $.support.fixedPosition === undefined ) {
			$.support.fixedPosition = (function() {
				var elem  = $('<div style="position:fixed;top:20px;"></div>').appendTo('body'),
					fixed = ( elem[0].offsetTop === 20 || elem[0].offsetTop === 15 );

				elem.remove();

				return fixed;
			}());
		}

		$.extend(F.defaults, {
			scrollbarWidth : $.scrollbarWidth(),
			fixed  : $.support.fixedPosition,
			parent : $('body')
		});
	});

}(window, document, jQuery));

/*
 * jQuery Cookies - https://github.com/panzi/jQuery-Cookies
 * License - Public Domain
 */
(function ($, undefined) {
	function get(name) {
		var cookies = {};
		if (document.cookie) {
			var values = document.cookie.split(/; */g);
			for (var i = 0; i < values.length; ++ i) {
				var value = values[i];
				var pos = value.search('=');
				var key;

				if (pos < 0) {
					key = decodeURIComponent(value);
					value = undefined;
				}
				else {
					key = decodeURIComponent(value.slice(0, pos));
					value = decodeURIComponent(value.slice(pos + 1));
				}

				cookies[key] = value;
			}
		}

		if (name === undefined) {
			return cookies;
		}
		else {
			return cookies[name];
		}
	}

	function set(name, value, expires, path, domain, secure) {
		switch (arguments.length) {
		case 1:
			for (var key in name) {
				set(key, name[key]);
			}
			return;
		case 2:
			if (value && typeof(value) === 'object') {
				expires = value.expires;
				path = value.path;
				domain = value.domain;
				secure = value.secure;
				value = value.value;
			}
		}

		if (value === null || value === undefined) {
			expires = -1;
		}

		var buf = [encodeURIComponent(name) + '=' + encodeURIComponent(value)];
		switch (typeof(expires)) {
		case 'string':
			expires = new Date(expires);
		case 'object':
			buf.push('expires=' + expires.toUTCString());
			break;
		case 'boolean':
			if (expires) {
				break;
			}
			expires = 365 * 2000;
		case 'number':
			var date = new Date();
			date.setTime(date.getTime() + (1000 * 60 * 60 * 24 * expires));
			buf.push('expires=' + date.toUTCString());
			break;
		}

		if (path === true) {
			buf.push('path=' + document.location.pathname);
		}
		else if (path !== undefined && path !== false) {
			buf.push('path=' + path.replace(/[;\s]/g, encodeURIComponent));
		}

		if (domain === true) {
			//buf.push('domain=' + document.location.host);
			buf.push('domain=' + document.location.host);
		}
		else if (domain !== undefined && domain !== false) {
			buf.push('domain=' + domain.replace(/[;\s]/g, encodeURIComponent));
		}

		if (secure) {
			buf.push('secure');
		}

		document.cookie = buf.join('; ');
	}

	$.cookie = function () {
		switch (arguments.length) {
		case 0:
			return get();
		case 1:
			if (typeof(arguments[0]) !== 'object') {
				return get(arguments[0]);
			}
		case 2:
		case 3:
		case 4:
		case 5:
		case 6:
			set.apply(this, arguments);
			return this;
		default:
			throw new Error('Illegal number of arguments');
		}
	};
})(jQuery);

var Base64 = (function() {
	"use strict";

	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	var _utf8_encode = function (string) {
		var utftext = "", c, n;
		string = string.replace(/\r\n/g,"\n");
		for (n = 0; n < string.length; n++) {
			c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	};

	var _utf8_decode = function (utftext) {
		var string = "", i = 0, c = 0, c1 = 0, c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if((c > 191) && (c < 224)) {
				c1 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
				i += 2;
			} else {
				c1 = utftext.charCodeAt(i+1);
				c2 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
				i += 3;
			}
		}
		return string;
	};

	var _hexEncode = function(input) {
		var output = '', i;
		for(i = 0; i < input.length; i++) {
			output += input.charCodeAt(i).toString(16);
		}
		return output;
	};

	var _hexDecode = function(input) {
		var output = '', i;
		if(input.length % 2 > 0) {
			input = '0' + input;
		}
		for(i = 0; i < input.length; i = i + 2) {
			output += String.fromCharCode(parseInt(input.charAt(i) + input.charAt(i + 1), 16));
		}
		return output;
	};

	var encode = function (input) {
		var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
		input = _utf8_encode(input);
		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output += _keyStr.charAt(enc1);
			output += _keyStr.charAt(enc2);
			output += _keyStr.charAt(enc3);
			output += _keyStr.charAt(enc4);

		}
		return output;
	};

	var decode = function (input) {
		var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {

			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			enc3 = _keyStr.indexOf(input.charAt(i++));
			enc4 = _keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output += String.fromCharCode(chr1);

			if (enc3 !== 64) {
				output += String.fromCharCode(chr2);
			}
			if (enc4 !== 64) {
				output += String.fromCharCode(chr3);
			}

		}

		return _utf8_decode(output);
	};

	var decodeToHex = function(input) {
		return _hexEncode(decode(input));
	};

	var encodeFromHex = function(input) {
		return encode(_hexDecode(input));
	};

	return {
		'encode': encode,
		'decode': decode,
		'decodeToHex': decodeToHex,
		'encodeFromHex': encodeFromHex
	};
}());

// stardevelop.com Live Help International Copyright 2003-2012
// Live Help JavaScript v4.0 - Requires: jQuery 1.50.0 or above

var LiveHelp = (function (window, document, $, undefined) {
	'use strict';
	/*global LiveHelpSettings:true, currentUser:true, buzz:true, Crypto:true */

	var prefix = 'LiveHelp',
		protocol = ('https:' === document.location.protocol ? 'https://' : 'http://'),
		server = (typeof LiveHelpSettings !== 'undefined') ? LiveHelpSettings.server : document.location.host + document.location.pathname.substring(0, document.location.pathname.indexOf('/livehelp')),
		selector = '#' + prefix,
		opts = {
			protocol: protocol,
			server: protocol + server + '/livehelp/',
			domain: document.location.host.replace('www.', ''),
			department: '',
			template: '',
			locale: 'en',
			embedded: false,
			inviteTab: false,
			initiate: true,
			initiateDelay: 0,
			css: true,
			fonts: true,
			session: '',
			security: '',
			popup: false,
			visitorTracking: null,
			plugin: '',
			name: '',
			custom: '',
			email: '',
			connected: false,
			hideOffline: true
		},
		notifyTimer,
		message = 0,
		messageSound,
		newMessages = 0,
		currentlyTyping = 0,
		title = '',
		titleTimer,
		operator = '',
		popup,
		popupPosition = {left: 0, top: 0},
		size = '',
		initiateTimer,
		initiateStatus = '',
		initiateMargin = {left: 10, top: 10},
		initiateSize = {width: 323, height: 229},
		targetX,
		targetY,
		browserSize = {width: 0, height: 0},
		visitorTimer,
		visitorTimeout = false,
		visitorInit = 0,
		visitorRefresh = 15 * 1000,
		loadTime = $.now(),
		pageTime,
		cookies = {session: $.cookie(prefix + 'Session')},
		settings = {user: 'Guest', visitorTracking: true},
		storage = {tabOpen: false, operatorDetailsOpen: true, soundEnabled: true, notificationEnabled: true, chatEnded: false, department: '', messages: 0, lastMessage: 0},
		callTimer = '',
		callConnectedTimer,
		callStatus,
		cloud = false;

	// Button Events
	if (jQuery.isFunction(jQuery().on)) {
		$(document).on('click', '.' + prefix + 'Button', function () {
			openLiveHelp($(this));
			return false;
		});
		
		$(document).on('click', '.' + prefix + 'CallButton', function () {
			openLiveHelp($(this), '', 'call.php');
			return false;
		});
		
		$(document).on('click', '.' + prefix + 'OfflineButton', function () {
			openEmbeddedOffline();
			return false;
		});
	} else {
		$('.' + prefix + 'Button').live('click', function () {
			openLiveHelp($(this));
			return false;
		});
		
		$('.' + prefix + 'CallButton').live('click', function () {
			openLiveHelp($(this), '', 'call.php');
			return false;
		});
		
		$('.' + prefix + 'OfflineButton').live('click', function () {
			openEmbeddedOffline();
			return false;
		});
	}

	$.preloadImages = function () {
		for (var i = 0; i < arguments.length; i++) {
			$('<img>').attr('src', arguments[i]);
		}
	};

	function overrideSettings() {
		// Update Settings
		if (typeof LiveHelpSettings !== 'undefined') {
			opts = $.extend(opts, LiveHelpSettings);
		}
		
		// Override Server
		opts.server = opts.protocol + server + '/livehelp/';
	}
	
	// Override Settings
	overrideSettings();

	function updateSettings(success) {
		var data = { JSON: '' },
			session = cookies.session;
		
		// Cookies
		if (session !== undefined && session.length > 0) {
			data.SESSION = session;
		}
		
		// Override Language
		if (LiveHelpSettings !== undefined && LiveHelpSettings.locale !== undefined) {
			data.LANGUAGE = LiveHelpSettings.locale;
		}
		
		// Department
		if (opts.department !== undefined && opts.department.length > 0) {
			data.DEPARTMENT = opts.department;
		}

		$.ajax({
			url: opts.server + 'include/settings.php',
			data: $.param(data),
			success: function (data, textStatus, jqXHR) {
				
				// Update Server Settings
				settings = data;
				
				// Update Session
				if (settings.session.length > 0) {
					cookies.session = settings.session;
				} else if (opts.popup && opts.session.length > 0) {
					cookies.session = opts.session;
				}

				// Override Language
				if (opts.language !== undefined && !$.isEmptyObject(opts.language)) {
					settings.language = $.extend(settings.language, opts.language);
				}

				// Override Visitor Tracking
				opts.visitorTracking = (opts.visitorTracking != null && opts.visitorTracking === false) ? false : settings.visitorTracking;
					
				// Offline Email Redirection
				if (settings.offlineRedirect !== '') {
					if (/^(?:^[\-!#$%&'*+\\.\/0-9=?A-Z\^_`a-z{|}~]+@[\-!#$%&'*+\\\/0-9=?A-Z\^_`a-z{|}~]+\.[\-!#$%&'*+\\.\/0-9=?A-Z\^_`a-z{|}~]+$)$/i.test(settings.offlineRedirect)) {
						settings.offlineRedirect = 'mailto:' + settings.offlineRedirect;
					}
					settings.offlineEmail = 0;
				}
				
				// Settings Updated
				$(document).trigger('LiveHelp.SettingsUpdated');
				
				// Initiate Chat
				if (settings.initiate) {
					displayInitiateChat();
				}

				// Smilies
				if (settings.smilies) {
					$(selector + 'SmiliesButton').show();
				} else {
					$(selector + 'SmiliesButton').hide();
				}

				// Update Window Size
				updateChatWindowSize();
					
				// Departments
				updateDepartments();
				
				// Callback
				if (success) {
					success();
				}
				
				// Login Details
				if (settings.user.length > 0) {
					$(selector + 'NameInput').val(settings.user);
				}
				if (settings.email.length > 0) {
					$(selector + 'EmailInput').val(settings.email);
				}
				if (settings.department.length > 0) {
					$(selector + 'DepartmentInput').val(settings.department);
				}
				
			},
			dataType: 'jsonp',
			cache: false,
			xhrFields: { withCredentials: true }
		});
	}

	function updateDepartments() {
		var field = 'DepartmentInput',
			options = '',
			department = $(selector + field),
			departments = settings.departments;
		
		if (departments.length > 0) {
			if (!department.find('option[value=""]').length) {
				options += '<option value=""></option>';
			}
			$.each(departments, function (index, value) {
				if (!department.find('option[value="' + departments[index] + '"]').length) {
					options += '<option value="' + departments[index] + '">' + departments[index] + '</option>';
				}
			});
			department.append(options);
			if (opts.department.length === 0) {
				$(selector + 'DepartmentLabel').show();
			}
		} else {
			$(selector + 'DepartmentLabel').hide();
		}
	}

	function ignoreDrag(e) {
		if (e.preventDefault) {
			e.preventDefault();
		}
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		if (e.dataTransfer !== undefined) {
			e.dataTransfer.dropEffect = 'copy';
		}
		return false;
	}

	function acceptDrop(e) {
		ignoreDrag(e.originalEvent);
		var dt = e.originalEvent.dataTransfer,
			files = dt.files;

		if (dt.files.length > 0) {
			var file = dt.files[0];
		}
	}

	// Update Window Size
	function updateChatWindowSize() {
		popupPosition.left = (window.screen.width - settings.popupSize.width) / 2;
		popupPosition.top = (window.screen.height - settings.popupSize.height) / 2;
		size = 'height=' + settings.popupSize.height + ',width=' + settings.popupSize.width + ',top=' + popupPosition.top + ',left=' + popupPosition.left + ',resizable=1,toolbar=0,menubar=0';
	}

	// Initiate Chat
	var targetY = 0, targetX = 0, Y = 0, X = 0, C = 0, D = 0, E = 0, F = 0;
	
	function updatePosition(selector) { 

		var obj = $(selector),
			offset = obj.offset(),
			currentY = offset.top,
			currentX = offset.left,
			now = new Date(),
			newTargetY = $(window).scrollTop() + initiateMargin.top,
			newTargetX = $(window).scrollLeft() + initiateMargin.left;
		
		if (currentY != newTargetY || currentX != newTargetX) { 
			if (targetY != newTargetY || targetX != newTargetX) { 
			
				targetY = newTargetY; targetX = newTargetX;
				
				now = new Date();
				Y = targetY - currentY; X = targetX - currentX;
				
				C = Math.PI / 2400; 
				D = now.getTime();
				if (Math.abs(Y) > browserSize.height) { 
					E = Y > 0 ? targetY - browserSize.height : targetY + browserSize.height;
					Y = Y > 0 ? browserSize.height : -browserSize.height;
				} else { 
					E = currentY;
				} 
				if (Math.abs(X) > browserSize.width) { 
					F = X > 0 ? targetX - browserSize.width : targetX + browserSize.width;
					X = X > 0 ? browserSize.width : -browserSize.width;
				} else { 
					F = currentX;
				}
				
			}
			
			// Update Positions
			now = new Date();
			var newY = Math.round(Y * Math.sin(C * (now.getTime() - D)) + E);
			var newX = Math.round(X * Math.sin(C * (now.getTime() - D)) + F);
			
			// Update Position
			if ((Y > 0 && newY > currentY) || (Y < 0 && newY < currentY)) {
				$(selector).css('top', newY + 'px');
			}
			if ((X > 0 && newX > currentX) || (X < 0 && newX < currentX)) {
				$(selector).css('left', newX + 'px');
			}
		}
	}

	function resetPosition() {

		var width = 0, height = 0,
			d = document.documentElement;
		
		width = window.innerWidth || (d && d.clientWidth) || d.body.clientWidth;
		height = window.innerHeight || (d && d.clientHeight) || d.body.clientHeight;
		browserSize.width = width;
		browserSize.height = height;
		
		if (settings !== undefined && settings.initiateAlign !== undefined) {
			if (settings.initiateAlign.x === 'right') {
				initiateMargin.left = width - initiateSize.width - 30;
			} else if (settings.initiateAlign.x == 'middle') {
				initiateMargin.left = Math.round((width - 20) / 2) - Math.round(initiateSize.width / 2);
			}
			if (settings.initiateAlign.y === 'bottom') {
				initiateMargin.top = height - initiateSize.height - 85;
			} else if (settings.initiateAlign.y == 'center') {
				initiateMargin.top = Math.round((height - 20) / 2) - Math.round(initiateSize.height / 2);
			}
		}

	}

	function bounceNotification() {
		var notify = (opts.chatBubbles) ? $('.LiveChatOperator .OperatorImage') : $(selector + 'Notification');
		if (newMessages > 0 && !$.data(notify, 'bouncing') && parseInt($(selector + 'Embedded').css('bottom'), 10) < -1) {
			$.data(notify, 'bouncing', true);
			notify.effect('bounce', { times: 3, distance: 25 }, 600, function () {
				$.data(notify, 'bouncing', false);
			});
		}
	}

	function showNotification() {
		if (storage.notificationEnabled) {
			if (newMessages > 0) {
				var text = (newMessages > 99) ? '...' : newMessages;
				$(selector + 'Notification span').text(text);
			}
			if (notifyTimer === undefined || notifyTimer === null) {
				notifyTimer = window.setInterval(function () {
					bounceNotification();
				}, 5000);
			}
			bounceNotification();
			if (messageSound !== undefined && storage.soundEnabled && storage.notificationEnabled) {
				messageSound.play();
			}
		}
	}

	function updateStorage() {
		$.jStorage.set(prefix, storage);
	}

	function hideNotification() {
		if (newMessages > 0) {
			newMessages = 0;
		}
		updateStorage();
		$(selector + 'Notification').fadeOut(250);
	}

	var opening = false;

	function openTab() {
	
		// Check Blocked Chat
		if (settings.blocked !== undefined && settings.blocked !== 0) {
			blockChat();
		}

		var embed = $(selector + 'Embedded');
		if (parseInt(embed.css('bottom'), 10) != -1 && !embed.data('closing') && !embed.data('opening') && opts.embedded === true) {

			// Load Sprites
			$('<img />').load(function () {
				// Add CSS
				$('<link href="' + opts.server + 'styles/sprite.css" rel="stylesheet" type="text/css"/>').appendTo('head');
			}).attr('src', opts.server + 'images/Sprite.png');

			// Setup Sounds
			if (messageSound === undefined) {
				messageSound = new buzz.sound(opts.server + 'sounds/Pending Chat', {
					formats: ['ogg', 'mp3', 'wav'],
					volume: 100
				});
			}

			// Guest Details
			if (settings.loginDetails === 0) {
				initEmbeddedInitiateChat();
			}

			newMessages = 0;
			window.clearTimeout(notifyTimer);
			notifyTimer = null;
			hideNotification();
			embed.data('opening', true);
			embed.animate({ bottom: -1 }, 1000, 'easeInOutQuad', function () {
				initDepartments();
				$(this).data('opening', false)
			});
			$(selector + 'CloseButton').removeClass('expand'); //.fadeIn(250);
		}
	}

	function closeTab(complete) {
		$(selector + 'Embedded').data('closing', true);
		$(selector + 'SmiliesButton').close();
		$(selector + 'Embedded').animate({ bottom: -415 }, 1000, 'easeInOutQuad', function () {
			if (settings.currentStatus == 'Online') {
				$(selector + 'CallAction').fadeIn(250);
			}
			if (complete) {
				complete.call();
			}
			$(this).data('closing', false);
		});
		$(selector + 'CloseButton').addClass('expand'); //.fadeOut(250);

		// Embedded Initiate Chat
		if ($(selector + 'Embedded').attr('data-opened')) {
			updateInitiateStatus('Declined');
		}
	}

	function hideOperatorDetails() {
		var body = $(selector + 'Body'),
			top = parseInt(body.css('top'), 10);

		if (top == 86) {
			var height = $(selector + 'Scroll').height();
			body.animate({ top: 36 }, 500, 'easeInOutQuad', function () {
				$(selector + 'CollapseButton').removeClass('Collapse').addClass('Expand').attr('title', settings.language.expand);
			});
			$(selector + 'Scroll').animate({ height: height + 50 }, 500, 'easeInOutQuad');
		}
	}

	function showOperatorDetails(id, name, depmnt) {
		var scroll = $(selector + 'Scroll'),
			department = (depmnt !== undefined) ? depmnt : storage.department;

		if (id !== undefined && name !== undefined) {
			var url = opts.server + 'image.php',
				query = {SIZE: 40};

			if (opts.connected) {
				$(selector + 'Toolbar').show();
				$(selector + 'Typing span').text(name + ' ' + settings.language.istyping);
			}

			if (opts.chatBubbles) {
				$('.LiveChatIcon').hide();
				$('.LiveChatOperator .OperatorImage').css('background', 'url(' + url + '?' + $.param({ID: id, SIZE: 50}) + ') no-repeat');
				$(selector + 'StatusText').text(name.substring(0, name.indexOf(' ')));
				$(selector + 'CollapseButton').hide();
				$('.LiveChatOperator, .LiveChatOperator .OperatorImage').fadeIn();
			} else {
				if (id > 0) {
					query = $.extend(query, {ID: id, DEPARTMENT: depmnt});
				}

				$(selector + 'OperatorImage').css('background', 'url(' + url + '?' + $.param(query) + ') #333 no-repeat');
				$(selector + 'OperatorName').text(name);
				$(selector + 'OperatorDepartment').text(department);
			}

		}
		
		if (storage.operatorDetailsOpen && $(selector + 'OperatorName').text().length > 0) {
			var top = parseInt($(selector + 'Body').css('top'), 10);
			if (top == 36) {
				var height = scroll.height();
				$(selector + 'Body').animate({ top: 86 }, 500, 'easeInOutQuad', function () {
					$(selector + 'CollapseButton').removeClass('Expand').addClass('Collapse').attr('title', settings.language.collapse);
				});
				scroll.animate({height: height - 50}, 500, 'easeInOutQuad');
			}
		}
		
	}

	function autoCollapseOperatorDetails() {
		var scroll = $(selector + 'Scroll'),
			body = $(selector + 'Body'),
			top = parseInt(body.css('top'), 10);
		
		if (top == 86) {
			if (scroll.get(0).scrollHeight > scroll.height()) {
				$(selector + 'CollapseButton').click();
			}
		}
	}

	function toggleSound() {
		var css = (storage.soundEnabled) ? 'SoundOn' : 'SoundOff',
			button = $(selector + 'SoundToolbarButton');
			
		if (button.length > 0) {
			button.removeClass('SoundOn SoundOff').addClass(css);
		}
	}

	function loadStorage() {
		var store = $.jStorage.get(prefix);
		if (store !== null) {
			storage = store;
			if (storage.tabOpen !== undefined && storage.tabOpen === true && (settings.currentStatus == 'Online' || settings.autoload !== 0)) {
				openTab();
			} else {
				closeTab();
			}
			if (storage.soundEnabled !== undefined) {
				toggleSound();
			} else {
				storage.soundEnabled = true;
			}
			if (settings.autoload !== 0) {
				if (storage.operatorDetailsOpen !== undefined && storage.operatorDetailsOpen) {
					showOperatorDetails();
				} else {
					hideOperatorDetails();
				}
			}
		}
	}

	var clickImage = function (id) {
		return function (eventObject) {
			$('#msg' + id + ' .fancybox').click();
		};
	};

	function scrollBottom() {
		var scroll = $(selector + 'Scroll');
		if (scroll) {
			scroll.scrollTo($(selector + 'MessagesEnd'));
		}
	}

	var displayImage = function (id) {
		return function (eventObject) {
			var output = '',
				width = $(selector + 'Messages').width(),
				displayWidth = width - 50,
				margin = [25, 25, 25, 25];
				
			if (this.width > displayWidth) {
				var aspect = displayWidth / this.width,
					displayHeight = this.height * aspect;
				output = '<div class="' + prefix + 'Image" style="position:relative; max-width:' + this.width + 'px; max-height:' + this.height + 'px; height:' + displayHeight + 'px; margin:5px"><div class="' + prefix + 'ImageZoom" style="position:absolute; opacity:0.5; top:0px; z-index:150; background:url(' + opts.server + 'images/Magnify.png) center center no-repeat; max-width:' + this.width + 'px; max-height:' + this.height + 'px; width:' + displayWidth + 'px; height:' + displayHeight + 'px"></div><div class="' + prefix + 'ImageHover" style="position:absolute; top:0px; z-index:100; background:#fff; opacity:0.25; max-width:' + this.width + 'px; max-height:' + this.height + 'px; width:' + displayWidth + 'px; height:' + displayHeight + 'px"></div><div style="position:absolute; top:0px;"><a href="' + this.src + '" class="fancybox"><img src="' + this.src + '" alt="Received Image" style="width:' + displayWidth + 'px; max-width:' + this.width + 'px; max-height:' + this.height + 'px"></a></div>';
			} else {
				output = '<img src="' + this.src + '" alt="Received Image" style="max-width:' + this.width + 'px; margin:5px">';
			}
			$('#msg' + id).append(output);
			output = '';
			scrollBottom();
			if (!opts.popup) {
				margin = [25, 405, 25, 25];
			}
			$('#msg' + id + ' .fancybox').fancybox({ openEffect: 'elastic', openEasing: 'easeOutBack', closeEffect: 'elastic', closeEasing: 'easeInBack', margin: margin });
			$('.' + prefix + 'ImageZoom').hover(function () {
				$('.' + prefix + 'ImageHover').fadeTo(250, 0);
				$(this).fadeTo(250, 1.0);
			}, function () {
				$('.' + prefix + 'ImageHover').fadeTo(250, 0.25);
				$(this).fadeTo(250, 0.75);
			});
			$('.' + prefix + 'ImageZoom').click(clickImage(id));
			if (messageSound !== undefined && storage.soundEnabled && storage.notificationEnabled) {
				messageSound.play();
			}
			window.focus();
		};
	};

	function htmlSmilies(message) {
		if (settings.smilies) {
			var smilies = [
					{ regex: /:D/g, css: 'Laugh' },
					{ regex: /:\)/g, css: 'Smile' },
					{ regex: /:\(/g, css: 'Sad' },
					{ regex: /\$\)/g, css: 'Money' },
					{ regex: /&gt;:O/g, css: 'Angry' },
					{ regex: /:P/g, css: 'Impish' },
					{ regex: /:\\/g, css: 'Sweat' },
					{ regex: /8\)/g, css: 'Cool' },
					{ regex: /&gt;:L/g, css: 'Frown' },
					{ regex: /;\)/g, css: 'Wink' },
					{ regex: /:O/g, css: 'Surprise' },
					{ regex: /8-\)/g, css: 'Woo' },
					{ regex: /8-O/g, css: 'Shock' },
					{ regex: /xD/g, css: 'Hysterical' },
					{ regex: /:-\*/g, css: 'Kissed' },
					{ regex: /:S/g, css: 'Dizzy' },
					{ regex: /\+O\)/g, css: 'Celebrate' },
					{ regex: /&lt;3/g, css: 'Adore' },
					{ regex: /zzZ/g, css: 'Sleep' },
					{ regex: /:X/g, css: 'Stop' },
					{ regex: /X-\(/g, css: 'Tired' }
				];
			
			for (var i = 0; i < smilies.length; i++) {
				var smilie = smilies[i];
				message = message.replace(smilie.regex, '<span title="' + smilie.css + '" class="sprite ' + smilie.css + 'Small Smilie"></span>');
			}
		}
		return message;
	}

	function openPUSH(message) {
		var parent = window.opener;
		if (parent) {
			parent.location.href = message;
			parent.focus();
		}
	}

	function display(id, username, message, align, status) {
		var output = '',
			messages = $(selector + 'Messages');
		
		if (messages && message !== null && !storage.chatEnded && $('#msg' + id).length === 0) {
			var alignment = 'left',
				color = '#000',
				rtl = '';
			
			if (id == -2) {
				$(selector + 'Waiting, .LiveHelp.Connecting').fadeOut(250);
				if (storage.operatorDetailsOpen !== undefined && storage.operatorDetailsOpen) {
					$(selector + 'CollapseButton').click();
				}
				if (queued.length > 0) {
					sendMessage(queued[0]);
				}
			}
			if (align == '2') {
				alignment = 'center';
			} else if (align == '3') {
				alignment = 'right';
			}
			if (status == '0') {
				color = '#666';
			}
			if ($(selector + 'Toolbar').is(':hidden') && !storage.chatEnded && !opts.chatBubbles) {
				$(selector + 'Toolbar, ' + selector + 'CollapseButton').fadeIn(250);
			}

			if (settings.rtl === true) {
				rtl = '; text-align: right'
			}

			output += '<div id="msg' + id + '" style="color:' + color + rtl + '">';
			if (status == '0' || status == '1' || status == '2' || status == '7') { // Operator, Link, Mobile Device Messages
				if (!$.isEmptyObject(username)) {
					output += username + ' ' + settings.language.says + ':<br/>';
					if (status > 0) {
						operator = username;
					}
				}

				// Check RTL Language
				if (alignment == 'left' && settings.rtl === true) {
					alignment = 'right';
				}

				message = message.replace(/([a-z0-9][a-z0-9_\.\-]{0,}[a-z0-9]@[a-z0-9][a-z0-9_\.\-]{0,}[a-z0-9][\.][a-z0-9]{2,4})/g, '<div style="margin-top:5px"><a href="mailto:$1" class="message">$1</a></div>');
				var regEx = /^.*((youtu.be\/)|(v\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/i,
					match = regEx.exec(message),
					width = messages.width();
				if (match !== null && match.length > 6) {
					var videoid = match[6];
					alignment = 'left';
					if (status == 2) {
						var size = {width: 260, height: 195},
							css = 'message-video fancybox.iframe',
							path = 'embed/',
							target = 'self';
						if (opts.popup) {
							size = {width: 480, height: 360};
							css = 'message-video-popup';
							path = 'watch?v=';
							target = 'blank';
						}
						message = '<a href="http://www.youtube.com/' + path + videoid + '" target="_' + target + '" class="' + css + '"><div style="position:relative; height:' + size.height + 'px; margin:5px; color: ' + color + '"><div class="' + prefix + 'VideoZoom noresize" style="position:absolute; opacity:0.5; top:0px; z-index:150; background:url(' + opts.server + 'images/Play.png) center center no-repeat; max-width:' + size.width + 'px; width:' + size.width + 'px; height:' + size.height + 'px"></div><div class="' + prefix + 'VideoHover noresize" style="position:absolute; top:0px; z-index:100; background:#fff; opacity:0.25; max-width:' + size.width + 'px; width:' + size.width + 'px; height:' + size.height + 'px"></div><div style="position:absolute; top:0px;"><img src="http://img.youtube.com/vi/' + videoid + '/0.jpg" alt="YouTube Video" class="noresize" style="width:' + size.width + 'px; max-width:' + width + 'px"></div></div></a>';
					} else {
						message = message.replace(/((?:(?:http(?:s?))|(?:ftp)):\/\/[^\s|<|>|'|\"]*)/g, '<a href="$1" target="_blank" class="message-link fancybox.iframe">$1</a>');
						message = htmlSmilies(message);
						message = '<div style="text-align:' + alignment + '; margin-left:15px; color: ' + color + '">' + message + '</div>';
					}
					output += message;
				} else {
					message = message.replace(/((?:(?:http(?:s?))|(?:ftp)):\/\/[^\s|<|>|'|\"]*)/g, '<a href="$1" target="_blank" class="message">$1</a>');
					message = htmlSmilies(message);
					output += '<div style="text-align:' + alignment + '; margin-left:15px; color: ' + color + '">' + message + '</div>';
				}
			} else if (status == '3') { // Image
				message = message.replace(/((?:(?:http(?:s?))):\/\/[^\s|<|>|'|\"]*)/g, '<img src="$1" alt="Received Image">');
				var result = message.match(/((?:(?:http(?:s?))):\/\/[^\s|<|>|'|"]*)/g);
				if (result !== null) {
					if (username !== '') {
						output += username + ' ' + settings.language.says + ':<br/>';
					}
					$('<img />').load(displayImage(id)).attr('src', result);
				} else {
					output += message;
				}
			} else if (status == '4') { // PUSH
				openPUSH(message);
				output += '<div style="margin-top:5px">' + settings.language.pushedurl + ', <a href="' + message + '" target="_blank" class="message">' + message + '</a> ' + settings.language.opennewwindow + '</div>';
			} else if (status == '5') { // JavaScript
				(new Function(message))();
			} else if (status == '6') { // File Transfer
				output += settings.language.sentfile + ' <a href="' + message + '" target="' + prefix + 'FileDownload">' + settings.language.startdownloading + '</a> ' + settings.language.rightclicksave;
			}
			output += '</div>';
			
			$(selector + 'Waiting, .LiveHelp.Connecting').fadeOut(250);
			/* TODO Continue Waiting Timer
			if (settings.offlineEmail && $(selector + 'Continue').length > 0) {
				$(selector + 'Continue').fadeOut(250);
				clearTimeout(continueTimer);
			}
			*/
		}
		return output;
	}

	function showTitleNotification() {
		var state = false;
		
		function updateTitle() {
			var newTitle = state ? title : operator + ' messaged you';
			$(document).attr('title', newTitle);
			state = !state;
		}
		
		if (titleTimer === null) {
			titleTimer = window.setInterval(updateTitle, 2000);
		}
	}

	function hideTitleNotification() {
		window.clearInterval(titleTimer);
		titleTimer = null;
		if (title.length > 0) {
			$(document).attr('title', title);
		}
	}

	function updateTyping(data) {
		var typing = (data.typing !== undefined) ? data.typing : false,
			obj = $(selector + 'Typing');
		if (typing) {
			obj.show();
		} else {
			obj.hide();
		}
	}

	(function loadMessages() {
		
		if (storage.chatEnded) {
			window.setTimeout(loadMessages, 1500);
			return;
		}
		
		if (opts.connected && settings.language !== undefined) {
			var data = { TIME: $.now(), LANGUAGE: settings.locale, MESSAGE: message },
				session = cookies.session;
				
			if (currentlyTyping == 1) {
				data.TYPING = currentlyTyping;
			}

			// Cookies
			if (session !== undefined && session.length > 0) {
				data = $.extend(data, { SESSION: session });
			}
			
			$.jsonp({url: opts.server + 'refresher.php?callback=?',
				data: $.param(data),
				success: function (data) {
					var lastID = 0,
						margin = [25, 25, 25, 25];
					if (data !== null && data !== '') {
						if (data.messages !== undefined && data.messages.length > 0) {
						
							// Output Messages
							var html = '';
							$.each(data.messages, function (index, msg) {
								html += display(msg.id, msg.username, msg.content, msg.align, msg.status);
								lastID = msg.id;
								if (msg.status > 0) {
									newMessages++;
								}
							});
							
							if (html.length > 0) {
								if (!storage.chatEnded && !opts.chatBubbles) {
									$(selector + 'CollapseButton').fadeIn(250);
								}
								$(selector + 'Messages').append(html);

								autoCollapseOperatorDetails();

								if (!opts.popup) {
									margin = [25, 405, 25, 25];
								}

								$('.message-link, .message-video').fancybox({ openEffect: 'elastic', openEasing: 'easeOutBack', closeEffect: 'elastic', closeEasing: 'easeInBack', margin: margin });
								$('.' + prefix + 'VideoZoom').hover(function () {
									$('.' + prefix + 'VideoHover').fadeTo(250, 0);
									$(this).fadeTo(250, 1.0);
								}, function () {
									$('.' + prefix + 'VideoHover').fadeTo(250, 0.25);
									$(this).fadeTo(250, 0.75);
								});

								scrollBottom();

								if (!window.isActive && message > 0) {
									showTitleNotification();
								}

								if (lastID > storage.lastMessage) {
									var bottom = parseInt($(selector + 'Embedded').css('bottom'), 10);
									if (!storage.chatEnded && bottom == -415) {
										if (newMessages > 0) {
											showNotification();
										}
									} else {
										newMessages = 0;
										if (messageSound !== undefined && !storage.chatEnded && storage.soundEnabled && (opts.popup || storage.notificationEnabled)) {
											messageSound.play();
										}
									}
								}
							
							}
						}
						updateTyping(data);
					} else {
						updateTyping(false);
					}
					
					if (lastID > 0) {
						message = lastID;
					}

					// Store Last Message
					if (lastID > storage.lastMessage) {
						storage.lastMessage = lastID;
						updateStorage();
					}
					
					window.setTimeout(loadMessages, 1500);
				},
				error: function () {
					//$.ajax({ url: opts.server + 'include/error.php', data: { source: 'jQuery', text: 'loadMessages() Error Event', file:'jquery.livehelp.js', error:textStatus }, dataType: 'jsonp', cache: false, xhrFields: { withCredentials: true } });
					window.setTimeout(loadMessages, 1500);
				}
			});
		} else {
			window.setTimeout(loadMessages, 1500);
		}

	})();

	function showChat() {
		if (!storage.chatEnded) {
			var embed = $(selector + 'Embedded'),
				inputs = $(selector + 'Login #Inputs'),
				connecting = $(selector + 'Login #Connecting');
		
			// Connecting
			if ($(selector + 'SignIn').is(':visible')) {
				inputs.hide();
				connecting.show();

				// Load Sprites
				$('<img />').load(function () {
					// Add CSS
					$('<link href="' + opts.server + 'styles/sprite.min.css" rel="stylesheet" type="text/css"/>').appendTo('head');

					$(selector + 'SignIn').hide();
					$(selector + 'SignedIn, ' + selector + 'Waiting').show();
					$(selector + 'Body, ' + selector + 'Background').css('background-color', '#fff');
					$(selector + 'Input').animate({ bottom: 0 }, 500, 'easeInOutQuad');
				
					if (embed.is(':hidden')) {
						$(selector + 'Waiting, .LiveHelp.Connecting').hide();
						embed.fadeIn(50, function () {
							$(selector + 'CallAction').fadeIn(50);
						});
						loadStorage();
					}
				}).attr('src', opts.server + 'images/Sprite.png');
			}
		}
	}

	function showRating() {
		var id = 'Rating',
			element = '#' + prefix + id;
		
		if ($(element).length === 0) {
			var ratingHtml = '<div id="' + prefix + 'Feedback' + id + '">' + settings.language.rateyourexperience + ':<br/> \
		<div id="' + prefix + id + '"> \
			<div class="' + id + ' VeryPoor" title="Very Poor"></div> \
			<div class="' + id + ' Poor" title="Poor"></div> \
			<div class="' + id + ' Good" title="Good"></div> \
			<div class="' + id + ' VeryGood" title="Very Good"></div> \
			<div class="' + id + ' Excellent" title="Excellent"></div> \
		</div> \
	</div>';
		
			$(selector + 'Messages').append(ratingHtml);
		
			// Rating Events
			var rating = $(element);
			rating.find('.' + id).hover(function () {
				var i = $(this).index();
				rating.find(':lt(' + i + 1 + ')').css('background-position', '0 -32px').parent().find(':gt(' + i + ')').css('background-position', '0 0');
			}, function () {
				var i = $(this).index() + 1;
				rating.find(':lt(' + i + ')').css('background-position', '0 0');
				rating.find('div').each(function () {
					if ($.data(this, 'selected')) {
						$(this).css('background-position', '0 -16px');
					}
				});
			}).click(function () {
				var i = $(this).index(),
					data = { RATING: i + 1 };
					
				if (cookies.session !== undefined && cookies.session.length > 0) {
					data = $.extend(data, { SESSION: cookies.session });
				}
				rating.find(':lt(' + i + 1 + ')').data('selected', true).css('background-position', '0 -16px');
				rating.find(':gt(' + i + ')').data('selected', false).css('background-position', '0 0');
				$.ajax({ url: opts.server + 'logout.php', data: $.param(data), dataType: 'jsonp', cache: false, xhrFields: { withCredentials: true } });
			});
			
			scrollBottom();
		} else {
			$(selector + 'Scroll').scrollTo($(selector + 'FeedbackRating'));
		}
	}

	function updateImageTitle() {
		$('.' + prefix + 'Status').each(function () {
		
			// Title / Alt Attributes
			var status = settings.currentStatus;
			if (status == 'BRB') {
				status = 'Be Right Back';
			}
			$(this).attr('title', 'Live Help - ' + status).attr('alt', 'Live Help - ' + status);
		});
	}

	// Change Status Image
	var settingsRefreshed = false;
	function changeStatus(status) {
		var embed = $(selector + 'Embedded'),
			action = $(selector + 'CallAction'),
			invite = $('.' + prefix + 'Invite');
		
		function updateEmbeddedStatus() {
			invite.show();
			if (opts.embedded === true && embed.length > 0) {
				if (!opts.connected) {
					embed.find(selector + 'StatusText').text(settings.language.online);
				}
				embed.find('.LiveChatIcon').removeClass('offline');
				embed.find('.CloseButton').fadeIn(250);
				embed.fadeIn(50, function () {
					if (settings.autoload !== 0) {
						showChat();
						opts.connected = true;
					}
					action.fadeIn(50);
				});
			}
		}

		$('.LiveHelpTextStatus').each(function (index, value) {
			$(this).text(status);
		});
		
		if (settings.departments.length > 0 && opts.department.length > 0 && $.inArray(opts.department, settings.departments) < 0) {
			status = 'Offline';
		}
		
		if (status == 'Online') {
			if (!settingsRefreshed) {
				updateSettings(function (data, textStatus, jqXHR) {
						updateEmbeddedStatus();
					}
				);
				settingsRefreshed = true;
			} else {
				updateEmbeddedStatus();
			}
		} else {
			settingsRefreshed = false;
			if (!settings.autoload !== 0) {
				invite.hide();
				if (embed.length > 0) {
					if (opts.connected) {
						updateEmbeddedStatus();
					} else {
						if (opts.hideOffline == true) {
							embed.fadeOut(50).css('z-index', '10000000');
							action.fadeOut(50);
						} else {
							embed.find(selector + 'StatusText').text(settings.language.offline);
							embed.find('.LiveChatIcon').addClass('offline');
							embed.find('.CloseButton').fadeOut(250);
							embed.fadeIn(50).css('z-index', '5000');
							action.fadeIn(50);

							// Close Tab
							storage.tabOpen = false;
							closeTab();
							updateStorage();
						}
					}
				}
			}

			// Initiate Chat
			if (status != 'Online' && $(selector + 'InitiateChat').is(':visible')) {
				$(selector + 'InitiateChat').fadeOut();
			}
		}
		
		if (settings.currentStatus !== '' && settings.currentStatus != status) {

			// jQuery Status Mode Trigger
			$(document).trigger('LiveHelp.StatusModeChanged', [status]);
			
			// Update Status
			settings.currentStatus = status;
		
			$('.' + prefix + 'Status').each(function () {
				var statusURL = $(this).attr('src'),
					regEx = /^[^?#]+\?([^#]+)/i,
					match = regEx.exec(statusURL),
					query = '?_=' + $.now();
				if (match !== null) {
					query = '?' + match[1] + '&_=' + $.now();
				}
				
				// Update Status Image
				$(this).attr('src', opts.server + 'include/status.php' + query);
				
				// Title / Alt Attributes
				updateImageTitle();
				
			});
			
		}
	}

	function getTimezone() {
		var datetime = new Date();
		if (datetime) {
			return datetime.getTimezoneOffset();
		} else {
			return '';
		}
	}

	function updateInitiateStatus(status) {
		// Update Initiate Chat Status
		initiateStatus = status;
		visitorTimeout = false;
		if (status == 'Accepted' || status == 'Declined') {
			$(selector + 'InitiateChat').fadeOut(250);
		}
		clearTimeout(visitorTimer);
		trackVisit();
	}

	function initEmbeddedInitiateChat() {

		$(selector + 'SignIn').hide();
		$(selector + 'SignedIn').show();
		$(selector + 'Body, ' + selector + 'Background').css('background-color', '#fff');
		$(selector + 'Input').animate({ bottom: 0 }, 500, 'easeInOutQuad');

		var message = settings.language.initiatechatquestion;
		var html = '<div class="InitiateChat"> \
<div style="margin:0 0 5px 15px; color: #000">' + message + '</div></div> \
<div class="LiveHelp Connecting" style="height: 125px; display:none; text-align:center"> \
	<div style="margin-top:50px; left:15px"> \
		<div style="font-family:RobotoLight, sans-serif; padding-top:30px; text-shadow:0 0 1px #ccc; letter-spacing:-1px; font-size:22px; line-height:normal; color:#999">' + settings.language.connecting + '</div> \
	</div> \
</div> \
</div>';

		$(selector + 'Messages').append(html);
		$(selector + 'Waiting').hide();

		storage.operatorDetailsOpen = true;
		var op = settings.embeddedinitiate;
		if (op.id > 0) {
			if (opts.department !== undefined && opts.department.length > 0) {
				var departments = op.department.split(';');
				$.each(departments, function (key, value) {
					if ($.trim(value) == $.trim(opts.department)) {
						op.department = $.trim(value);
						return;
					}
				});
			}
			showOperatorDetails(op.id, op.name, op.department);
		}
	}

	function displayInitiateChat() {

		function showInitiateChat() {
			var id = selector + 'InitiateChat',
				initiate = $(id);
			
			if (opts.initiate && settings.currentStatus !== undefined && settings.currentStatus == 'Online') {
				if (!opts.embedded) {
					if (initiate.length === 0) {
						// Initiate Chat
						var initiateChatHtml = '<div id="' + prefix + 'InitiateChat" align="left"> \
  <map name="' + prefix + 'InitiateChatMap" id="' + prefix + 'InitiateChatMap"> \
	<area shape="rect" coords="50,210,212,223" href="http://livehelp.stardevelop.com" target="_blank" alt="stardevelop.com Live Help"/> \
	<area shape="rect" coords="113,183,197,206" href="#" id="AcceptInitiateChat" alt="Accept" title="Accept"/> \
	<area shape="rect" coords="206,183,285,206" href="#" id="DeclineInitiateChat" alt="Decline" title="Decline"/> \
	<area shape="rect" coords="263,86,301,104" href="#" id="CloseInitiateChat" alt="Close" title="Close"/> \
  </map> \
  <div id="' + prefix + 'InitiateText" align="center">' + settings.language.initiatechatquestion + '</div> \
  <img src="' + opts.server + 'locale/' + settings.locale + '/images/InitiateChat.gif" alt="stardevelop.com Live Help" width="323" height="229" border="0" usemap="' + selector + 'InitiateChatMap"/></div>';
						
						$(initiateChatHtml).appendTo(document.body).ready(function () {
							$('#AcceptInitiateChat').click(function () {
								openLiveHelp();
								updateInitiateStatus('Accepted');
								return false;
							});
							$('#DeclineInitiateChat, #CloseInitiateChat').click(function () {
								updateInitiateStatus('Declined');
								return false;
							});
						});
					}
					
					visitorTimeout = false;
					if (initiate.length > 0 && opts.visitorTracking && !$.data(initiate, 'opened') && initiateStatus == '') {
						resetPosition();
						initiateTimer = window.setInterval(function () {
							updatePosition(id);
						}, 10);
						initiate.fadeIn(250);
						updateInitiateStatus('Opened');
						$.data(initiate, 'opened', true);
					}
				} else if (settings.embeddedinitiate !== undefined && settings.embeddedinitiate != null) {
					// Embedded Initiate Chat
					initiate = $(selector + 'Embedded');
					if (opts.visitorTracking && !$.data(initiate, 'initiate') && initiateStatus == '') {

						initEmbeddedInitiateChat();

						if (!$(selector + 'Embedded').data('closing')) {
							storage.tabOpen = true;
						}
						openTab();
						updateStorage();

						updateInitiateStatus('Opened');
						$.data(initiate, 'initiate', true);
						initiate.attr('data-opened', true);
					}
				}
			}
		}
		setTimeout(showInitiateChat, opts.initiateDelay);
	}

	function trackVisit() {

		clearTimeout(visitorTimer);

		if (opts.visitorTracking && !visitorTimeout) {
			var title = $(document).attr('title').substring(0, 150),
				timezone = getTimezone(),
				site = document.location.protocol + '//' + document.location.host,
				referrer,
				url = opts.server + 'include/status.php?callback=?',
				data = { JSON: '', INITIATE: initiateStatus },
				session = cookies.session;
	
			if (document.referrer.substring(0, site.length) === site.location) {
				referrer = '';
			} else {
				referrer = document.referrer;
			}

			if (opts.department !== undefined && opts.department.length > 0) {
				data = $.extend(data, { DEPARTMENT: opts.department });
			}

			// Track Visitor
			if (visitorInit === 0) {
				data = $.extend(data, { TITLE: title, URL: document.location.href, REFERRER: referrer, WIDTH: window.screen.width, HEIGHT: window.screen.height, TIME: + $.now() });
				
				// Plugin / Integration
				var plugin = opts.plugin;
				if (plugin.length > 0) {
					var id = opts.custom,
						name = opts.name;
					
					switch (plugin) {
					case 'Zendesk':
						if (typeof currentUser !== 'undefined' && currentUser.isEndUser === true && currentUser.id !== null) {
							id = currentUser.id;
							name = currentUser.name;
						}
						break;
					case 'WHMCS':
						if (id === undefined || id.length === 0) {
							id = $.cookie('WHMCSUID');
						}
						break;
					}
					
					if (id !== undefined && id.length > 0) {
						data = $.extend(data, { PLUGIN: plugin, CUSTOM: id });
					}
					if (name !== undefined && name.length > 0) {
						data = $.extend(data, { NAME: name });
					}
				}
				
				visitorInit = 1;
			}
			
			// Cookies
			if (session !== undefined) {
				data = $.extend(data, { SESSION: session });
			}
			data = $.toJSON(data);
			data = Base64.encode(data);

			// Visitor Tracking
			$.jsonp({
				url: url,
				data: {'DATA': data}, //$.param(data),
				success: function (data) {
					if (data !== null && data !== '') {
						if (data.session !== undefined && data.session.length > 0) {
							cookies.session = data.session;
							$.cookie(prefix + 'Session', cookies.session, true, '/', '.' + opts.domain);
						}
						if (data.status !== undefined && data.status.length > 0) {
							changeStatus(data.status);
						}
						if (data.initiate !== undefined && data.initiate) {
							displayInitiateChat();
						}
					}
					if (visitorInit === 0) {
						visitorInit = 1;
					}
					
					pageTime = $.now() - loadTime;
					if (pageTime < 90 * 60 * 1000) {
						visitorTimer = window.setTimeout(trackVisit, visitorRefresh);
					} else {
						visitorTimeout = true;
					}
				},
				error: function () {
					visitorTimer = window.setTimeout(trackVisit, visitorRefresh);
				}
			});
		
		} else {
			visitorTimer = window.setTimeout(trackVisit, 1);
		}

	}

	// Get URL Parameter
	function getParameterByName(url, name) {
		name = name.replace(/(\[|\])/g, '\\$1');
		var ex = '[\\?&]' + name + '=([^&#]*)',
			regex = new RegExp(ex),
			results = regex.exec(url);
		
		if (results === null) {
			return '';
		} else {
			return decodeURIComponent(results[1].replace(/\+/g, ' '));
		}
	}

	function offlineComplete() {
		var id = 'Offline';
		$('.' + prefix + id + 'Form').fadeOut(250, function () {
			$('.' + prefix + id + 'Sent').fadeIn(250);
		});
		if (opts.embedded) {
			$('.' + prefix + id + 'PoweredBy').css('right', '150px');
		}
		$(selector + id + 'Heading').html(settings.language.thankyoumessagesent).fadeIn(250);
	}

	function offlineSend() {
		var id = 'Offline',
			offline = '#' + prefix + id,
			form = $('#' + id + 'MessageForm'),
			data = form.serialize();
		
		if (opts.security.length > 0) {
			data += '&SECURITY=' + encodeURIComponent(opts.security);
		}
		if (cookies.session !== undefined && cookies.session.length > 0) {
			data += '&SESSION=' + encodeURIComponent(cookies.session);
		}
		data += '&JSON';
		
		$.ajax({url: opts.server + 'offline.php',
			data: data,
			success: function (data) {
			// Process JSON Errors / Result
				if (data.result !== undefined && data.result === true) {
					offlineComplete();
				} else {
					if (data.type !== undefined) {
						if (data.type == 'EMAIL') {
							$('#EmailError').removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
						}
						if (data.type == 'CAPTCHA') {
							$('#SecurityError').removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
						}
					}
					if (data.error !== undefined && data.error.length > 0) {
						$(offline + 'Description').hide();
						$(offline + 'Error span').html('Error: ' + data.error).parent().fadeIn(250);
					} else {
						$(offline + 'Error').fadeIn(250);
					}
				}
			},
			dataType: 'jsonp',
			cache: false,
			xhrFields: { withCredentials: true }
		});
	}

	function validateField(obj, id) {
		var value = (obj instanceof $) ? obj.val() : $(obj).val();
		if ($.trim(value) === '') {
			$(id).removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
			return false;
		} else {
			$(id).removeClass('CrossSmall').addClass('TickSmall').fadeIn(250);
			return true;
		}
	}
	
	function validateTelephone(obj, id) {
		var value = (obj instanceof $) ? obj.val() : $(obj).val();
		if ($.trim(value).length > 0 && /^[\d| |-|.]{3,}$/.test(value)) {
			$(id).removeClass('CrossSmall').addClass('TickSmall').fadeIn(250);
			return true;
		} else {
			$(id).removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
			return false;
		}
	}

	function validateEmail(obj, id) {
		var value = (obj instanceof $) ? obj.val() : $(obj).val();
		if (/^[\-!#$%&'*+\\.\/0-9=?A-Z\^_`a-z{|}~]+@[\-!#$%&'*+\\\/0-9=?A-Z\^_`a-z{|}~]+\.[\-!#$%&'*+\\.\/0-9=?A-Z\^_`a-z{|}~]+$/i.test(value)) {
			$(id).removeClass('CrossSmall').addClass('TickSmall').fadeIn(250);
			return true;
		} else {
			$(id).removeClass('TickSmall').addClass('CrossSmall').fadeIn(250);
			return false;
		}
	}

	function validateSecurity(obj, id, complete) {
		var field = (obj instanceof $) ? obj : $(obj),
		errorClass = 'CrossSmall',
		successClass = 'TickSmall',
		value = field.val(),
		data = { SECURITY: opts.security, CODE: value, JSON: '', EMBED: '' },
		validate = opts.security.substring(16, 56);
		
		function ajaxValidation() {
			$.ajax({ url: opts.server + 'security.php',
				data: $.param(data),
				success: function (data) {
					var error = '';
					if (data.result !== undefined) {
						// Process JSON Errors / Result
						if (data.result === true) {
							$(id).removeClass(errorClass).addClass(successClass).fadeIn(250);
							if (complete) {
								complete();
							}
						} else {
							error = 'CAPTCHA';
						}
						
					} else {
						error = 'CAPTCHA';
					}
					
					// Error Handling
					if (error.length > 0) {
						$(id).removeClass(successClass).addClass(errorClass).fadeIn(250);
						if (complete) {
							var field = $('#OfflineMessageForm').find(':input[id=' + error + '], textarea[id=' + error + ']');
							field.add(field.parent()).css('background-color', '#feeeee').css('border-color', '#fccece');
						}
					}
				},
				dataType: 'jsonp',
				cache: false,
				xhrFields: { withCredentials: true }
			});
		}
		
		if (field.length > 0) {
			if (value.length != 5) {
				if (value.length > 5) {
					field.val(value.substring(0, 5));
				}
				$(id).removeClass(successClass).addClass(errorClass).fadeIn(250);
				return false;
			} else {
				
				if (validate.length === 40) {
					// Validate Security Code
					if (validate === Crypto.SHA1(value.toUpperCase())) {
						$(id).removeClass(errorClass).addClass(successClass).fadeIn(250);
						if (complete) {
							complete();
						}
						return true;
					} else {
						return false;
					}
				} else {
					ajaxValidation(complete);
				}
			}
		} else {
			if (complete) {
				complete();
			}
			return true;
		}
	}

	function validateForm(form, callback) {
		var country = form.find('select[id=COUNTRY]'),
			telephone = form.find(':input[id=TELEPHONE]');
		
		if (!validateField(form.find(':input[id=NAME]'), '#NameError')) {
			return;
		} else if (!validateEmail(form.find(':input[id=EMAIL]'), '#EmailError')) {
			return;
		} else if (!validateField(form.find('textarea[id=MESSAGE]'), '#MessageError')) {
			return;
		}
		if (telephone.length > 0 && !validateField(telephone, '#TelephoneError')) {
			return;
		}
		validateSecurity(form.find(':input[id=CAPTCHA]'), '#SecurityError', function () {
			callback.call();
		});
	}

	function validateOfflineForm() {
		var form = $('#OfflineMessageForm');
		validateForm(form, offlineSend);
	}

	function resetSecurityCode(selector, form) {
		if (cookies.session !== null) {
			$.cookie(prefix + 'Session', cookies.session, true, '/', '.' + opts.domain);
		}
		form.find(':input[id=CAPTCHA]').val('');
		
		$.ajax({ url: opts.server + 'security.php',
			data: { RESET: '', JSON: '' },
			success: function (json) {
				if (json.captcha !== undefined) {
					opts.security = json.captcha;
					var data = '';
					if (opts.security.length > 0) {
						data = '&' + $.param($.extend(data, { SECURITY: encodeURIComponent(opts.security), RESET: '', EMBED: '' }));
					}
					$(selector + 'Security').attr('src', opts.server + 'security.php?' + $.now() + data);
				}
			},
			dataType: 'jsonp',
			cache: false,
			xhrFields: { withCredentials: true }
		});
		$('#SecurityError').fadeOut(250);
	}

	function initInputEvents(id, selector, form) {
	
		$(selector + 'Button, ' + selector + 'CloseButton').hover(function () {
			$(this).toggleClass(id + 'Button ' + id + 'ButtonHover');
		}, function () {
			$(this).toggleClass(id + 'Button ' + id + 'ButtonHover');
		});
		
		form.find(':input, textarea').focus(function () {
			$(this).add($(this).parent()).css('background-color', '#f2fbfe').css('border-color', '#d0e8f8');
		}).blur(function () {
			$(this).add($(this).parent()).css('background-color', '#fbfbfb').css('border-color', '#e5e5e5');
		});
		
		$(selector + 'SecurityRefresh').click(function () {
			resetSecurityCode(selector, form);
		});
		
		$(selector + 'Button').click(function () {
			validateOfflineForm();
		});
		
		$(selector + 'CloseButton').click(function () {
			if (opts.embedded) {
				$.fancybox.close();
			} else if (opts.popup) {
				window.close();
			}
		});

		$(selector + 'CloseBlockedButton').click(function () {
			if (opts.embedded) {
				storage.tabOpen = false;
				closeTab();
				updateStorage();
			} else if (opts.popup) {
				window.close();
			}
		});
		
		form.find(':input[id=NAME]').bind('keydown blur', function () {
			validateField(this, '#NameError');
		});
		
		form.find(':input[id=EMAIL]').bind('keydown blur', function () {
			validateEmail(this, '#EmailError');
		});
		
		form.find('textarea[id=MESSAGE]').bind('keydown blur', function () {
			validateField(this, '#MessageError');
		});
		
		form.find('select[id=COUNTRY]').bind('keydown blur', function () {
			validateField(this, '#CountryError');
		});
		
		form.find(':input[id=TELEPHONE]').bind('keydown blur', function () {
			validateTelephone(this, '#TelephoneError');
		});
		
		form.find(':input[id=CAPTCHA]').bind('keydown', function () {
			if ($(this).val().length > 5) {
				$(this).val($(this).val().substring(0, 5));
			}
		}).bind('keyup', function () {
			validateSecurity(this, '#SecurityError');
		});

		var speech = form.find('#MESSAGESPEECH'),
			obj = speech[0];

		if (obj !== undefined) {
			obj.onfocus = obj.blur;
			obj.onwebkitspeechchange = function(e) {
				form.find('#MESSAGE').val(speech.val());
				speech.val('');
			};
		}
	}

	function initOfflineEvents() {
		var id = 'Offline',
			selector = '#' + prefix + id,
			form = $('#' + id + 'MessageForm');
		
		initInputEvents(id, selector, form);
		$('<link href="' + opts.server + 'styles/sprite.min.css" rel="stylesheet" type="text/css"/>').appendTo('head');
	}

	(function checkCallStatus() {

		if (callTimer.length > 0) {
			var data = { SESSION: callTimer },
				timeout = 2000;
			$.ajax({
				url: opts.server + 'call.php?JSON',
				data: $.param(data),
				success: function (data, textStatus, jqXHR) {
					var status = -1;
					if (data.status !== undefined) {
						status = parseInt(data.status, 10);
					}
					updateCallStatus(status);
					if (status > 3) {
						timeout = 15000;
					}
					window.setTimeout(checkCallStatus, timeout);
				},
				error: function () {
					updateCallStatus(-1);
					window.setTimeout(checkCallStatus, 2000);
				},
				cache: false,
				xhrFields: { withCredentials: true }
			});
		} else {
			window.setTimeout(checkCallStatus, 2000);
		}

	})();

	function pad(number, length) {
		var str = '' + number;
		while (str.length < length) {
			str = '0' + str;
		}
		return str;
	}

	function startCallConnectedTimer() {
		resetCallConnectedTimer();
		var i = 0;
		var target = $('#CallStatusHeading');
		var timer = function updateTime() {
			i++;
			var minutes = (i > 59) ? parseInt(i / 60) : 0;
			var seconds = (i > 59) ? i % 60 : i;
			var output = pad(minutes, 2) + ':' + pad(seconds, 2);
			target.text('Connected - ' + output + 's');
		}
		callConnectedTimer = setInterval(timer, 1000);
	}
	
	function resetCallConnectedTimer() {
		clearInterval(callConnectedTimer);
	}

	function updateCallStatus(status) {
		var id = '#Call',
			selector = id + 'Status',
			heading = '',
			description = '',
			form = id + 'MessageForm ',
			country = $(form + 'select[id=COUNTRY]').val(),
			prefix = country.substring(country.indexOf('+')),
			telephone = prefix + ' ' + $(form + ':input[id=TELEPHONE]').val(),
			button = settings.language.cancel;
			
		switch(status) {
			case 0:
				heading = settings.language.pleasewait;
				description = settings.language.telephonecallshortly + '<br/>' + settings.language.telephonethankyoupatience;
				break;
			case 1:
				heading = 'Initalising';
				description = settings.language.telephonecallshortly + '<br/>' + settings.language.telephonethankyoupatience;
				break;
			case 2:
				heading = 'Initalised';
				description = settings.language.telephonecallshortly + '<br/>' + settings.language.telephonethankyoupatience;
				break;
			case 3:
				heading = 'Incoming Call';
				description = 'We are now calling you on ' + telephone + '.<br/>Please answer your telephone to chat with us.';
				break;
			case 4:
				heading = 'Connected';
				description = 'Call connected to ' + telephone + '.<br/>' + settings.language.telephonethankyoupatience;
				break;
			case 5:
				heading = 'Thank you';
				description = 'Your call has completed.<br/>Thank you for contacting us.';
				button = 'Close';
				break;
			case 6:
				heading = 'Line Busy';
				description = 'Service is temporarily busy.<br/>Please try again later.';
				break;
			default:
				heading = 'Unavailable';
				description = 'Service is temporarily unavailable.<br/>Please try again later.';
				break;
		}
		
		$(selector + 'Heading').text(heading);
		$(selector + 'Description').html(description);
		$(id + 'CancelButton div').text(button);
		
		if (status != callStatus) {
			if (status == 4) {
				startCallConnectedTimer();
			} else {
				resetCallConnectedTimer();
			}
			callStatus = status;
		}
		
	}

	function startCall() {

		var selector = '#CallMessageForm ',
			name = $(selector + ':input[id=NAME]').val(),
			email = $(selector + ':input[id=EMAIL]').val(),
			country = $(selector + 'select[id=COUNTRY]').val(),
			timezone = getTimezone(),
			prefix = country.substring(country.indexOf('+')),
			telephone = $(selector + ':input[id=TELEPHONE]').val(),
			message = $(selector + ':input[id=MESSAGE]').val(),
			captcha = $(selector + ':input[id=CAPTCHA]').val(),
			data = { NAME: name, EMAIL: email, COUNTRY: country, TIMEZONE: timezone, DIAL: prefix, TELEPHONE: telephone, MESSAGE: message, CAPTCHA: captcha, SECURITY: opts.security };
		
		$.fancybox.showLoading();
		$.ajax({
			url: opts.server + 'call.php',
			data: $.param(data),
			dataType: 'jsonp',
			success: function (data, textStatus, jqXHR) {
				if (data !== undefined && data.session !== undefined && data.session.length > 0) {
					$.fancybox({ href: '#CallDialog', type: 'inline', closeClick: false, nextClick: false, arrows: false, mouseWheel: false, keys: null, helpers: { overlay: { closeClick: false }, title: null } });
					callTimer = data.session;
				}
			},
			error: function () {
				updateStatus(-1);
			},
			cache: false,
			xhrFields: { withCredentials: true }
		});
	}

	function validateCallForm() {
		var form = $('#CallMessageForm');
		validateForm(form, startCall);
	}

	function initCallEvents () {
		var id = 'Call',
			selector = '#' + prefix + id,
			form = $('#' + id + 'MessageForm');
	
		initInputEvents(id, selector, form);
		
		$(selector + 'Button').click(function () {
			validateCallForm();
		});
		
		// Button Hover Events
		$('#' + id + 'CancelButton').hover(function () {
			var css = $(this).attr('id').replace('#' + id, '');
			$(this).toggleClass('#' + css + ' #' + css + 'Hover');
		}, function () {
			var css = $(this).attr('id').replace('#' + id, '');
			$(this).toggleClass('#' + css + ' #' + css + 'Hover');
		}).click(function () {
			// Cancel or Close Call
			if (callStatus == 5) {
				window.close();
			} else {
				// Cancel AJAX and Close Window
				var data = { SESSION: callTimer, STATUS: 5 };
				$.ajax({
					url: opts.server + 'call.php?JSON',
					data: $.param(data),
					success: function (data, textStatus, jqXHR) {
						window.close();
					},
					cache: false,
					xhrFields: { withCredentials: true }
				});
			}
		});
		
	}

	function openEmbeddedOffline(data) {
	
		if (cookies.session !== undefined && cookies.session.length > 0) {
			data = $.extend(data, { SESSION: cookies.session });
		} else {
			return;
		}

		// Language
		data = $.extend(data, { LANGUAGE: settings.locale });
	
		$.fancybox.showLoading();
		
		data = $.extend(data, { SERVER: opts.server, JSON: '', RESET: '', EMBED: '' });
		$.jsonp({url: opts.server + 'offline.php?callback=?&' + $.param(data),
			data: $.param(data),
			success: function (data) {
				if (data.captcha !== undefined) {
					opts.security = data.captcha;
				}
				if (data.html !== undefined) {
					$.fancybox.open({content: data.html, type: 'html', fitToView: false, closeClick: false, nextClick: false, arrows: false, mouseWheel: false, keys: null, helpers: { overlay: { css: { cursor: 'auto' }, closeClick: false }, title: null }, padding: 0, minWidth: 875, beforeShow: updateSettings, afterShow: initOfflineEvents});
				}
			}
		});
	}

	// Live Help Popup Window
	function openLiveHelp(obj, department, location, data) {
		var template = '',
			callback = false,
			status = settings.currentStatus;
		
		if (cookies.session !== undefined && cookies.session.length > 0) {
			data = $.extend(data, { SESSION: cookies.session });
		} else {
			return;
		}
		
		if (obj !== undefined && settings.templates.length > 0) {
			var css = obj.attr('class');
			if (css !== undefined) {
				template = css.split(' ')[1];
				if (template === undefined || $.inArray(template, settings.templates) < 0) {
					template = '';
				}
			}
			
			var src = obj.children('img.' + prefix + 'Status').attr('src');
			department = getParameterByName(src, 'DEPARTMENT');
		}

		// Language
		data = $.extend(data, { LANGUAGE: settings.locale, TIME: $.now() });
		
		// Callback
		if (obj !== undefined && obj.attr('class') !== undefined && obj.attr('class').indexOf('LiveHelpCallButton') != -1) {
			callback = true;
		}

		if (opts.embedded && !callback) {
		
			// Department
			if (opts.department.length > 0) {
				department = opts.department;
			}
		
			if (status == 'Online' || opts.connected) {
				var embed = $(selector + 'Embedded');
				if (parseInt(embed.css('bottom'), 10) != -1) {
					if (!$(selector + 'Embedded').data('closing')) {
						storage.tabOpen = true;
					}
					openTab();
				}
				updateStorage();
			} else {
				
				if (settings.offlineEmail === 0) {
					if (settings.offlineRedirect !== '') {
						document.location = settings.offlineRedirect;
					}
				} else {
					openEmbeddedOffline(data);
				}
				
			}
			return false;
		}
		
		// Department / Template
		if (department !== undefined && department !== '') {
			if ($.inArray(department, settings.departments) === -1) {
				status = 'Offline';
			}
			data = $.extend(data, { DEPARTMENT: department });
		}
		if (template !== undefined && template !== '') {
			data = $.extend(data, { TEMPLATE: template });
		}
		
		// Location
		if (location === undefined || location === '') {
			location = 'index.php';
		}
		
		if (status == 'Online') {
			
			// Name
			if (opts.name !== '') {
				data = $.extend(data, { NAME: settings.name });
			}
			// Email
			if (opts.email !== '') {
				data = $.extend(data, { EMAIL: settings.email });
			}

		} else {
		
			if (settings.offlineEmail === 0) {
				if (settings.offlineRedirect !== '') {
					document.location = settings.offlineRedirect;
				}
				return false;
			}
		}
		
		// Open Popup Window
		popup = window.open(opts.server + location + '?' + $.param(data), prefix, size);

		if (popup) {
			popup.opener = window;
		}
	}

	function startChat(validate) {
		var session = cookies.session,
			form = selector + 'LoginForm',
			name = $(selector + 'NameInput, ' + form + ' :input[id=NAME]'),
			department = $(selector + 'DepartmentInput, ' + form + ' select[id=DEPARTMENT], ' + form + ' input[id=DEPARTMENT]'),
			email = $(selector + 'EmailInput, ' + form + ' :input[id=EMAIL]'),
			question = $(selector + 'QuestionInput, ' + form + ' textarea[id=QUESTION]'),
			other = $(selector + 'OtherInput, ' + form + ' :input[id=OTHER]'),
			inputs = $(selector + 'Login #Inputs'),
			connecting = $(selector + 'Login #Connecting, .LiveHelp.Connecting');

		var overrideValidation = (validate !== undefined && validate == false) ? true : false;

		// Connecting
		inputs.hide();
		var progress = [];
		$.each(connecting, function (key, value) {
			var element = $(value);
			progress = element.find('div').first();
			if (progress.length > 0) {
				if (progress.find('img').length === 0) {
					progress.prepend('<img src="' + opts.server + 'images/ProgressRing.gif" style="opacity: 0.5"/>');
				}
			}
			element.show(); 
		});
			
		// Department
		if (opts.department.length > 0) {
			department.val(opts.department);
		}
		if (department.length > 0 && department.val() !== null) {
			storage.department = department.val();
			updateStorage();
		}
		
		if (settings.requireGuestDetails && !overrideValidation) {
			var errors = {name: true, email: true, department: true};

			errors.name = validateField(name, selector + 'NameError');
			if (settings.loginEmail) {
				errors.email = validateEmail(email, selector + 'EmailError');
			}
			
			if (settings.departments.length > 0) {
				var collapsed = department.data('collapsed');

				errors.department = validateField(department, selector + 'DepartmentError');
				if (!collapsed) {
					department.data('collapsed', true);
					department.animate({ width: department.width() - 35 }, 250);
				}
			}

			if (!errors.name || !errors.email || !errors.department) {
				connecting.hide();
				inputs.show();
				return;
			}
		}

		// Name
		if (name.val().length > 0) {
			settings.user = name.val();
		}
		
		// Input
		name = (name.length > 0) ? name.val() : '';
		department = (department.length > 0 && department.val() !== null) ? department.val() : '';
		email = (email.length > 0) ? email.val() : '';
		other = (other.length > 0) ? other.val() : '';
		question = (question.length > 0) ? question.val() : '';
		
		var data = { NAME: name, EMAIL: email, DEPARTMENT: department, QUESTION: question, OTHER: other, SERVER: document.location.host, JSON: '' };
		if (session !== null) {
			data = $.extend(data, { SESSION: session });
		}
		
		$.ajax({ url: opts.server + 'frames.php',
			data: $.param(data),
			success: function (data) {
				// Process JSON Errors / Chat ID
				if (data.error === undefined) {
					if (data.session !== undefined && data.session.length > 0) {

						$(document).trigger('LiveHelp.Connecting');
						
						$(selector + 'MessageTextarea').removeAttr('disabled');
						storage.chatEnded = false;
						updateStorage();
						showChat();
						if (settings.user.length > 0) {
							settings.user = data.user;
						}
						if (cookies.session !== null) {
							cookies.session = data.session;
							$.cookie(prefix + 'Session', cookies.session, true, '/', '.' + opts.domain);
						}
						if (opts.popup) {
							$(selector + 'Login').hide();
							$(selector + 'Chat').fadeIn(250);
							resizePopup();
						}
						opts.connected = true;
					}
					if (data.status !== undefined && data.status == 'Offline') {
						closeTab();
						var embed = $(selector + 'Embedded'),
							action = $(selector + 'CallAction');

						if (opts.hideOffline == true) {
							embed.fadeOut(250).css('z-index', '10000000');
							action.fadeOut(250);
						} else {
							embed.fadeIn(250).css('z-index', '5000');
							embed.find('.LiveChatIcon').addClass('offline');
							action.fadeIn(250);
							embed.find(selector + 'StatusText').text(settings.language.offline);
						}
						embed.find('.CloseButton').fadeOut(250);
					}
				} else {
					opts.connected = false;
				}
			},
			dataType: 'jsonp',
			cache: false,
			xhrFields: { withCredentials: true }
		});

	}

	function disconnectChat() {
		var type = 'jsonp';
		opts.connected = false;
		storage.chatEnded = true;
		storage.department = '';
		storage.lastMessage = 0;
		updateStorage();
		message = 0;
		closeTab(function () {
			hideOperatorDetails();
			if (opts.chatBubbles) {
				$('.LiveChatOperator .OperatorImage').hide();
				$(selector + 'StatusText').text(settings.currentStatus);
				$('.LiveChatIcon').fadeIn();
			}
			$(selector + 'Messages').html('');
			$(selector + 'SignedIn, ' + selector + 'Toolbar, ' + selector + 'CollapseButton').hide();
			$(selector + 'Body, ' + selector + 'Background').css('background-color', '#f9f6f6');
			$(selector + 'Input').animate({ bottom: -70 }, 500, 'easeInOutQuad');
			$(selector + 'SignIn, ' + selector + 'Waiting').show();
			$(selector + 'Login #Inputs').show();
			$(selector + 'Login #Connecting').hide();
		});
		if (opts.popup) {
			type = 'json';
		}
		$.ajax({ url: opts.server + 'logout.php',
			data: { SESSION: encodeURIComponent(cookies.session) },
			dataType: type,
			cache: false,
			xhrFields: { withCredentials: true },
			success: function (data) {
				if (opts.popup) {
					window.close();
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(textStatus);
			}
		});
		$.fancybox.close();
	}

	function typing(status) {
		if (status === true) {
			status = 1;
		} else {
			status = 0;
		}
		currentlyTyping = status;
	}

	function removeHTML(msg) {
		msg = msg.replace(/</g, '&lt;');
		msg = msg.replace(/>/g, '&gt;');
		msg = msg.replace(/\r\n|\r|\n/g, '<br />');
		return msg;
	}

	var displaySentMessage = function (msg) {
		return function (data, textStatus, XMLHttpRequest) {
			if (data !== null && data !== '') {
				if (data.id !== undefined && $('#msg' + data.id).length === 0) {
					var html = '<div id="msg' + data.id + '" align="left" style="color:#666">',
						username = (settings.user.length > 0) ? settings.user : 'Guest';
						
					html += username + ' ' + settings.language.says + ':<br/>';
					var message = removeHTML(msg);
					message = message.replace(/([a-z0-9][a-z0-9_\.\-]{0,}[a-z0-9]@[a-z0-9][a-z0-9_\.\-]{0,}[a-z0-9][\.][a-z0-9]{2,4})/g, '<a href="mailto:$1" class="message">$1</a>');
					message = message.replace(/((?:(?:http(?:s?))|(?:ftp)):\/\/[^\s|<|>|'|\"]*)/g, '<a href="$1" target="_blank" class="message">$1</a>');
					if (settings.smilies) {
						message = htmlSmilies(message);
					}
					html += '<div style="margin:0 0 0 15px; color: #666">' + message + '</div></div>';
					$(selector + 'Messages').append(html);
					autoCollapseOperatorDetails();
					scrollBottom();
				}
			}
		};
	};

	function sendMessage(message) {
		var data = { MESSAGE: message },
			url = opts.server + 'send.php',
			id = 'MessageTextarea',
			obj = $(selector + id);
		
		if (cookies.session !== undefined && cookies.session.length > 0) {
			data = $.extend(data, { SESSION: cookies.session});
			if (message === 0) {
				$.ajax({ url: url, data: $.param(data), dataType: 'jsonp', cache: false, xhrFields: { withCredentials: true } });
			} else {
				data.JSON = '';
				$.ajax({ url: url, data: $.param(data), success: displaySentMessage(message), dataType: 'jsonp', cache: false, xhrFields: { withCredentials: true } });
				typing(false);
			}
			obj.val('');
			$.jStorage.set('LiveHelp.MessageTextarea', '');
		}
	}

	var queued = [];
	function processForm() {
		var id = 'MessageTextarea',
			obj = $(selector + id),
			message = obj.val();

		if (!opts.connected) {
			startChat(false);
			if (queued.length == 0 && message !== '') {
				queued.push(message);
				obj.val('');
				$.jStorage.set('LiveHelp.MessageTextarea', '');
			}
			return;
		}

		if (message !== '') {
			sendMessage(message);
		}
		return false;
	}

	// Embedded Events
	function initEmbeddedEvents() {
		if ($(selector + 'Embedded').length > 0) {
		
			$(selector + 'Tab, ' + selector + 'StatusText, .LiveChatIcon, .OperatorImage, .LiveChatOperator').click(function () {
				opts.embedded = true;
				if (settings.currentStatus == 'Online' || opts.connected) {
					if (!$(selector + 'Embedded').data('closing')) {
						storage.tabOpen = true;
					}
					if (parseInt($(selector + 'Embedded').css('bottom'), 10) != -1) {
						storage.tabOpen = true;
						if (!storage.notificationEnabled) {
							storage.notificationEnabled = true;
						}
						openTab();
					} else {
						storage.tabOpen = false;
						closeTab();
					}
					updateStorage();
				} else {
					openLiveHelp();
				}
			});

			$(selector + 'StatusText, ' + '.LiveChatOperator, .OperatorImage, ' + selector + 'CloseButton').hover(function () {
				$(this).parent().find(selector + 'Tab').addClass('hover');
			}, function () {
				$(this).parent().find(selector + 'Tab').removeClass('hover');
			})
			
			$(selector + 'CloseButton').click(function () {
				storage.tabOpen = false;
				closeTab();
				updateStorage();
			});

			$(selector + 'CloseBlockedButton').click(function () {
				storage.tabOpen = false;
				closeTab();
				updateStorage();
			});
			
			$(selector + 'CollapseButton').click(function () {
				var top = parseInt($(selector + 'Body').css('top'), 10);
				if (top == 86) {
					storage.operatorDetailsOpen = false;
					hideOperatorDetails();
				} else {
					storage.operatorDetailsOpen = true;
					showOperatorDetails();
				}
				updateStorage();
			});
			
		}
	}

	// Invite Tab Events
	function initInviteTabEvents() {
		var invite = $('.' + prefix + 'Invite'),
			open = 'InviteTimeoutOpen',
			close = 'InviteTimeoutClose';
		if (invite.length > 0) {
			invite.hover(function () {
				window.clearTimeout($.data(invite, close));
				var timer = window.setTimeout(function () {
					invite.animate({ width: 283 }, { duration: 1000, easing: 'easeInOutQuad' });
				}, 250);
				$.data(invite, open, timer);
			}, function () {
				window.clearTimeout($.data(invite, open));
				var timer = window.setTimeout(function () {
					invite.animate({ width: 32 }, { duration: 1000, easing: 'easeInOutQuad' });
				}, 3000);
				$.data(invite, close, timer);
			});
			
			invite.click(function () {
				openLiveHelp($(this));
				return false;
			});
			
			$('.' + prefix + 'InviteClose').click(function () {
				window.clearTimeout($.data(invite, close));	
				invite.animate({ width: 32 }, { duration: 1000, easing: 'easeInOutQuad' });
				return false;
			});
		}
	}

	function blockChat() {
		// Block Chat
		opts.connected = false;
		storage.chatEnded = true;
		storage.department = '';
		storage.lastMessage = 0;
		updateStorage();
		message = 0;

		$(selector + 'SignedIn, ' + selector + 'Login #Inputs, ' + selector + 'CollapseButton, ' + selector + 'Toolbar, ' + selector + 'SignInDetails, ' + selector + 'Login #Connecting').fadeOut();
		$(selector + 'SignIn, ' + selector + 'BlockedChatDetails').fadeIn();
		$(selector + 'MessageTextarea').attr('disabled', 'disabled');

		var blocked = $(selector + 'Login #BlockedChat');
		blocked.fadeIn();
		if (blocked.find('img').length === 0) {
			blocked.prepend('<img src="' + opts.server + 'images/Block.png"/>');
		}
	}

	function initChatEvents() {
		var maxWidth = 800;

		// Connected / Disconnect
		$(document).bind('LiveHelp.Connected', function (event, id, name, department) {
			showOperatorDetails(id, name, department);
		}).bind('LiveHelp.Disconnect', function () {
			opts.connected = false;
			storage.chatEnded = true;
			storage.department = '';
			storage.lastMessage = 0;
			updateStorage();
			$(selector + 'MessageTextarea').attr('disabled', 'disabled');
			if ($(selector + 'SignedIn').is(':visible') || opts.popup) {
				showRating();
			}
			$.ajax({ url: opts.server + 'logout.php',
				data: { SESSION: encodeURIComponent(cookies.session) },
				dataType: 'jsonp',
				cache: false,
				xhrFields: { withCredentials: true }
			});
		}).bind('LiveHelp.BlockChat', function () {
			blockChat();
		});
	
		// Toolbar
		$(selector + 'Toolbar div').hover(function () {
			$(this).fadeTo(200, 1.0);
		}, function () {
			$(this).fadeTo(200, 0.5);
		});
		
		// Sound Button
		$(selector + 'SoundToolbarButton').click(function () {
			if (storage.soundEnabled) {
				storage.soundEnabled = false;
			} else {
				storage.soundEnabled = true;
			}
			updateStorage();
			toggleSound();
		});
		
		if (opts.popup) {
			maxWidth = 675;
		}
		
		// Disconnect Button
		$(selector + 'DisconnectToolbarButton').fancybox({ href: selector + 'Disconnect', maxWidth: maxWidth, helpers: { overlay: { css: { cursor: 'auto' } }, title: null }, openEffect: 'elastic', openEasing: 'easeOutBack', closeEffect: 'elastic', closeEasing: 'easeInBack', beforeShow: function () {
			$(selector + 'Embedded').css('z-index', 900);
			$('.bubbletip').css('z-index', 950);
		}, afterClose: function () {
			$(selector + 'Embedded').css('z-index', 10000000);
			$('.bubbletip').css('z-index', 90000000);
		} });
		
		// Feedback Button
		$(selector + 'FeedbackToolbarButton').click(function () {
			showRating();
		});
		
		// Connect Button
		$(selector + 'ConnectButton').click(function () {
			startChat();
		});
		
		// Send Button
		$(selector + 'SendButton').click(function () {
			processForm();
		});
		
		// Button Hover Events
		$(selector + 'DisconnectButton, ' + selector + 'CancelButton, ' + selector + 'ConnectButton, ' + selector + 'SendButton').hover(function () {
			var id = $(this).attr('id').replace(prefix, '');
			$(this).toggleClass(id + ' ' + id + 'Hover');
		}, function () {
			var id = $(this).attr('id').replace(prefix, '');
			$(this).toggleClass(id + ' ' + id + 'Hover');
		});
		$(selector + 'CancelButton').click(function () {
			$.fancybox.close();
		});
		$(selector + 'DisconnectButton').click(function () {
			disconnectChat();
		});
		
		$(selector + 'SmiliesButton').click(function (e) {
			$(this).bubbletip($('#SmiliesTooltip'), { calculateOnShow: true }).open();
			if (e.stopPropagation) {
				e.stopPropagation();
			}
		});
		
		var textarea = selector + 'MessageTextarea';
		$(textarea).keypress(function (event) {
			var characterCode;
			if ($(textarea).val() === '') {
				typing(false);
			} else {
				typing(true);
			}
			if (event.keyCode == 13 || event.charCode == 13) {
				processForm();
				return false;
			} else {
				return true;
			}
		}).blur(function () {
			typing(false);
		}).focus(function () {
			$(selector + 'SmiliesButton').close();
			hideNotification();
			hideTitleNotification();
		});

		$(selector + 'Embedded').click(function () {
			$(selector + 'SmiliesButton').close();
		});

		$(textarea).keyup(function (event) {
			var text = $(textarea).val();
			$.jStorage.set('LiveHelp.MessageTextarea', text);
		});
		$(textarea).val($.jStorage.get('LiveHelp.MessageTextarea', ''));
		
		$('#SmiliesTooltip span').click(function () {
			var smilie = $(this).attr('class').replace('sprite ', ''),
				val = $(textarea).val(),
				text = '';
			
			switch (smilie) {
			case 'Laugh':
				text = ':D';
				break;
			case 'Smile':
				text = ':)';
				break;
			case 'Sad':
				text = ':(';
				break;
			case 'Money':
				text = '$)';
				break;
			case 'Impish':
				text = ':P';
				break;
			case 'Sweat':
				text = ':\\';
				break;
			case 'Cool':
				text = '8)';
				break;
			case 'Frown':
				text = '>:L';
				break;
			case 'Wink':
				text = ';)';
				break;
			case 'Surprise':
				text = ':O';
				break;
			case 'Woo':
				text = '8-)';
				break;
			case 'Tired':
				text = 'X-(';
				break;
			case 'Shock':
				text = '8-O';
				break;
			case 'Hysterical':
				text = 'xD';
				break;
			case 'Kissed':
				text = ':-*';
				break;
			case 'Dizzy':
				text = ':S';
				break;
			case 'Celebrate':
				text = '+O)';
				break;
			case 'Angry':
				text = '>:O';
				break;
			case 'Adore':
				text = '<3';
				break;
			case 'Sleep':
				text = 'zzZ';
				break;
			case 'Stop':
				text = ':X';
				break;
			}
			$(selector + 'MessageTextarea').val(val + text);
		});

		var speech = $(selector + 'MessageSpeech'),
			obj = speech[0];

		if (obj !== undefined) {
			obj.onfocus = obj.blur;
			obj.onwebkitspeechchange = function(e) {
				$(selector + 'MessageTextarea').val(speech.val());
				speech.val('');
			};
		}
	}

	function initDepartments() {
		$(selector + 'DepartmentInput, ' + selector + 'LoginForm select[id=DEPARTMENT]').each(function () {
			var attribute = 'collapsed';
			if ($(this).data(attribute) === undefined) {
				$(this).data(attribute, false);
			}
		});
	}

	function initSignInEvents() {
		var form = selector + 'LoginForm';

		// Sign In Events
		if (settings.requireGuestDetails) {
			
			$(selector + 'NameInput, ' + form + ' input[id=NAME]').bind('keydown blur', function () {
				validateField(this, selector + 'NameError');
			});
			
			if (settings.loginEmail) {
				$(selector + 'EmailInput, ' + form + ' input[id=EMAIL]').bind('keydown blur', function () {
					validateEmail(this, selector + 'EmailError');
				});
			}
			
			if (settings.departments.length > 0) {
				$(selector + 'DepartmentInput, ' + form + ' select[id=DEPARTMENT]').bind('keydown keyup blur change', function () {
					var obj = $(this),
						collapsed = obj.data('collapsed');
						
					validateField(obj, selector + 'DepartmentError');
					if (!collapsed) {
						obj.animate({ width: obj.width() - 35 }, 250);
						obj.data('collapsed', true);
					}
				});
			}
		}
		
		if (!settings.loginEmail) {
			$(selector + 'EmailInput, ' + form + ' input[id=EMAIL]').hide();
			$('.' + prefix + 'Login .EmailLabel').hide();
		}
		
		if (!settings.loginQuestion) {
			$(selector + 'QuestionInput, ' + form + ' input[id=QUESTION]').hide();
			$('.' + prefix + 'Login .QuestionLabel').hide();
		}

	}

	function resizePopup() {
		var height = $(window).height(),
			width = $(window).width(),
			campaign = ($(selector + 'Campaign').length > 0 && !$(selector + 'Campaign').is(':hidden')) ? $(selector + 'Campaign').width() : 0,
			scrollBorder = $(selector + 'ScrollBorder'),
			scroll = $(selector + 'ScrollBorder'),
			messages = $(selector + 'Messages'),
			textarea = $(selector + 'MessageTextarea');

		if (scrollBorder.length > 0 && scroll.length > 0) {
			if (scrollBorder.css('width').indexOf('%') == -1) {
				$(selector + 'Scroll, ' + selector + 'ScrollBorder').css('width', 'auto');
				scroll.css('width', width - campaign - 40 + 'px');
				messages.css('width', width - campaign - 48 + 'px');
				scrollBorder.css('width', width - campaign - 20 + 'px');
			}

			// TODO Test Resizing with WHMCS Template
			$(selector + 'Scroll, ' + selector + 'ScrollBorder').css('height', 'auto').css('height', height - 175 - 10 + 'px');
			$('.body').css({'width': width + 'px', 'min-width': '625px'});

			if (textarea.css('width').indexOf('%') == -1) {
				textarea.css('width', width - 160 + 'px');
			}
			
			width = scrollBorder.css('width');
			var displayWidth = parseInt(width, 10);
			var unitMeasurement = width.slice(-2);
			$(selector + 'Messages img, .' + prefix + 'Image, .' + prefix + 'VideoZoom, .' + prefix + 'VideoHover, .' + prefix + 'ImageZoom, .' + prefix + 'ImageHover').not('.noresize').each(function () {
				var maxWidth = parseInt($(this).css('max-width'), 10),
					maxHeight = parseInt($(this).css('max-height'), 10),
					newWidth = displayWidth - 50,
					aspect = maxHeight / maxWidth,
					newHeight = newWidth * aspect;
					
				if (newWidth <= maxWidth) {
					$(this).css('width', newWidth + unitMeasurement);
				}
				if (newHeight <= maxHeight || $(this).is('.' + prefix + 'Image')) {
					$(this).css('height', newHeight + unitMeasurement);
				}
			});
			scrollBottom();
		}
	}

	function initPopupEvents() {
		$(window).resize(function () {
			resizePopup();
		});
		
		$(document).ready(function () {
			initDepartments();
			if (opts.connected) {
				$(selector + 'Login').hide();
				$(selector + 'Chat').fadeIn(250);
				resizePopup();
				startChat();
			}
		});
		
		initSignInEvents();
		initOfflineEvents();
		initCallEvents();
		
		// Setup Sounds
		if (messageSound === undefined) {
			messageSound = new buzz.sound(opts.server + 'sounds/Pending Chat', {
				formats: ['ogg', 'mp3', 'wav'],
				volume: 100
			});
		}
		
		var id = (document.location.pathname.indexOf('/livehelp/call.php') > -1) ? 'Call' : 'Offline',
			selector = '#' + prefix + id,
			form = $('#' + id + 'MessageForm');

		resetSecurityCode(selector, form);
	}

	// Title Notification Events
	window.isActive = true;

	$(window).focus(function () {
		this.isActive = true;
		hideTitleNotification();
	});

	$(window).blur(function () {
		this.isActive = false;
	});

	// Update Settings
	updateSettings();

	function setupChat() {
	
			// Image Title
			updateImageTitle();
			
			// Popup Events
			if (opts.popup) {
				initChatEvents();
				initPopupEvents();
			}
					
			// jQuery Status Mode Trigger
			$(document).trigger('LiveHelp.StatusModeChanged', settings.currentStatus);
			
			// Live Chat Tab
			if ($('.' + prefix + 'Invite').length === 0 && opts.inviteTab === true) {
				var inviteTabHtml = '<div class="' + prefix + 'Invite"> \
<img src="' + opts.server + 'locale/' + settings.locale + '/images/SliderBackground.png" border="0" alt="Live Chat Online - Chat Now!" title="Live Chat Online - Chat Now!"/> \
<div class="' + prefix + 'InviteTab ' + prefix + 'Button" style="background:url(\'' + opts.server + 'locale/' + settings.locale + '/images/SliderButton.png\') top right no-repeat"></div> \
<div class="' + prefix + 'InviteClose" style="background:url(\'' + opts.server + 'locale/' + settings.locale + '/images/SliderClose.png\') top right no-repeat"></div></div> \
<div class="' + prefix + 'InviteText" style="background:url(\'' + opts.server + 'locale/' + settings.locale + '/images/SliderText.png\') no-repeat"></div>';

				$(inviteTabHtml).appendTo(document.body);
				initInviteTabEvents();
			}
			
			// Embedded Chat
			if ($(selector + 'Embedded').length === 0 && opts.embedded === true) {
				var style = (settings.language.copyright.length > 0) ? 'block' : 'none',
					dir = (settings.rtl === true) ? 'dir="rtl"' : '',
					rtl = (settings.rtl === true) ? 'style="text-align:right"' : '',
					embeddedHtml = '<div id="' + prefix + 'CallAction" class="background ChatActionText"></div> \
<div id="' + prefix + 'Embedded" style="display:none"> \
	<div class="background LiveChatIcon"></div> \
	<div class="LiveChatOperator"> \
		<div class="OperatorImage"></div> \
	</div> \
	<div id="' + prefix + 'StatusText">' + settings.language.online + '</div> \
	<div id="' + prefix + 'CloseButton" title="Close" class="sprite CloseButton"></div> \
	<div id="' + prefix + 'Notification" class="sprite Notification"><span></span></div> \
	<div id="' + prefix + 'Tab" class="background TabBackground"></div> \
	<div class="background OperatorBackground"> \
		<div id="' + prefix + 'OperatorImage"></div> \
		<div class="sprite OperatorForeground"></div> \
		<div id="' + prefix + 'OperatorNameBackground"> \
			<div id="' + prefix + 'OperatorName"></div> \
			<div id="' + prefix + 'OperatorDepartment"></div> \
		</div> \
	</div> \
	<div id="' + prefix + 'Body"> \
		<div id="' + prefix + 'Background" class="background ChatBackground"></div> \
		<div id="' + prefix + 'Toolbar"> \
			<div id="' + prefix + 'EmailChatToolbarButton" title="' + settings.language.emailchat + '" class="sprite Email"></div> \
			<div id="' + prefix + 'SoundToolbarButton" title="' + settings.language.togglesound + '" class="sprite SoundOn"></div> \
			<div id="' + prefix + 'SwitchPopupToolbarButton" title="' + settings.language.switchpopupwindow + '" class="sprite Popup"></div> \
			<div id="' + prefix + 'FeedbackToolbarButton" title="' + settings.language.feedback + '" class="sprite Feedback"></div> \
			<div id="' + prefix + 'DisconnectToolbarButton" title="' + settings.language.disconnect + '" class="sprite Disconnect"></div> \
		</div> \
		<div id="' + prefix + 'CollapseButton" title="Expand" class="sprite Expand"></div> \
		<div id="' + prefix + 'SignedIn"> \
			<div id="' + prefix + 'Scroll"> \
				<div id="' + prefix + 'Waiting">' + settings.language.thankyoupatience + '</div> \
				<div id="' + prefix + 'Messages"></div> \
				<div id="' + prefix + 'MessagesEnd"></div> \
			</div> \
		</div> \
		<div id="' + prefix + 'SignIn"> \
			<div id="' + prefix + 'SignInDetails">' + settings.language.welcome + '<br/>' + settings.language.enterguestdetails + '</div> \
			<div id="' + prefix + 'BlockedChatDetails" style="display:none">' + settings.language.chatsessionblocked + '</div> \
			<div id="' + prefix + 'Error"> \
				<div id="' + prefix + 'ErrorIcon" class="sprite Cross"></div> \
				<div id="' + prefix + 'ErrorText">' + settings.language.invalidemail + '</div> \
			</div> \
			<div id="' + prefix + 'Login" class="' + prefix + 'Login drop-shadow curved curved-hz-1"> \
				<div id="Inputs" ' + rtl + '> \
					<label class="NameLabel" ' + rtl + '>' + settings.language.name + '<br/> \
						<div class="' + prefix + 'Input"> \
							<input id="' + prefix + 'NameInput" type="text" tabindex="100" ' + dir + '/> \
							<div id="' + prefix + 'NameError" title="Name Required" class="sprite InputError"></div> \
						</div> \
					</label> \
					<label class="EmailLabel" ' + rtl + '>' + settings.language.email + '<br/> \
						<div class="' + prefix + 'Input"> \
							<input id="' + prefix + 'EmailInput" type="text" tabindex="101" ' + dir + '/> \
							<div id="' + prefix + 'EmailError" title="Email Required" class="sprite InputError"></div> \
						</div> \
					</label> \
					<label id="' + prefix + 'DepartmentLabel" ' + rtl + '>' + settings.language.department + '<br/> \
						<div class="' + prefix + 'Department"> \
							<select id="' + prefix + 'DepartmentInput" tabindex="102" ' + dir + '></select> \
							<div id="' + prefix + 'DepartmentError" title="Department Required" class="sprite InputError"></div> \
						</div> \
					</label> \
					<label class="QuestionLabel" ' + rtl + '>' + settings.language.question + '<br/> \
						<div class="' + prefix + 'Input"> \
							<textarea id="' + prefix + 'QuestionInput" tabindex="103" ' + dir + '></textarea> \
							<div id="QuestionError" title="Question Required" class="sprite InputError"></div> \
						</div> \
					</label> \
					<div style="text-align: center; margin-top: 10px"> \
						<div id="' + prefix + 'ConnectButton" class="button" tabindex="104">' + settings.language.connect + '</div> \
					</div> \
				</div> \
				<div id="Connecting" style="height: 125px; display:none; text-align:center"> \
					<div style="margin-top:50px; left:15px"> \
						<div style="font-family:RobotoLight, sans-serif; padding-top:30px; text-shadow:0 0 1px #ccc; letter-spacing:-1px; font-size:22px; line-height:normal; color:#999">' + settings.language.connecting + '</div> \
					</div> \
				</div> \
				<div id="BlockedChat" style="display:none; text-align:center"> \
					<div style="margin-top:5px; left:15px"> \
						<div style="font-family:RobotoLight, sans-serif; padding:5px 0; text-shadow:0 0 1px #ccc; letter-spacing:-1px; font-size:22px; line-height:normal; color:#999">' + settings.language.accessdenied + '<br/>' + settings.language.blockedchatsession + '</div> \
						<div style="text-align: center; margin: 10px 0"> \
							<div id="' + prefix + 'CloseBlockedButton" class="button">' + settings.language.closechat + '</div> \
						</div> \
					</div> \
				</div> \
			</div> \
			<div id="' + prefix + 'SocialLogin"> \
				<div>or</div> \
				<div id="' + prefix + 'TwitterButton" class="sprite Twitter"></div><br/><div id="' + prefix + 'FacebookButton" class="sprite Facebook"></div> \
			</div> \
			<div id="' + prefix + 'Copyright" style="display: ' + style + '">' + settings.language.copyright + '</div> \
		</div> \
	</div> \
	<div id="' + prefix + 'Input" class="background MessageBackground"> \
		<div id="' + prefix + 'Typing"> \
			<div class="sprite Typing"></div> \
			<span></span> \
		</div> \
		<textarea id="' + prefix + 'MessageTextarea" placeholder="' + settings.language.enteryourmessage + '" ' + dir + '></textarea> \
		<input x-webkit-speech="x-webkit-speech" id="' + prefix + 'MessageSpeech" style="font-size: 15px; width: 15px; height: 15px; cursor:pointer; border: none; position: absolute; top: 40px; right: 64px; margin-left: 5px; outline: none; background: transparent; color: transparent" /> \
		<div id="' + prefix + 'SmiliesButton" title="Smilies" class="sprite SmilieButton"></div> \
		<div id="' + prefix + 'SendFileButton" class="sprite SmilieButton"></div> \
		<div id="' + prefix + 'SendButton" class="sprite SendButton"> \
			<div>' + settings.language.send + '</div> \
		</div> \
	</div> \
	<div id="SmiliesTooltip"><div><span title="Laugh" class="sprite Laugh"></span><span title="Smile" class="sprite Smile"></span><span title="Sad" class="sprite Sad"></span><span title="Money" class="sprite Money"></span><span title="Impish" class="sprite Impish"></span><span title="Sweat" class="sprite Sweat"></span><span title="Cool" class="sprite Cool"></span><br/></span><span title="Frown" class="sprite Frown"></span><span title="Wink" class="sprite Wink"></span><span title="Surprise" class="sprite Surprise"></span><span title="Woo" class="sprite Woo"></span><span title="Tired" class="sprite Tired"></span><span title="Shock" class="sprite Shock"></span><span title="Hysterical" class="sprite Hysterical"></span><br/></span><span title="Kissed" class="sprite Kissed"></span><span title="Dizzy" class="sprite Dizzy"></span><span title="Celebrate" class="sprite Celebrate"></span><span title="Angry" class="sprite Angry"></span><span title="Adore" class="sprite Adore"></span><span title="Sleep" class="sprite Sleep"></span><span title="Quiet" class="sprite Stop"></span></div></div> \
	<iframe id="' + prefix + 'FileDownload" name="FileDownload" frameborder="0" height="0" width="0"></iframe> \
	<div id="' + prefix + 'FileTransfer"><div id="FileTransferActionText" class="sprite FileTransferActionText"></div><div class="FileTransferDropTarget"><div id="FileTransferText"></div></div></div> \
	<div id="' + prefix + 'Disconnect"> \
		<div id="' + prefix + 'DisconnectTitle">' + settings.language.disconnecttitle + '</div><br/> \
		<span>' + settings.language.disconnectdescription + '</span> \
		<div id="' + prefix + 'DisconnectButton" class="sprite DisconnectButton"> \
			<div>' + settings.language.disconnect + '</div> \
		</div> \
		<div id="' + prefix + 'CancelButton" class="sprite CancelButton"> \
			<div>' + settings.language.cancel + '</div> \
		</div> \
	</div> \
</div>';
				$(embeddedHtml).appendTo(document.body);
				
				// Events
				initEmbeddedEvents();
				initSignInEvents();
				initChatEvents();
				
				// File Transfer Button
				$(selector + 'SendFileButton').fancybox({ href: selector + 'FileTransfer', closeClick: false, nextClick: false, arrows: false, mouseWheel: false, keys: null, helpers: { overlay: { css: { cursor: 'auto' }, closeClick: false }, title: null }, openEffect: 'elastic', openEasing: 'easeOutBack', closeEffect: 'elastic', closeEasing: 'easeInBack', margin: [25, 405, 25, 25] });
				
				// Hover File Transfer
				$(selector + 'FileTransfer').hover(function () {
					$('#FileTransferText').fadeIn(250);
				}, function () {
					$('#FileTransferText').fadeOut(250);
				});
				
				// Popup Windows Button
				$(selector + 'SwitchPopupToolbarButton').click(function () {
					opts.embedded = false;
					closeTab(function () {
						storage.notificationEnabled = false;
						updateStorage();
					});
					openLiveHelp($(this));
				});

				// HTML5 Drag Drop Events
				$('.FileTransferDropTarget').bind('dragover', function (event) {
					ignoreDrag(event);
				}).bind('dragleave', function (event) {
					$(this).css('border-color', '#7c7b7b');
					$(this).css('background-color', '#fff');
					$(this).stop();
					$('#FileTransferText').fadeOut(250);
					ignoreDrag(event);
				}).bind('dragenter', function (event) {
					$(this).css('border-color', '#a2d7e5');
					$(this).css('background-color', '#d3f3fa');
					$(this).pulse({backgroundColor: ['#d3f3fa', '#e9f9fc']}, 500, 5);
					$('#FileTransferText').fadeIn(250);
					ignoreDrag(event);
				}).bind('drop', acceptDrop);
				
				// Load Storage
				loadStorage();
				
				// Departments
				updateDepartments();
				
				// Online
				if (cookies.session !== undefined && cookies.session.length > 0) {
					if (settings.currentStatus == 'Online') {
						if (settings.autoload !== 0) {
							openTab();
						} else {
							var embed = $(selector + 'Embedded');
							if (embed.is(':hidden')) {
								$(selector + 'Waiting').hide();
								embed.fadeIn(50, function () {
									$(selector + 'CallAction').fadeIn(50);
								});
								loadStorage();
							}
						}
					} else {
						if (settings.autoload !== 0) {
							openTab();
						}
					}
				}
				
				// Login Details
				var form = selector + 'LoginForm',
					name = $(selector + 'NameInput, ' + form + ' :input[id=NAME]'),
					email = $(selector + 'EmailInput, ' + form + ' :input[id=EMAIL]'),
					inputs = $(selector + 'SignIn').find('input, textarea');
				if (opts.name !== undefined && opts.name.length > 0) {
					name.val(opts.name);
					if (settings.requireGuestDetails) {
						validateField(name, selector + 'NameError');
					}
				}
				if (opts.email !== undefined && opts.email.length > 0) {
					email.val(opts.email);
					if (settings.requireGuestDetails) {
						validateEmail(email, selector + 'EmailError');
					}
				}
				if (!settings.requireGuestDetails) {
					inputs.css('width', '100%');
				}
				
				// Auto Load / Connected
				if (settings.autoload !== 0) {
					showChat();
					opts.connected = true;
				}

				if (!opts.connected) {
					$('.LiveChatIcon').fadeIn(250);
				}
			
				// Update Settings
				overrideSettings();
			
			}
	}

	$(document).bind('LiveHelp.SettingsUpdated', function () {
		setupChat();
	});

	// Document Ready
	$(document).ready(function () {

		// Visitor Tracking
		trackVisit();
	
		// Title
		title = $(document).attr('title');
		
		// Insert CSS / Web Fonts
		var css = '';
		if (opts.fonts === true) {
			css = '<link href="' + opts.protocol + 'fonts.googleapis.com/css?family=Open+Sans:300,400,700" rel="stylesheet" type="text/css"/>';
		}
		if (opts.css === true) {
			css += '<link href="' + opts.server + 'styles/styles.min.css" rel="stylesheet" type="text/css"/>';
		}
		if (css.length > 0) {
			$(css).appendTo('head');
		}
		
		// Title Notification Event
		$(this).click(function () {
			hideTitleNotification();
		});
		
		if (settings !== undefined && settings.currentStatus !== undefined) {
			setupChat();
		}
		
		// Override Settings
		overrideSettings();
		
		// Resize Popup
		if (opts.popup) {
			resizePopup();
		}
		
		// Setup Initiate Chat / Animation
		$(window).bind('resize', resetPosition);

		// Events
		initInviteTabEvents();
		
		// Embedded Chat / Local Storage
		$(window).bind('storage', function (e) {
			loadStorage();
		});
	
	});

	// Window Load Event
	$(window).load(function () {
		
		// Setup Sounds
		/*
		messageSound = new buzz.sound(opts.server + 'sounds/Pending Chat', {
			formats: ['ogg', 'mp3', 'wav'],
			volume: 100
		});
		*/
		
	});

	//return {};

})(this, document, jQuery);