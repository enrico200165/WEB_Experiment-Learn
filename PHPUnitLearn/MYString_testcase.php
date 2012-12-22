<?php

require_once 'MYString.php';
require_once "PHPUnit/Autoload.php";


// class MYStringTest extends PHPUnit_TestCase

class MYStringTest extends PHPUnit_Framework_TestCase
{
	// contains the object handle of the string class
	var $abc;

	// constructor of the test suite
	function MYStringTest($name) {
		parent::__construct($name);
	}

	// called before the test functions will be executed
	// this function is defined in PHPUnit_TestCase and overwritten
	// here
	function setUp() {
		// create a new instance of String with the
		// string 'abc'
		$this->abc = new MYString("abc");
	}

	// called after the test functions are executed
	// this function is defined in PHPUnit_TestCase and overwritten
	// here
	function tearDown() {
		// delete your instance
		unset($this->abc);
	}

	// test the toString function
	function testToString() {
		$result = $this->abc->toString('contains %s');
		$expected = 'contains abc';
		$this->assertTrue($result == $expected);
	}

	// test the copy function
	function testCopy() {
		$abc2 = $this->abc->copy();
		$this->assertEquals($abc2, $this->abc);
	}

	// test the add function
	function testAdd() {
		$abc2 = new MYString('123');
		$this->abc->add($abc2);
		$result = $this->abc->toString("%s");
		$expected = "abc123";
		$this->assertTrue($result == $expected);
	}
}
?>
