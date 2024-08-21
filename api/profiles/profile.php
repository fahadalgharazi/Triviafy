<?php

$servername = "oceanus.cse.buffalo.edu:3306";
$dbUsername = "xiangjia";
$password = "50344634";
$database = "cse442_2024_spring_team_t_db";

// might need to change this when deploying
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); 
}


$conn = new mysqli($servername, $dbUsername, $password, $database);


if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


if (isset($_COOKIE['auth'])) {
    $authToken = $_COOKIE['auth'];


    $stmt = $conn->prepare("SELECT username FROM login_auth WHERE token = ?");
    $stmt->bind_param("s", $authToken);


    $stmt->execute();
    $result = $stmt->get_result();


    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $username = $row['username'];


        echo json_encode(['username' => $username]);
    } else {

        echo json_encode(['error' => 'No user found with the provided auth token']);
    }


    $stmt->close();
} else {

    echo json_encode(['error' => 'Auth token not provided']);
}


$conn->close();
?>
