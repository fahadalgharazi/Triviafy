<?php

$servername = "oceanus.cse.buffalo.edu:3306";
$username = "xiangjia";
$password = "50344634";
$database = "cse442_2024_spring_team_t_db";

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Retrieve the question ID from the query string
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

// Check if ID is provided and greater than 0
if ($id > 0) {
    // SQL query to update/increment the record with the specified ID
    $sql = "UPDATE games SET current_question = 1 WHERE ID = $id";
    $result = $conn->query($sql);

    echo json_encode("current_question was successfully reset");

} else {
    // Return an error message if no valid ID is provided
    echo json_encode(["error" => "No valid ID provided"]);
}

// Close connection
$conn->close();

?>
