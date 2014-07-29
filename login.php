<!DOCTYPE html>
<html>
<head>	
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />	
	<title>Сalendar</title>	
	<link media="screen,projection" type="text/css" rel="stylesheet" href="css/dark-hive/jquery-ui-1.10.4.custom.min.css" />
	<link media="screen,projection" type="text/css" rel="stylesheet" href="css/all.css" />
	
	<script src="js/jquery-2.1.0.min.js" type="text/javascript"></script>
</head>
<body>
	<div id="wrapper">		
		<div id="page" class="">
<script type="text/javascript">
		$(function(){
					$.ajax({
						url: 'savetoken.php',
						method: 'POST',
						data: window.location.hash.substr(1, window.location.hash.length-1),
						success: function(msg){
							console.log('msg:: ', msg);
							console.log('msg:: ', JSON.parse(msg));
							//window.open('http://localhost/notebook/');
							//window.close();
						}
					});
				
				})	;	
		
	</script>
				
	
		</div>
	</div>
</body>	
</html>	
<?php
	echo 'hi'.'<br>';
	echo '<a id="login">';
	exit;
	
	
	$data = '{"time":"'.round(microtime(true) * 1000).'","data":'.json_encode($_GET).'}';
	//var_dump($_GET);
	
	$url = $_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
	echo 'URL = '.$url.'<br>';
	
	$parse = parse_url($url, PHP_URL_FRAGMENT);
	echo 'hash = '.$parse.'<br>';
	
	//echo '<br>'.json_encode($_GET).'<br>';
	// Запись в файл
	exit;
	
	
	$fileName = "login.txt";
	$file = fopen($fileName, 'w') or die("can't open file");
	$saved = fwrite($file, $data);
	fclose($file);
		
	echo $data;
?>

