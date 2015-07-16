console.log('Content, proto!');

let match = document.title.match(/code=(.*)/);
if (match) {
  //chrome.runtime.sendMessage({ type: 'setAuthorizationCode', code: match[1] });
}

let protodemo = require('./protodemo');
console.log(typeof protodemo.a);

window.protodemo = protodemo;

setTimeout(function() {
  //alert(document);
  //alert(document.body);
  //alert(document.body.innerHTML);
  console.log('hahaha');
},1000);
