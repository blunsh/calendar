
<?php
	$datapath = "data/".$_GET["id"].".txt";
	if (file_exists($datapath)){
		$myFile = fopen($datapath, "r");
		$data = fread($myFile, filesize($datapath));
		
		fclose($myFile);
	} else {
		$data = '{"todo":[], "periodic":[], "event":[], "annual":{}}';
	}
	echo $data;
?>

