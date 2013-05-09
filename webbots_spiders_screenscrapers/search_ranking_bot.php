<?php
/*
 ########################################################################
W3C® SOFTWARE NOTICE AND LICENSE
http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231
This work (and included software, documentation such as READMEs, or other related items) is being
provided by the copyright holders under the following license. By obtaining, using and/or copying
this work, you (the licensee) agree that you have read, understood, and will comply with the following
terms and conditions.

Permission to copy, modify, and distribute this software and its documentation, with or without modification,
for any purpose and without fee or royalty is hereby granted, provided that you include the following on
ALL copies of the software and documentation or portions thereof, including modifications:

1.The full text of this NOTICE in a location viewable to users of the redistributed or derivative work.

2.Any pre-existing intellectual property disclaimers, notices, or terms and conditions. If none exist,
the W3C Software Short Notice should be included (hypertext is preferred, text is permitted) within the
body of any redistributed or derivative code.

3.Notice of any changes or modifications to the files, including the date changes were made. (We recommend
  you provide URIs to the location from which the code is derived.)

THIS SOFTWARE AND DOCUMENTATION IS PROVIDED "AS IS," AND COPYRIGHT HOLDERS MAKE NO REPRESENTATIONS OR WARRANTIES,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR
PURPOSE OR THAT THE USE OF THE SOFTWARE OR DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS,
TRADEMARKS OR OTHER RIGHTS.

COPYRIGHT HOLDERS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF
ANY USE OF THE SOFTWARE OR DOCUMENTATION.

The name and trademarks of copyright holders may NOT be used in advertising or publicity pertaining to the
software without specific, written prior permission. Title to copyright in this software and any associated
documentation will at all times remain with copyright holders.

Copyright 2007, Michael Schrenk

THIS SCRIPT IS FOR DEMONSTRATION PURPOSES ONLY!
It is not suitable for any use other than demonstrating
the concepts presented in Webbots, Spiders and Screen Scrapers.
########################################################################
*/?>



<?php
#-------------------------------------------------
# Start: Initialization

// Include libraries
include("LIB_http.php");
include("LIB_parse.php");

// Identify the search term and url combination
$desired_site = "www.loremiaNam.com";
$search_term = "webbots";

// Initialize other miscellanious variables
$page_index         = 0;
$url_found          = false;
$previous_target    = "";
$target             = "http://www.schrenk.com/nostarch/webbots/search?q=".urlencode(trim($search_term));

echo "\n";
echo "Looking for search ranking of \"$desired_site\"\n";
echo "when the search criteria is \"$search_term\"\n";
echo "\n";

# End: Initialization
#-------------------------------------------------

#-------------------------------------------------
# Start: Loop
while($url_found==false)
{
 $page_index++;
 echo "Searching for ranking on page #$page_index\n";

 // Verify that there are not illegal characters in the urls
 $target          = html_entity_decode($target);
 $previous_target = html_entity_decode($previous_target);

 // Make the page fetch request
 sleep(rand(3, 6));
 $result = http_get($target, $ref=$previous_target, GET, "", EXCL_HEAD);
 $page = $result['FILE'];

 #-------------------------------------------------
 # Start: Parsing content
 # (Perform the "insertion parse", which is explained in the book.)
 #
 # This parse starts by inserting special tags "<data> ...content.. </data>"
 # around the desired content. Then we create an array, each element containing
 # the data between <data></data> tags
 #-------------------------------------------------

 // We need to place the first "<data>" tag before the first piece of desired
 // data, which we know starts with the first occurrence of $separator
 $separator = "<!--@gap;-->";

 // Find first occurrence of $separator
 $beg_position = strpos($page,  $separator);

 // Get rid of everything before the first piece of desired data
 // and insert a "<data>" tag before the data.
 $page = substr($page, $beg_position, strlen($page));
 $page = "<data>".$page;


 // We know that each piece of desired data is separated by $separator
 //replace this text with our parse tags,
 // which will surround all desired content with <data> ... </data>.
 $page = str_replace($separator, "</data> <data>",  $page);

 // Put all the desired content into an array.
 $desired_content_array = parse_array($page, "<data>", "</data>", EXCL);

 # End: Parsing content
 #-------------------------------------------------

 #-------------------------------------------------
 # Start: Look for the $desired_site in each result case
 for($page_rank=0; $page_rank<count($desired_content_array); $page_rank++)
 {
  // Look for the $desired_site to appear in one of the listings
  if(stristr($desired_content_array[$page_rank], trim($desired_site)))
  {
   $url_found_rank_on_page = $page_rank; // add one to compensate for listing 0
   $url_found=true;
  }
 }
 # End: Parsing content
 #-------------------------------------------------

 #-------------------------------------------------
 # Start: Get location of the next page

 // Create an array of links on this page
 $search_links = parse_array($result['FILE'], "<a", "</a>", EXCL);

 // Look for the link with the word "Next" in it, as we know this
 // link contains the address of the next page.
 for($xx=0; $xx<count($search_links); $xx++)
 {
  if(strstr($search_links[$xx], "Next"))
  {
   $previous_target = $target;
   $target = get_attribute($search_links[$xx], "href");

   // Remember that this path is relative to the target page,
   // so add protocol and domain
   $target = "http://www.schrenk.com/nostarch/webbots/search/".$target;
  }
 }
 # End: Get location of the next page
 #-------------------------------------------------

 # Don't seatch forever, stop after 10 pages
 if($page_index==10)
 {
  break;
 }
}
# End: Loop
#-------------------------------------------------

#-------------------------------------------------
# Start: Display report
echo "\n";
if($url_found)
{
 echo "When performing a search on the phrase \"$search_term\" \n";
 echo "\"$desired_site\" is ranked as item $url_found_rank_on_page ";
 echo "on page $page_index. \n";
 echo "Its ranking is: $page_index.$url_found_rank_on_page.\n";
}
else
{
 echo "TIMEOUT\n";
 echo "\"$desired_site\" was not found using the search term \"$search_term\" \n";
 echo "$page_index pages searched.\n";
}
echo "\n\n";
# End: Display report
#-------------------------------------------------
?>
