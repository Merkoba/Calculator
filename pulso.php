<?php
	
	// test 3

	$k = $_GET['k'];

	if($k == 3641)
	{
		chdir("/var/www/calculator/");
		exec('sudo git pull origin master 2>&1', $output);
		echo implode("<br/>\n", $output);
	}

?>