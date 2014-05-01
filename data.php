
<?php

	$datapath = "E:\\Dropbox\\data\\notebook\\data.txt";
	$myFile = fopen($datapath, "r");
	$data = fread($myFile, filesize($datapath));
	
	fclose($myFile);

echo $data;
?>

