<?php
class MYString
{
	//contains the internal data
	var $data;

	// constructor
	function __construct($data) {
		$this->data = $data;
	}

	// creates a deep copy of the string object
	function copy() {
		$ret = new MYString($this->data);
		return $ret;
	}

	// adds another string object to this class
	function add($string) {
		$this->data = $this->data . $string->toString("%s");
	}

	// returns the formated string
	function toString($format) {
		$ret = sprintf($format, $this->data);
		return $ret;
	}
	public function __toString() {
		return $this->data;
	}
}
?>