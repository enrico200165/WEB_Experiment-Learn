<?php // formtest2.php
if (isset($_POST['name'])) $name = $_POST['name'];
else $name = "(Not entered)";
$azione = basename(__FILE__);

echo <<<_END
<html>
	<head>
		<title>Form Test</title>
	</head>
	<body>
	Your name is: $name<br />
	<form method="post" action="$azione">
		What is your name?
		<input type="text" name="name" />
		<input type="submit" />
	</form>
	</body>
</html>
_END;
?>