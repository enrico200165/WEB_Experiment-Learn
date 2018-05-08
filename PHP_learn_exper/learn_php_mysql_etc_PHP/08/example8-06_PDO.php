<?php // sqltest.php

/* contenuti originarii  ---------------

CREATE TABLE classics (
		author VARCHAR(128),
		title VARCHAR(128),
		type VARCHAR(16),
		year CHAR(4),
		id INT UNSIGNED NOT NULL AUTO_INCREMENT KEY) ENGINE MyISAM;

fine contenuti originarii -------------*/

require_once '../../EV_PHP_utils/ev_utils.php';

$dbh = null;


function createClassicsDBCols() {

	$query = <<<_END
CREATE TABLE classics IF NOT EXISTS (
 author VARCHAR(128),
 title VARCHAR(128),
 type VARCHAR(16),
 year CHAR(4),
 id INT UNSIGNED NOT NULL AUTO_INCREMENT KEY) ENGINE MyISAM;
_END;

}


function connectDB() {
	static $dbh = null;
	try {
		if ($dbh == null) {
			$dbh = new PDO("mysql:host=localhost", "root","Ruthdan0", 
					array(PDO::ATTR_EMULATE_PREPARES => false,
					PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
		}
		return $dbh;
	} catch (PDOException $e) {
		echo $e->__toString();
		die();
	}
}


function listDBs() {

	$dbsLilst = array();
	$dbs = connectDB()->query( 'SHOW DATABASES' );

	while( ( $db = $dbs->fetchColumn( 0 ) ) !== false ) {
		$dbsLilst[] = $db;
		echo $db . evNL();
	}
	return $dbsLilst;
}



function createClassicsDB() {

	$createDBQuery = <<< _END
CREATE DATABASE 'publications';
_END;

	try {
		$dbh = connectDB();
		$stmt = $dbh->query($createDBQuery);
	} catch(PDOException $e) {
		print "Error!: " . $e->getMessage() . "<br/>";
		die();
	}

}

print_r(listDBs());
// createClassicsDB();

?>