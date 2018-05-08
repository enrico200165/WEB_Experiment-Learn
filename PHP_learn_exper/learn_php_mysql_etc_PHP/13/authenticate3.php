<?php // authenticate2.php
require_once 'login.php';
session_start();

if (isset($_SERVER['PHP_AUTH_USER']) &&
		isset($_SERVER['PHP_AUTH_PW']))
{
	if (!isset($_SESSION) || !isset($_SESSION['sessione']) || $_SESSION['sessione'] == null || $_SESSION['sessione'] < 1) {
		$db_server = mysql_connect($db_hostname, $db_username, $db_password);
		if (!$db_server) die("Unable to connect to MySQL: " . mysql_error());
		mysql_select_db($db_database)
		or die("Unable to select database: " . mysql_error());

		//$un_temp = mysql_entities_fix_string($_SERVER['PHP_AUTH_USER']);
		//$pw_temp = mysql_entities_fix_string($_SERVER['PHP_AUTH_PW']);
		$un_temp = mysql_entities_fix_string("bsmith");
		$pw_temp = mysql_entities_fix_string("mysecret");
		
		
		$query = "SELECT * FROM users WHERE username='$un_temp'";
		$result = mysql_query($query);
		if (!$result) die("Database access failed: " . mysql_error());
		elseif (mysql_num_rows($result))
		{
			$row = mysql_fetch_row($result);
			$salt1 = "qm&h*";
			$salt2 = "pg!@";
			$token = md5("$salt1$pw_temp$salt2");

			echo "<p>faccio il login, ignorando l'input </p>";
				
			if ($token == $row[3])
			{
				$_SESSION['username'] = $un_temp;
				$_SESSION['password'] = $pw_temp;
				$_SESSION['forename'] = $row[0];
				$_SESSION['surname']  = $row[1];
				echo "$row[0] $row[1] : Hi $row[0],
				you are now logged in as '$row[2]'";
				$_SESSION['sessione'] = 1;
				echo ("<p><a href='authenticate3.php'>Click here to reload</a></p>");
			}
			else die("Invalid username/password combination");
		}
		else die("Invalid username/password combination");
	} else {
		$_SESSION['sessione']++;
		echo "<br />sei nella sessione ". $_SESSION['sessione'];
		echo ("<p><a href='authenticate3.php'>Click here to reload</a></p>");
	}
}
else
{
	header('WWW-Authenticate: Basic realm="Restricted Section"');
	header('HTTP/1.0 401 Unauthorized');
	die ("Please enter your username and password");
}

function mysql_entities_fix_string($string)
{
	return htmlentities(mysql_fix_string($string));
}

function mysql_fix_string($string)
{
	if (get_magic_quotes_gpc()) $string = stripslashes($string);
	return mysql_real_escape_string($string);
}
