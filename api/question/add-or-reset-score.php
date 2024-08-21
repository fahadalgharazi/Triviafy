<?php

$servername = "oceanus.cse.buffalo.edu:3306";
$username = "xiangjia";
$password = "50344634";
$database = "cse442_2024_spring_team_t_db";

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($_GET["id"]) ? $_GET["id"] : '';

$username = isset($data["username"]) ? $data["username"] : '';
$auth_token = isset($data["auth_token"]) ? $data["auth_token"] : '';

// Start transaction to ensure data integrity
$conn->begin_transaction();

try {
    if(!empty($auth_token)) {
        // code here to search for token in 
        $stmt = $conn->prepare("SELECT username, token FROM login_auth WHERE token = ?");
        $stmt->bind_param("s", $auth_token);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $username = $row["username"];
        }
        
    }

    // Check if username already exists
    $stmt = $conn->prepare("SELECT COUNT(*) FROM scores WHERE username = ? AND game_id = ?");
    $stmt->bind_param("ss", $username, $id);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

    if ($count > 0) {
        // Username exists, update the score
        $updateStmt = $conn->prepare("UPDATE scores SET score = 0 WHERE username = ? AND game_id = ?");
        $updateStmt->bind_param("ss", $username, $id);
        $updateStmt->execute();
        $updateStmt->close();
    } else {
        // Username does not exist, insert a new record
        if(!empty($username)) {
            $insertStmt = $conn->prepare("INSERT INTO scores (game_id, username, score, round) VALUES (?, ?, 0, 0)");
            $insertStmt->bind_param("ss", $id, $username);
            $insertStmt->execute();
            $insertStmt->close();
        }
    }

    // Commit transaction
    $conn->commit();

    echo json_encode(array("message" => "Operation successful"));
} catch (Exception $e) {
    // An error occurred, rollback changes
    $conn->rollback();
    echo json_encode(array("error" => "An error occurred: " . $e->getMessage()));
}

$conn->close();

?>
