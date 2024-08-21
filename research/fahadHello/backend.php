<?php
// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Set response content type
header("Content-Type: application/json");

// Create response array
$response = array("message" => "Hello, World!");

// Convert array to JSON and output it
echo json_encode($response);
