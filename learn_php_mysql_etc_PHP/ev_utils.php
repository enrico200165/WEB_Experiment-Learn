
<?php

function evNL() {
	switch ( php_sapi_name()) {
		case "cli": return "\n";
		break;
		default: return "<br />";
	}
}


?>