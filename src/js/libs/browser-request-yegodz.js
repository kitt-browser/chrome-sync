// Browser Request
// Modified by Ruchir Godura ruchir@cerient.com
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* jshint browser: true, browserify: true, node: true, laxcomma: true */

// UMD HEADER START 
/* jshint -W117 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
/* jshint +W117 */
}(this, function () {
// UMD HEADER END

var XHR = XMLHttpRequest;
if (!XHR) throw new Error('missing XMLHttpRequest');
request.log = {
  'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
};

var DEFAULT_TIMEOUT = 3 * 60 * 1000; // 3 minutes

/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
var UUID = (function() {
  var self = {};
  var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
  self.generate = function() {
    var d0 = Math.random()*0xffffffff|0;
    var d1 = Math.random()*0xffffffff|0;
    var d2 = Math.random()*0xffffffff|0;
    var d3 = Math.random()*0xffffffff|0;
    return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
      lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
      lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
      lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
  };
  return self;
})();
//
// request
//

function request(options, callback) {
  // The entry-point to the API: prep the options object and pass the real work to run_xhr.
  if(typeof callback !== 'function')
    throw new Error('Bad callback given: ' + callback);

  if(!options)
    throw new Error('No options given');

  var options_onResponse = options.onResponse; // Save this for later.

  if(typeof options === 'string')
    options = {'uri':options};
// modified by ruchir godura. This way of deep copying mangles buffers   
//  else
//    options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

  options.onResponse = options_onResponse; // And put it back.

  if (options.verbose) request.log = getLogger();

  if(options.url) {
    options.uri = options.url;
    // delete options.url; // Ruchir Godura: 7/16/2015: no need to delete this. Causing crash on Safari
  }

  if(!options.uri && options.uri !== "")
    throw new Error("options.uri is a required argument");

  if(typeof options.uri != "string")
    throw new Error("options.uri must be a string");

  var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect'];
  for (var i = 0; i < unsupported_options.length; i++)
    if(options[ unsupported_options[i] ])
      throw new Error("options." + unsupported_options[i] + " is not supported");

  options.callback = callback;
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.body    = options.body || null;
  options.timeout = options.timeout || request.DEFAULT_TIMEOUT;
  
  //options.responseType = options.responseType | 'arraybuffer'

  if(options.headers.host)
    throw new Error("Options.headers.host is not supported");

  if(options.json) {
    options.headers.accept = options.headers.accept || 'application/json';
    if(options.method !== 'GET')
      options.headers['content-type'] = 'application/json';

    if(typeof options.json !== 'boolean')
      options.body = JSON.stringify(options.json);
      // added by ruchir godura 3/5/2015. JSON.stringify turns null into "null"!!
    else if((options.body !== null) && (typeof options.body !== 'string'))
      options.body = JSON.stringify(options.body);
  }
  
  //BEGIN QS Hack
  var serialize = function(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  };
  
  if(options.qs){
    var qs = (typeof options.qs == 'string')? options.qs : serialize(options.qs);
    if(options.uri.indexOf('?') !== -1){ //no get params
        options.uri = options.uri+'&'+qs;
    }else{ //existing get params
        if (qs.length > 0) // Do not add '?' if qs is empty
          options.uri = options.uri+'?'+qs;
    }
  }
  //END QS Hack
  
  //BEGIN FORM Hack
  var multipart_related = function(obj) {
    //todo: support file type (useful?)
    // modified by Ruchir to support multipart/related 
    var result = {}, bodylen=0, offset=0, p;
    result.boundry = '---------------------------'+UUID.generate();
    var dashes = '--', nl = '\r\n';
    for (p in obj) {
      bodylen += (result.boundry.length + dashes.length + nl.length) *2; // 1 char == 2 bytes utf16
      bodylen += 200; // approx for the 'Content-Type and Content-ID fields'
      if (typeof obj[p].body == 'string') {
        bodylen += obj[p].body.length*2 + 4; // 4 bytes for the two \n's preceding it
      } else { // assume it is an Uint8Array
        bodylen += obj[p].body.length+4;
      }
    }
    bodylen += (result.boundry.length+2)*2;
    
    var body = new Buffer(bodylen);
    
    for(p in obj){
      offset += body.write('--'+result.boundry+nl, offset);
      if (obj[p]['Content-ID'])
        offset += body.write('Content-ID: ' + obj[p]['Content-ID'] +nl, offset);
      offset += body.write('Content-Type: ' + obj[p]['Content-Type'] +nl+nl, offset);
      if (typeof obj[p].body == 'string') {
        offset += body.write(obj[p].body + nl, offset);
      } else { // assume it is an Uint8Array
        offset += obj[p].body.copy(body, offset);
        offset += body.write(nl, offset);
      }
    }
    offset+= body.write('--'+result.boundry+'--'+nl, offset);
    result.body = body.slice(0, offset);
    result.length = offset;
    result.type = 'multipart/related; boundary='+result.boundry;
    return result;
  };
  
    var multipart_formData = function(obj) {
    //todo: support file type (useful?)
    // modified by Ruchir to support multipart/related 
    var result = {}, bodylen=0, offset=0, p;
    result.boundry = '---------------------------'+UUID.generate();
    //result.boundry = '-------------------------------'+Math.floor(Math.random()*1000000000);
    var dashes = '--', nl = '\r\n';
    for (p in obj) {
      bodylen += (result.boundry.length + dashes.length + nl.length) *2; // 1 char == 2 bytes utf16
      bodylen += 300; // approx for the 'Content-Type field'
      if (typeof obj[p] == 'string') {
        bodylen += obj[p].length*2 + 4; // 4 bytes for the two \n's preceding it
      } else { // assume it is an Object with two fields - value and options
        if (typeof obj[p].value == 'string')
          bodylen += obj[p].value.length*2+4;
        else
          bodylen += obj[p].value.length+4;
        for (var k in obj[p].options)
          bodylen += obj[p].options[k].length *2;
      }
    }
    bodylen += (result.boundry.length+2)*2;
    
    var body = new Buffer(bodylen);
    
    for(p in obj){
      offset += body.write('--'+result.boundry+nl+
                'Content-Disposition: form-data;name="' + p +'"', offset);
      if (typeof obj[p] == 'string') {
        offset += body.write(nl+nl+ obj[p] + nl, offset);
      } else { // assume it is an Object of type { value: [buffer], options: obj }
        offset += body.write('; filename="file"'+nl+'Content-Type: application/octet-stream'+nl+nl, offset);
        offset += obj[p].value.copy(body, offset);
        offset += body.write(nl, offset);
      }
    }
    offset+= body.write('--'+result.boundry+'--'+nl, offset);
    result.body = body.slice(0, offset);
    result.length = offset;
    result.type = 'multipart/form-data; boundary='+result.boundry;
    return result;
  };
  
  var multipart_form = function(obj) {
    //todo: support file type (useful?)
    // modified by Ruchir to support multipart/related 
    var result = {};
    result.boundry = '-------------------------------'+Math.floor(Math.random()*1000000000);
    var lines = [];
    for(var p in obj){
        if (obj.hasOwnProperty(p)) {
            lines.push(
                '--'+result.boundry+"\r\n"+
                "Content-Type: " + obj[p]['Content-Type'] +"\r\n"+
                "\r\n"+
                obj[p].body+"\r\n"
            );
        }
    }
    lines.push( '--'+result.boundry+'--\r\n' );
    result.body = lines.join('');
    result.length = result.body.length;
    result.type = 'multipart/related; boundary='+result.boundry;
    return result;
  }; 
  
  var encoding, multi;
  if(options.form){
    if(typeof options.form == 'string') throw('form name unsupported');
    if(options.method === 'POST'){
        encoding = (options.encoding || 'application/x-www-form-urlencoded').toLowerCase();
        options.headers['content-type'] = encoding;
        switch(encoding){
            case 'application/x-www-form-urlencoded':
                options.body = serialize(options.form).replace(/%20/g, "+");
                break;
            case 'multipart/form-data':
                 multi = multipart_form(options.form);
                //options.headers['content-length'] = multi.length;
                options.body = multi.body;
                options.headers['content-type'] = multi.type;
                break;
            default : throw new Error('unsupported encoding:'+encoding);
        }
    }
  }
  
  if(options.formData){
    if((options.method === 'POST') || (options.method === 'PUT')){
        encoding = 'multipart/form-data';
        options.headers['content-type'] = encoding;
         multi = multipart_formData(options.formData);
        //options.headers['content-length'] = multi.length;
        options.body = multi.body;
        options.headers['content-type'] = multi.type;
    }
  }
  
  // added by ruchir godura to support multipart
  if(options.multipart){
    options.headers['content-type'] = 'multipart/related';
     multi = multipart_related(options.multipart);
    //options.headers['content-length'] = multi.length;
    options.body = multi.body;
    options.headers['content-type'] = multi.type;
  }
  //END FORM Hack

  // If onResponse is boolean true, call back immediately when the response is known,
  // not when the full request is complete.
  options.onResponse = options.onResponse || noop;
  if(options.onResponse === true) {
    options.onResponse = callback;
    options.callback = noop;
  }

  // XXX Browsers do not like this.
  //if(options.body)
  //  options.headers['content-length'] = options.body.length;

  // HTTP basic authentication
  if(!options.headers.authorization && options.auth)
    options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

  return run_xhr(options);
}

var req_seq = 0;
function run_xhr(options) {
  var xhr = new XHR()
    , timed_out = false
    , is_cors = is_crossDomain(options.uri)
    , supports_cors = ('withCredentials' in xhr);

  req_seq += 1;
  xhr.seq_id = req_seq;
  xhr.id = req_seq + ': ' + options.method + ' ' + options.uri;
  xhr._id = xhr.id; // I know I will type "_id" from habit all the time.
  
  xhr.aborted = false;
  
  if(is_cors && !supports_cors) {
    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri);
    cors_err.cors = 'unsupported';
    return options.callback(cors_err, xhr);
  }

  xhr.timeoutTimer = setTimeout(too_late, options.timeout);
  function too_late() {
    timed_out = true;
    var er = new Error('ETIMEDOUT');
    er.code = 'ETIMEDOUT';
    er.duration = options.timeout;

    request.log.error('Timeout', { 'id':xhr._id, 'milliseconds':options.timeout });
    return options.callback(er, xhr);
  }

  // Some states can be skipped over, so remember what is still incomplete.
  var did = {'response':false, 'loading':false, 'end':false};
  if (options.method == 'GET')
    xhr.onprogress = options.progressCallback;
  if ((options.method == 'POST') || (options.method == 'PUT'))
    xhr.upload.onprogress = options.progressCallback;
  xhr.onreadystatechange = on_state_change;
  xhr.open(options.method, options.uri, true); // asynchronous
  // added by Ruchir Godura 3/5/2015. to support binary file download
  if ((options.responseType == 'arraybuffer') || (options.responseType == 'buffer'))
    xhr.responseType = 'arraybuffer';
  if(is_cors)
    xhr.withCredentials = !! options.withCredentials;
  
  // xhr is failing with invalid state in ie 11. Maybe because xhr.send has already been called.
  for (var key in options.headers)
    xhr.setRequestHeader(key, options.headers[key]);
    
  xhr.send(options.body);
  return xhr;

  function on_state_change(event) {
    if(timed_out)
      return request.log.debug('Ignoring timed out state change', {'state':xhr.readyState, 'id':xhr.id});

    request.log.debug('State change', {'state':xhr.readyState, 'id':xhr.id, 'timed_out':timed_out});

    if(xhr.readyState === XHR.OPENED) {
      request.log.debug('Request started', {'id':xhr.id});
//      for (var key in options.headers)
//        xhr.setRequestHeader(key, options.headers[key])
    }

    else if(xhr.readyState === XHR.HEADERS_RECEIVED)
      on_response();

    else if(xhr.readyState === XHR.LOADING) {
      on_response();
      on_loading();
    }

    else if(xhr.readyState === XHR.DONE) {
      on_response();
      on_loading();
      on_end();
    }
  }

  function on_response() {
    if(did.response)
      return;

    did.response = true;
    request.log.debug('Got response', {'id':xhr.id, 'status':xhr.status});
    clearTimeout(xhr.timeoutTimer);
    xhr.statusCode = xhr.status; // Node request compatibility

    // detect aborted requests
    if(xhr.aborted) {
      var abort_err = new Error('Request aborted: ');
      abort_err.message = 'Operation aborted by user';

      // Do not process this request further.
      did.loading = true;
      did.end = true;

      return options.callback(abort_err, xhr);
    }  
    
    // Detect aborted/cancelled requests requests.
    if(xhr.statusCode === 0) {
      var cors_err = new Error('HTTP Request cancelled by browser ' + options.uri);
      cors_err.cors = 'rejected';

      // Do not process this request further.
      did.loading = true;
      did.end = true;

      return options.callback(cors_err, xhr);
    }

    options.onResponse(null, xhr);
  }

  function on_loading() {
    if(did.loading)
      return;

    did.loading = true;
    request.log.debug('Response body loading', {'id':xhr.id});
    // TODO: Maybe simulate "data" events by watching xhr.responseText
  }

  function on_end() {
    if(did.end)
      return;

    did.end = true;
    request.log.debug('Request done', {'id':xhr.id});

    xhr.body = (xhr.responseType == 'arraybuffer')? xhr.response : xhr.responseText;
    
    if (options.responseType == 'buffer') 
      // added by Ruchir Godura 3/5/2015. to support binary file download
      //see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
      xhr.body = new Buffer( new Uint8Array(xhr.body) );
    
    if(options.json) {
      try        { xhr.body = JSON.parse(xhr.responseText); }
      catch (er) { return options.callback(er, xhr);        }
    }

    options.callback(null, xhr, xhr.body);
  }

} // request

request.withCredentials = false;
request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

//
// defaults
//

request.defaults = function(options, requester) {
  var def = function (method) {
    var d = function (params, callback) {
      if(typeof params === 'string')
        params = {'uri': params};
      else {
        params = JSON.parse(JSON.stringify(params));
      }
      for (var i in options) {
        if (params[i] === undefined) params[i] = options[i];
      }
      return method(params, callback);
    };
    return d;
  };
  var de = def(request);
  de.get = def(request.get);
  de.post = def(request.post);
  de.put = def(request.put);
  de.head = def(request.head);
  return de;
};

//
// HTTP method shortcuts
//

var shortcuts = [ 'get', 'put', 'post', 'head' ];
shortcuts.forEach(function(shortcut) {
  var method = shortcut.toUpperCase();
  var func   = shortcut.toLowerCase();

  request[func] = function(opts) {
    if(typeof opts === 'string')
      opts = {'method':method, 'uri':opts};
    else {
      // modified by ruchir. hacky way of deep copying options mangles data buffers
      //opts = JSON.parse(JSON.stringify(opts));
      opts.method = method;
    }

    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
    return request.apply(this, args);
  };
});

//
// CouchDB shortcut
//

request.couch = function(options, callback) {
  if(typeof options === 'string')
    options = {'uri':options};

  // Just use the request API to do JSON.
  options.json = true;
  if(options.body)
    options.json = options.body;
  delete options.body;

  callback = callback || noop;

  var xhr = request(options, couch_handler);
  return xhr;

  function couch_handler(er, resp, body) {
    if(er)
      return callback(er, resp, body);

    if((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
      // The body is a Couch JSON object indicating the error.
      er = new Error('CouchDB error: ' + (body.error.reason || body.error.error));
      for (var key in body)
        er[key] = body[key];
      return callback(er, resp, body);
    }

    return callback(er, resp, body);
  }
};

//
// Utility
//

function noop() {}

function getLogger() {
  var logger = {}
    , levels = ['trace', 'debug', 'info', 'warn', 'error']
    , level, i;

  for(i = 0; i < levels.length; i++) {
    level = levels[i];

    logger[level] = noop;
    if(typeof console !== 'undefined' && console && console[level])
      logger[level] = formatted(console, level);
  }

  return logger;
}

function formatted(obj, method) {
  return formatted_logger;

  function formatted_logger(str, context) {
    if(typeof context === 'object')
      str += ' ' + JSON.stringify(context);

    return obj[method].call(obj, str);
  }
}

// Return whether a URL is a cross-domain request.
function is_crossDomain(url) {
  var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

  // jQuery #8138, IE may throw an exception when accessing
  // a field from window.location if document.domain has been set
  var ajaxLocation;
  try { ajaxLocation = location.href; }
  catch (e) {
    // Use the href attribute of an A element since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
  }

  var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
    , parts = rurl.exec(url.toLowerCase() );

    /* jshint -W014 */
  var result = !!(
    parts &&
    (  parts[1] != ajaxLocParts[1]
    || parts[2] != ajaxLocParts[2]
    || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))
    )
  );
   /* jshint +W014 */
  //console.debug('is_crossDomain('+url+') -> ' + result)
  return result;
}

// MIT License from http://phpjs.org/functions/base64_encode:358
function b64_enc (data) {
    // Encodes string using MIME base64 algorithm
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

    if (!data) {
        return data;
    }

    // assume utf8 data
    // data = this.utf8_encode(data+'');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
        break;
        case 2:
            enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
}
    return request;
//UMD FOOTER START
}));
//UMD FOOTER END
