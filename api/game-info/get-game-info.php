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
    // SQL query to fetch the record with the specified ID
    $sql = "SELECT current_question, total_questions FROM games WHERE ID = $id";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $game_info = $result->fetch_assoc();
        echo json_encode($game_info);
    } else {
        // If no record is found
        echo json_encode(["message" => "No record found for the provided ID"]);
    }
} else {
    // Return an error message if no valid ID is provided
    echo json_encode(["error" => "No valid ID provided"]);
}

// Close connection
$conn->close();

?>
