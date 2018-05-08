<?php
function longdate($timestamp)
{
	$temp = date("l F jS Y", $timestamp);
	return "The date is $temp";
}

// codice aggiuto da me
echo "la data è " . longdate(time()-3600*24*10);
?>
