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

if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['username'])) {
    $requestedUsername = $conn->real_escape_string($_GET['username']);
    
    $sql = "SELECT ID, username, gameplayed, gamewon FROM userProfile WHERE username = '$requestedUsername'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode($row);

    } else {
        echo json_encode(['error' => 'User not found']);
    }
}


?>