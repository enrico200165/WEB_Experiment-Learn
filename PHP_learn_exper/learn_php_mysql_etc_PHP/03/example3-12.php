<?php
function longdate($timestamp)
{
	return date("l F jS Y", $timestamp);
}

// lines added by EV
$data = longdate(time());
echo $data;

?>
