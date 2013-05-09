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
// Define the source FTP server, file location and authentication values
define("REMOTE_FTP_SERVER", "remote_FTP_address");  // domain name or IP address
define("REMOTE_USERNAME", "yourUserName");
define("REMOTE_PASSWORD", "yourPassword");
define("REMOTE_DIRCTORY", "daily_sales");
define("REMOTE_FILE", "sales.txt");

// Define the corporate FTP server, file location and authentication values
define("CORP_FTP_SERVER", "corp_FTP_address");
define("CORP_USERNAME", "yourUserName");
define("CORP_USERNAME", "yourPassword");
define("CORP_USERNAME", "sales_reports");
define("CORP_USERNAME", "store_03_".date("Y-M-d"));

// Define mail variables and function for error reporting
include("LIB_MAIL.php");
$mail_addr['to'] = "admin@somedowmain.com";
$mail_addr['from'] = "admin@somedowmain.com";
function report_error_and_quit($error_message, $server_connection)
{
 global $mail_addr;
  
 // Send error message
 echo "$error_message, $server_connection";
 formatted_mail($error_message, $error_message, $mail_addr, "text/plain");

 // Attempt to gracefully log off the server, if possible
 ftp_close($server_connection);

 // It is not a traditional end to a function this way, but since there is
 // nothing else to do, it is best to exit.
 exit();
}

// Initialize error flag
$error_flag = false;

###################################################################3

// Negotiate a socket connection to the remote FTP server
$remote_connection_id = ftp_connect(REMOTE_FTP_SERVER);

// Log in (authenticate) the source server
if(!ftp_login($remote_connection_id, REMOTE_USERNAME, REMOTE_PASSWORD))
 report_error_and_quit("Remote ftp_login failed", $remote_connection_id);

###################################################################3

// Move the directory of the source file
if(!ftp_chdir($remote_connection_id, REMOTE_DIRCTORY))
 report_error_and_quit("Remote ftp_chdir failed", $remote_connection_id);

// Download the file
if(!ftp_get($remote_connection_id, "temp_file", REMOTE_FILE, FTP_ASCII))
 report_error_and_quit("Remote ftp_get failed", $remote_connection_id);

// Close connections to the remote FTP server
ftp_close($remote_connection_id);

###################################################################3

// Negotiate a socket connection to the source FTP server
$corp_connection_id = ftp_connect(CORP_FTP_SERVER);

// Log into the source server
if(!ftp_login($corp_connection_id, CORP_USERNAME, CORP_PASSWORD))
 report_error_and_quit("Corporate ftp_login failed", $corp_connection_id);

// Move the the directory of the source file
if(!ftp_chdir($corp_connection_id, CORP_DIRECTORY))
 report_error_and_quit("Corporate ftp_chdir failed", $corp_connection_id);

// Upload the file
if(!ftp_put($corp_connection_id, CORP_FILE, "temp_file", FTP_ASCII))
 report_error_and_quit("Corporate ftp_put failed", $corp_connection_id);

// Close connections to the remote FTP server
ftp_close($corp_connection_id);

// Send notification that the webbot ran successfully
formatted_mail("ftpbot ran successfully at ".time("M d,Y h:s"), "", $mail_addr, $content_type);
?>
