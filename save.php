
<?php


	$savejson = json_encode($_POST['data']);
	$myFile = "E:\\Dropbox\\data\\notebook\\data.txt";
//	var_dump( $json);
	$fwr = fopen($myFile, 'w');
	$saved = fwrite($fwr, $savejson);
	fclose($fwr);

echo $saved;
?>

