var open = require("open-uri");
var async = require('async');

var feeds = [
  'http://dailydead.com/feed/',
  'http://feeds.feedburner.com/englishrussia/GrPQ?format=xml',
  'http://www.buzzfeed.com/index.xml',
  'http://www.beingordinary.org/feed/',
  'http://www.tombh.co.uk/feed'
];

/**
 * Fetch a feed from the Google Blogs API
 */
function fetch_feed(feed, ip, callback){
  var uri = "https://ajax.googleapis.com/ajax/services/feed/load?" +
    "v=1.0&q=" + encodeURIComponent(feed) + "&max-results=100&userip=" + ip;
  open(uri, function(err, result){
    json = JSON.parse(result);
    callback(json.responseData.feed);
  });
}

/**
 * Aggregate feeds together
 */
function get_data(req, complete) {
  var items = [];
  // NB. Async is a convenience wrapper for controling asynchronous flow
  // Iterate over each feed
  async.forEach(feeds, function(feed, feed_finished){
    // Get JSON of feed
    fetch_feed(feed, req.ip, function(result){
      if(req.query['query'] == 'source'){
        result.entries = null;
        // Wihtout indexOf(), all the sourceID's are the same cos of async!
        result.sourcID = feeds.indexOf(feed) + 1;
        items.push(result);
      }else{
        // Iterate over each feed entry
        result.entries.forEach(function(entry){
          entry.source = result.title;
          entry.sourceURL = result.feedUrl;
          // Wihtout indexOf(), all the sourceID's are the same cos of async!
          entry.sourceID = feeds.indexOf(feed) + 1;
          items.push(entry);
        });
      }
      // Tell async this fetch is done
      feed_finished();
    });
  }, function(){
    complete(items);
  });
}

/*
 * GET json of aggregated feeds.
 */
exports.index = function(req, res){
  
  res.contentType('json');

  // Wait for the remote requests to all finish
  get_data(req, function(result){
    res.send( result );
  });
  
};