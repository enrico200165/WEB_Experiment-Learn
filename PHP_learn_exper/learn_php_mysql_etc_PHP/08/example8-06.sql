
/* contenuti originarii  ---------------

CREATE TABLE classics (
 author VARCHAR(128),
 title VARCHAR(128),
 type VARCHAR(16),
 year CHAR(4),
 id INT UNSIGNED NOT NULL AUTO_INCREMENT KEY) ENGINE MyISAM;
 
 fine contenuti originarii -------------*/

<?php // sqltest.php


$query = <<<_END
CREATE TABLE classics IF NOT EXISTS (
 author VARCHAR(128),
 title VARCHAR(128),
 type VARCHAR(16),
 year CHAR(4),
 id INT UNSIGNED NOT NULL AUTO_INCREMENT KEY) ENGINE MyISAM;
_END;


// Note: This example is different to the one in the book. It has
//       been amended to work correctly when deleting entries.

require_once '../../EV_PHP_utils/ev_utils.php';

try {
	$dbh = new PDO("mysql:host=localhost", "root","Ruthdan0");
	$stmt = $dbh->execute($query)

} catch(PDOException $e) {
	print "Error!: " . $e->getMessage() . "<br/>";
	die();
}

