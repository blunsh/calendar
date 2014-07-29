<?php
	
	
	//var_dump($_POST);
	$data = '{"time":"'.round(microtime(true) * 1000).'","data":'.json_encode($_POST).'}';

	
	//echo $data;
	// Запись в файл
	//exit;
	
	
	$fileName = "login.txt";
	$file = fopen($fileName, 'w') or die("can't open file");
	$saved = fwrite($file, $data);
	fclose($file);
		
	echo $data;
?>

