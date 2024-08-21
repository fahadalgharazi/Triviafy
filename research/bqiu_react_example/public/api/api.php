<?php
header("Access-Control-Allow-Origin: *"); 
header('Content-Type: application/json');
$response = ['message' => 'If you can see this, PHP Webserver is working! :)'];
echo json_encode($response);
