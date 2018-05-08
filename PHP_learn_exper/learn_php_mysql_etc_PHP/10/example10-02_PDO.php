<?php
require_once 'login.php';
require_once 'ev_utils.php';

$sapi = php_sapi_name() ;
echo $sapi;


try {
	$dbh = new PDO("mysql:host=localhost;dbname=${db_database}", $db_username,$db_password);

	$stmt = $dbh->query('SELECT name, value from variable');

	$row_count = $stmt->rowCount();
	print "there are nr rows: ${row_count}\n";

	foreach($stmt as $row) {
		//		print($row['name']) . "<br />";
		print($row['name']);
		print_r("> ".$row['value']);
		print(evNL());

	}
	$dbh = null;
} catch (PDOException $e) {
	print "Error!: " . $e->getMessage() . "<br/>";
	die();
}

echo $sapi;

?>