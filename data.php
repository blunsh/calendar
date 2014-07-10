
<?php
	$datapath = "data/".$_GET["id"].".txt";
	if (file_exists($datapath)){
		$myFile = fopen($datapath, "r");
		$data = fread($myFile, filesize($datapath));
		
		fclose($myFile);
	} else {
		$data = '{"date":"'.round(microtime(true) * 1000).'","data":{"todo":[], "periodic":[], "event":[], "annual":{}}}';
	}
	echo $data;
?>

