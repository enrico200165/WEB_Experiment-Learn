<?php

require_once './MYString_testcase.php';
require_once 'PHPUnit.php';

$suite  = new PHPUnit_TestSuite("MYStringTest");
$result = PHPUnit::run($suite);

echo $result -> toString();
?> 
