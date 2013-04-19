<?php

require_once 'autorun.php';

class simple_test extends UnitTestCase{

	function testFirst(){
		$this->assertEqual("a","b","This should generate an error");
	}

	function testSecond(){
		$this->assertEqual("a","a","This should pass");
	}
}
