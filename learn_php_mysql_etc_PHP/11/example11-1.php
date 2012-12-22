<?php // formtest.php
echo <<<_END
<html>
	<head>
		<title>Form Test</title>
	</head>
	<body>
	<form method="post" action=basename(__FILE__) />
		What is your name?
		<input type="text" name="name" />
		<input type="submit" />
	</form>
	</body>
</html>
_END;
?>