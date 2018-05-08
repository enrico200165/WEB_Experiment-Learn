<?php
$o = new Translate();
echo $o->lookup();
echo $o->lookup2();

class Translate
{
	const ENGLISH = 0;
	const SPANISH = 1;
	const FRENCH  = 2;
	const GERMAN  = 3;
	// �

	function lookup()
	{
		echo self::SPANISH;
	}
	
	function lookup2()
	{
		echo self::GERMAN;
	}
}
?>
