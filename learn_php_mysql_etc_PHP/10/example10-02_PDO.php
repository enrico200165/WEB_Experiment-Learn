<?php
require_once 'login.php';


try {
	$dbh = new PDO('mysql:host=localhost;dbname=kissakoit', $db_username,$db_password);
	
	$stmt = $dbh->query('SELECT name, value from variable');
	
	$row_count = $stmt->rowCount();
	print "there are nr rows: ${row_count}\n";
	
	foreach($stmt as $row) {
//		print($row['name']) . "<br />";
		print($row['name']);
		print_r("> ".$row['value']);		
		//		(()) . "> " . $row['value'] . "\n";
		print("\n");		
		
	}
	$dbh = null;
} catch (PDOException $e) {
	print "Error!: " . $e->getMessage() . "<br/>";
	die();
}



?>