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
# Initialization
include("LIB_http.php");
include("LIB_parse.php");
$product_array=array();
$product_count=0;

# Download the target (store) web page
$target = "http://www.tellmewhenitchanges.com/buyair";
$web_page = http_get($target, "");

# Parse all the tables on the web page into an array
$table_array = parse_array($web_page['FILE'], "<table", "</table>");

# Look for the table that contains the product information
for($xx=0; $xx<count($table_array); $xx++)
{
 $table_landmark = "Products For Sale";
 if(stristr($table_array[$xx], $table_landmark))        // Process this table
 {
  echo "FOUND: Product table\n";

  # Parse table into an array of table rows
  $product_row_array = parse_array($table_array[$xx], "<tr", "</tr>");

  for($table_row=0; $table_row<count($product_row_array); $table_row++)
  {
   # Detect the beginning of the desired data (Heading row)
   $heading_landmark = "Condition";
   if((stristr($product_row_array[$table_row], $heading_landmark)))
   {
    echo "FOUND: Table heading row\n";

    # Get the postistion of the desired headings
    $table_cell_array = parse_array($product_row_array[$table_row], "<td", "</td>");
    for($heading_cell=0; $heading_cell<count($table_cell_array); $heading_cell++)
    {
     if(stristr(strip_tags(trim($table_cell_array[$heading_cell])), "ID#"))
      $id_column=$heading_cell;
     if(stristr(strip_tags(trim($table_cell_array[$heading_cell])), "Product Name"))
      $name_column=$heading_cell;
     if(stristr(strip_tags(trim($table_cell_array[$heading_cell])), "Price"))
      $price_column=$heading_cell;
    }
    echo "FOUND: id_column=$id_column\n";
    echo "FOUND: price_column=$price_column\n";
    echo "FOUND: name_column=$name_column\n";

    # Save the heading row for later use
    $heading_row = $table_row;
   }

   # Detect the end of the desired data
   $ending_landmark = "Calculate";
   if((stristr($product_row_array[$table_row], $ending_landmark)))
   {
    echo "PARSING COMPLETE!\n";
    break;
   }

   # Parse product & price data
   if(isset($heading_row) && $heading_row<$table_row)
   {
    $table_cell_array = parse_array($product_row_array[$table_row], "<td", "</td>");
    $product_array[$product_count]['ID'] = strip_tags(trim($table_cell_array[$id_column]));
    $product_array[$product_count]['NAME'] = strip_tags(trim($table_cell_array[$name_column]));
    $product_array[$product_count]['PRICE'] = strip_tags(trim($table_cell_array[$price_column]));
    $product_count++;
    echo"PROCESSED: Item #$product_count\n";
   }
  }
 }
}
# Display the collected data
for($xx=0; $xx<count($product_array); $xx++)
{
 echo "$xx. ";
 echo "ID: ".$product_array[$xx]['ID'].", ";
 echo "NAME: ".$product_array[$xx]['NAME'].", ";
 echo "PRICE: ".$product_array[$xx]['PRICE']."\n";
}
?>