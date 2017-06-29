<?php

	// $ip = getenv('HTTP_CLIENT_IP')?:
	// getenv('HTTP_X_FORWARDED_FOR')?:
	// getenv('HTTP_X_FORWARDED')?:
	// getenv('HTTP_FORWARDED_FOR')?:
	// getenv('HTTP_FORWARDED')?:
	// getenv('REMOTE_ADDR');

	// if(0 === strpos("104.192.143", $ip)) 

	$k = $_GET['k'];

	if($k == 3641)
	{
		chdir("/var/www/calculator/");
		exec('sudo git pull  2>&1', $output);
		echo implode("<br/>\n", $output);
	}

?>