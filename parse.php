<?php

$arr = array();

function isTime($v){
	return preg_match_all('/:/', $v, $mat)>3&&preg_match('/-->/', $v);
}

// function p(s){ // parse for '//'
// 	$org = $s;
// 	$a = explode(' ',$s);
// 	$res = '';
// 	foreach($d as $a => $v){
// 		if(a[d]!==''){
// 			// console.log(a);
// 			if(a[d].search(/[^\/|'']\/[^\/|'']/g)!==-1){
// 				res += 's';
// 			} else {
// 				res += $a['d'];
// 			}
// 		} else {
// 			res += ' ';
// 		}
// 	}
// }

function parse($file, &$arr, $to){
	$i = -1;

	foreach($file as $v){
		if(isTime($v)){
			$i++;
		}
		if($i>=0){
			if($v!=='' && !is_numeric($v))
				// $arr[$to][$i][] = preg_replace('/\s+/', ' ', $v);
				$arr[$to][$i][] = $v;
		}
	}
}

if($_GET['path'] && file_exists($_GET['path'])){
	$file = file($_GET['path']);
	parse($file, $arr, 'videoSubs');
}
else{
	echo 'no path or no file';
	die();
}
if($_GET['voice'] && file_exists($_GET['voice'])){
	$file = file($_GET['voice']);
	parse($file, $arr, 'audioCoords');
} else {
	$arr['errors'][] = 'no voice or path to it';
}

echo json_encode($arr);