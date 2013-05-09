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
# Get information about the zipcode 55435
$zipcode = 55435;
$zip_code_array = describe_zipcode($zipcode);

echo  "<b>Demonstration of converting a website into a function<br></b>";
echo  "Information about the zipcode $zipcode<br>";
echo  "City = ". $zip_code_array['CITY']."<br>";
echo  "State = ". $zip_code_array['STATE']."<br>";
echo  "County = ". $zip_code_array['COUNTY']."<br>";
echo  "Latitude = ". $zip_code_array['LATITUDE']."<br>";
echo  "Longitude = ". $zip_code_array['LONGITUDE']."<br>";


#---------------------------------------------------------------------
# Start interface describe_zipcode($zipcode)
function describe_zipcode($zipcode)
{
 # Get required libraries and declare the target
 include ("LIB_http.php");
 include("LIB_parse.php");
 $target = "http://www.schrenk.com/nostarch/webbots/zip_code_form.php";

 # Download the target
 $page = http_get($target, $ref="");

 # Parse the session hidden tag from the downloaded page
 # <input type="hidden" name="session" value="xxxxxxxxxx">
 $session_tag = return_between($string = $page['FILE'] ,
   $start = "<input type=\"hidden\" name=\"session\"",$end = ">", $type = EXCL);

 # Remove the "'s and "value=" text to reveal the session value
 $session_value = str_replace("\"", "", $session_tag);
 $session_value = str_replace("value=", "", $session_value);

 # Submit the form
 $data_array['session'] = $session_value;
 $data_array['zipcode'] = $zipcode;
 $data_array['Submit']  = "Submit";
 $form_result = http_post_form($target, $ref=$target, $data_array);

 $landmark = "Information about ".$zipcode;
 $table_array = parse_array($form_result['FILE'], "<table", "</table>");
 for($xx=0; $xx<count($table_array); $xx++)
 {
  # Parse the table containing the parsing landmark
  if(stristr($table_array[$xx], $landmark))
  {
   $ret['CITY'] = return_between($table_array[$xx], "CITY", "</tr>", EXCL);
   $ret['CITY'] = strip_tags($ret['CITY']);
   $ret['STATE'] = return_between($table_array[$xx], "STATE", "</tr>", EXCL);
   $ret['STATE'] = strip_tags($ret['STATE']);
   $ret['COUNTY'] = return_between($table_array[$xx], "COUNTY", "</tr>", EXCL);
   $ret['COUNTY'] = strip_tags($ret['COUNTY']);
   $ret['LATITUDE'] = return_between($table_array[$xx], "LATITUDE", "</tr>", EXCL);
   $ret['LATITUDE'] = strip_tags($ret['LATITUDE']);
   $ret['LONGITUDE'] = return_between($table_array[$xx], "LONGITUDE", "</tr>", EXCL);
   $ret['LONGITUDE'] = strip_tags($ret['LONGITUDE']);
  }
 }
 # Return the parsed data
 return $ret;
} # End Interface describe_zipcode($zipcode)
?>