<?php
$temp = "The date is ";
echo longdate(time());

function longdate($timestamp)
{
	// This attempt to access $temp in function longdate will fai
	return $temp . date("l F jS Y", $timestamp);
}
?>
