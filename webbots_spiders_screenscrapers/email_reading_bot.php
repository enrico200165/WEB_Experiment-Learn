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



<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
<title>Read email</title>
</head>

<body>
	<?
	include("LIB_pop3.php");
	include("LIB_parse.php");
	define("SERVER", YOUR_MAIL_SERVER);       // Name of your POP3 mail server
	define("USER",   YOUR_EMAIL_ADDRESS);     // Your POP3 email address
	define("PASS",   YOUR_PASSWORD);          // Your POP3 password

	// Connect to POP3 server
	$connection_array =  POP3_connect(SERVER, USER, PASS);
	$POP3_connection = $connection_array['handle'];

	$list_array = POP3_list($POP3_connection);

	$message = POP3_retr($POP3_connection, 1);

	$ret_path  = return_between($message, "Return-Path: ", "\n", EXCL );
	$deliver_to = return_between($message, "Delivered-To: ", "\n", EXCL );
	$date = return_between($message, "Date: ", "\n", EXCL );
	$from = return_between($message, "From: ", "\n", EXCL );
	$subject = return_between($message, "Subject: ", "\n", EXCL );

	$content_type = return_between($message, "Content-Type: ", "\n", EXCL);
	$boundary = get_attribute($content_type, "boundary");
	$raw_msg = return_between($message, "--".$boundary, "--".$boundary, EXCL );
	$clean_msg = return_between($raw_msg, chr(13).chr(10).chr(13).chr(10), chr(13).chr(10).chr(13).chr(10), EXCL );

	echo "<xmp>ret_path   = $ret_path</xmp>";
	echo "<xmp>deliver_to   = $deliver_to</xmp>";
	echo "<xmp>date   = $date</xmp>";
	echo "<xmp>subject  = $subject</xmp>";
	echo "<xmp>content_type   = $content_type </xmp>";
	echo "<xmp>boundary  = $boundary </xmp>";
	echo "<xmp>clean_msg = $clean_msg</xmp>";
	?>
	<xmp> <?var_dump($message)?></xmp>
</body>
</html>
