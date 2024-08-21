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

// Retrieve the 'pin' parameter from the URL query string
if (isset($_GET['pin'])) {
    $pin = $_GET['pin'];
    
    // Prepared statement to select the ID from games where the pin matches
    $stmt = $conn->prepare("SELECT ID FROM games WHERE pin = ?");
    $stmt->bind_param("s", $pin); // 's' specifies the variable type => 'string'

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode($row);
    } else {
        echo json_encode(['error' => 'No game found for this pin']);
    }

    // Close statement and connection
    $stmt->close();
} else {
    echo json_encode(['error' => 'No pin provided']);
}

$conn->close();
?>

