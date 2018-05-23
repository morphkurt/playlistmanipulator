var express = require('express');
var app = express();
var cache = require('memory-cache');
var config = require("./config.json");
var util = require('util');


//default left bitrate
cache.put('left','1200');
cache.put('prevleft','1200');
cache.put('starttime',Math.floor(new Date() / 1000));

//defalut right rate
cache.put('right','1200');
cache.put('prevright','1200');
//default stream
cache.put('asset','afl-gf-overlay');
cache.put('prevasset','afl-gf-overlay');
cache.put('lastchanged','0');

app.get('/out/u/playlist.m3u8', function (req, res) {
  
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Cache-Control", "max-age=2");
  res.header("Content-Type","application/x-mpegURL");
	
  var assetArray = config.config.asset.filter(function(item) { return item.name == cache.get('asset'); });
  var prevassetArray = config.config.asset.filter(function(item) { return item.name == cache.get('prevasset'); });
  var starttime=cache.get('starttime');
  var currenttime=Math.floor(new Date() / 1000);
  var seq=Math.floor((currenttime-starttime)/config.config.segment);
  var nextseg=-1;
  var res_body='#EXTM3U\r\n#EXT-X-TARGETDURATION:'+config.config.segment+'\r\n'+'#EXT-X-MEDIA-SEQUENCE:'+seq+'\r\n';
  res.set('Content-Type', 'application/vnd.apple.mpegurl');
  var changed=false;
  for (i = config.config.index; i > 0; i--) { 
  	var seg=((Math.floor(((currenttime-(i*config.config.segment))-starttime)/config.config.segment)%assetArray[0].segments)+1);
	var prevseg=((Math.floor(((currenttime-(i*config.config.segment))-starttime)/config.config.segment)%prevassetArray[0].segments)+1);

	if ((seq > 10) && seg ==1){
			res_body += '#EXT-X-DISCONTINUITY\r\n';
	}
	if(seg>0){
		if(Number(cache.get('lastchanged'))>=Number(currenttime-(config.config.index*config.config.segment))){		
			if(Number(cache.get('lastchanged'))>=Number(currenttime-(i*config.config.segment))){
				res_body += '#EXTINF:'+config.config.segment+',\r\n';
				res_body += config.config.preamble + cache.get('prevasset') +'_'+cache.get('prevleft')+ '_'+cache.get('prevright')+'-'+ zeroPad(prevseg,config.config.segment_digits) +'.ts\r\n';
				changed=true;		
			}else{
				if(changed || (i === (config.config.index-1))){
					if(seg !=1){
					res_body += '#EXT-X-DISCONTINUITY\r\n';
					}
				}
				changed=false;
				res_body += '#EXTINF:'+config.config.segment+',\r\n';
				res_body += config.config.preamble + cache.get('asset')+ '_'+cache.get('left')+ '_'+cache.get('right')+'-'+ zeroPad(seg,config.config.segment_digits) +'.ts\r\n';		
			}
			
		
		}else{
			res_body += '#EXTINF:'+config.config.segment+',\r\n';
			res_body += config.config.preamble + cache.get('asset')+'_'+ cache.get('left')+ '_'+cache.get('right')+'-'+ zeroPad(seg,config.config.segment_digits) +'.ts\r\n';		
		}
	}
	
  } 
    
  res.send(res_body);
});

app.get('/set', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  var starttime=cache.get('starttime');
  var currenttime=Math.floor(new Date() / 1000);
  var changed=false;
  cache.put('prevright',cache.get('right'));
  cache.put('prevleft',cache.get('left'));
  cache.put('prevasset',cache.get('asset'));
  
  if (req.query.left){
      if (req.query.left.trim() !==  cache.get('left')){
          cache.put('left',req.query.left);
	  changed=true;
      } 
  	  
  }
  if (req.query.right){
  	if (req.query.right.trim() !==  cache.get('right')){
          cache.put('right',req.query.right);
	  changed=true;
      } 
  }
  if (req.query.asset){
  	if (req.query.asset.trim() !==  cache.get('asset')){
          cache.put('asset',req.query.asset);
	  changed=true;
    } 
  }

  if (req.query.index){
	config.config.index=req.query.index;
  }
 
  if (req.query.preamble){
        config.config.preamble=req.query.preamble;
  }

  if(changed){
    cache.put('lastchanged',currenttime);
  }

  res.send('OK');
});

app.get('/out/getconfig', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Cache-Control", "max-age=60");
  res.set('Content-Type', 'application/json');
  var hash = {};
  hash['left']=cache.get('left');
  hash['right']=cache.get('right');
  hash['asset']=cache.get('asset');
  res.send(JSON.stringify(hash));
 
});

app.get('/out/config.json', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Cache-Control", "max-age=60");
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(config));
});

function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
