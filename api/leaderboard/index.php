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

// Get the 'id' parameter from the URL query string
$id = isset($_GET['id']) ? $_GET['id'] : '';

// Prepare and bind
$sql = "SELECT username, score, round FROM scores WHERE game_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $id);

$stmt->execute();
$result = $stmt->get_result();

$leaderboard = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $leaderboard[] = $row;
    }
    echo json_encode($leaderboard);
} else {
    echo json_encode([]);
}

// Close connection
$stmt->close();
$conn->close();

?>

