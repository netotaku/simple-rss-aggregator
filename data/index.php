<?php

/*

// define allowable tags
$allowable_tags = '<p><a><img><ul><ol><li><table><thead><tbody><tr><th><td>';
// define allowable attributes
$allowable_atts = array('href','src','alt');

// strip collector
$strip_arr = array();

// load XHTML with SimpleXML
$data_sxml = simplexml_load_string('<root>'. $data_str .'</root>', 'SimpleXMLElement', LIBXML_NOERROR | LIBXML_NOXMLDECL);

if ($data_sxml ) {
    // loop all elements with an attribute
    foreach ($data_sxml->xpath('descendant::*[@*]') as $tag) {
        // loop attributes
        foreach ($tag->attributes() as $name=>$value) {
            // check for allowable attributes
            if (!in_array($name, $allowable_atts)) {
                // set attribute value to empty string
                $tag->attributes()->$name = '';
                // collect attribute patterns to be stripped
                $strip_arr[$name] = '/ '. $name .'=""/';
            }
        }
    }
}

// strip unallowed attributes and root tag
$data_str = strip_tags(preg_replace($strip_arr,array(''),$data_sxml->asXML()), $allowable_tags);

*/

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function fetch($url, $ip){

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url . $ip);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_REFERER, $ip);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $body = curl_exec($ch);
    curl_close($ch);
    
    return $body;

}

$feeds = array(
    'http://dailydead.com/feed/', 
    'http://feeds.feedburner.com/englishrussia/GrPQ?format=xml', 
    'http://www.buzzfeed.com/index.xml',
    'http://www.beingordinary.org/feed/',
    'http://www.tombh.co.uk/feed'
);


$query = isset($_GET['query']) ? $_GET['query'] : '';

$items = array();

$ip = $_SERVER['REMOTE_ADDR'];
$i  = 0;
$json = "";

foreach($feeds as $source){

    $url = "https://ajax.googleapis.com/ajax/services/feed/load?" .
    "v=1.0&q=" . urlencode($source) . "&max-results=100&userip=";

    $feed = json_decode(fetch($url, $ip))->responseData->feed;

    switch($query){
      
        case 'sources':
            
            $feed->entries = null;
            $feed->sourceID = $i++;
                
            array_push($items, $feed);   

        break;
        
        default:
            
            foreach(json_decode(fetch($url, $ip))->responseData->feed->entries as $entry){
        
                $entry->source = $feed->title;
                $entry->sourceURL = $feed->feedUrl;
                $entry->sourceID = $i;
               // $entry->content = 
                
                array_push($items, $entry);   
                
            }            

            $i++;

        break;
    }

}

echo json_encode($items);

?>