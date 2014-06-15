
<?php
	$datapath = "data/".$_POST["id"].".txt";
	
	
	$savejson = json_encode($_POST['data']);
//	$datapath = "E:\\Dropbox\\data\\notebook\\data.txt";
//	var_dump( $json);
	$fwr = fopen($datapath, 'w');
	$saved = fwrite($fwr, $savejson);
	fclose($fwr);

echo $saved;
?>

