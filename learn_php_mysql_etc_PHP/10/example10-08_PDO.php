<?php // sqltest.php

// Note: This example is different to the one in the book. It has
//       been amended to work correctly when deleting entries.

require_once 'login.php';
require_once '../../EV_PHP_utils/ev_utils.php';

try {
	$dbh = new PDO("mysql:host=localhost;dbname=${db_database}", $db_username,$db_password);

	if (isset($_POST['delete']) && isset($_POST['isbn']))
	{
		$isbn  = get_post('isbn');
		$query = "DELETE FROM classics WHERE isbn='$isbn'";
		$stmt = $dbh->query($query);
	}


	if (isset($_POST['author']) &&
			isset($_POST['title']) &&
			isset($_POST['category']) &&
			isset($_POST['year']) &&
			isset($_POST['isbn']))
	{
		$author   = get_post('author');
		$title    = get_post('title');
		$category = get_post('category');
		$year     = get_post('year');
		$isbn     = get_post('isbn');

		$query = "INSERT INTO classics VALUES" .
				"('$author', '$title', '$category', '$year', '$isbn')";
		$stmt = $dbh->query($query);
	}
	echo <<<_END
<form action="sqltest.php" method="post"><pre>
  Author <input type="text" name="author" />
   Title <input type="text" name="title" />
Category <input type="text" name="category" />
    Year <input type="text" name="year" />
    ISBN <input type="text" name="isbn" />
         <input type="submit" value="ADD RECORD" />
</pre></form>
_END;


	$query = "SELECT * FROM classics";
	$stmt = $dbh->query($query);
	while($row = $stmt->fetch(PDO::FETCH_NUM)) {
		echo <<<_END
<pre>
  Author $row[0]
   Title $row[1]
Category $row[2]
    Year $row[3]
    ISBN $row[4]
</pre>
<form action="sqltest.php" method="post">
<input type="hidden" name="delete" value="yes" />
<input type="hidden" name="isbn" value="$row[4]" />
<input type="submit" value="DELETE RECORD" /></form>
_END;
	}


	$dbh = null;

} catch(PDOException $e) {
	print "Error!: " . $e->getMessage() . "<br/>";
	die();
}



function get_post($var)
{
	return mysql_real_escape_string($_POST[$var]);
}
?>
