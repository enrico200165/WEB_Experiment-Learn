<?php

require_once 'MYString_testcase.php';
require_once "PHPUnit/Autoload.php";

$suite  = new MYStringTest("MYStringTest");
$result = new PHPUnit_Framework_TestResult(); 
$suite->run($result);
echo "fatto";
?> 
