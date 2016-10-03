var express = require('express');
var app = express();
var cache = require('memory-cache');
var config = require("./config.json");
var util = require('util');

console.log(config.config.asset[0].name);

//default left bitrate
cache.put('left','1200');
cache.put('newleft','1200');
cache.put('starttime',Math.floor(new Date() / 1000));

//defalut right rate
cache.put('right','1200');
cache.put('newright','1200');
//default stream
cache.put('asset','aflclip');
cache.put('newasset','afl-gf');

app.get('/out/u/playlist.m3u8', function (req, res) {
  var assetArray = config.config.asset.filter(function(item) { return item.name == cache.get('asset'); });
  var starttime=cache.get('starttime');
  var currenttime=Math.floor(new Date() / 1000);
  var seq=Math.floor((currenttime-starttime)/config.config.segment);
  var segno=seq%assetArray[0].segments;
  var nextseg=-1;
  var res_body='#EXTM3U\r\n#EXT-X-TARGETDURATION:'+config.config.segment+'\r\n'+'#EXT-X-MEDIA-SEQUENCE:'+seq+'\r\n';
  res.set('Content-Type', 'application/vnd.apple.mpegurl');
  for (i = 0; i < config.config.index; i++) { 
	if(cache.get('lastchanged')){
		console.log(Number(cache.get('lastchanged')+Number(config.config.segment)));
		if (Number(cache.get('lastchanged')+Number(config.config.segment)*Number(config.config.index)) > Number(currenttime) ) {
			nextseg=Math.floor((Number(cache.get('lastchanged')+Number(config.config.segment)*Number(config.config.index))-starttime)/config.config.segment);
		}
	}
	if ((segno+i)===nextseg){
			res_body += '#EXT-X-DISCONTINUITY\r\n';
	}
	
    	res_body += '#EXTINF:'+config.config.segment+',\r\n';
        res_body += config.config.preamble + cache.get('asset')+ '_h264_' + cache.get('left')+ '_'+cache.get('right')+'-'+ zeroPad(segno+i,config.config.segment_digits) +'.ts\r\n';
  } 
    
  console.log(req.url);  
  res.send(res_body);
});

app.get('/set', function (req, res) {
  var starttime=cache.get('starttime');
  var currenttime=Math.floor(new Date() / 1000);
  var changed=false;
  if (req.query.left){
      if (req.query.left.trim() !==  cache.get('left')){
          cache.put('newleft',req.query.left);
	  changed=true;
      } 
  	  
  }
  if (req.query.right){
  	if (req.query.right.trim() !==  cache.get('right')){
          cache.put('newright',req.query.right);
	  changed=true;
      } 
  }
  if (req.query.asset){
  	if (req.query.asset.trim() !==  cache.get('asset')){
          cache.put('newasset',req.query.asset);
	  changed=true;
    } 
  }

  if(changed){
    console.log(currenttime);
    cache.put('lastchanged',currenttime);
  }

  res.send('OK');
});

function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
