<?php

$servername = "oceanus.cse.buffalo.edu:3306";
$username = "xiangjia";
$password = "50344634";
$database = "cse442_2024_spring_team_t_db";

header('Access-Control-Allow-Origin: *'); // change this when deploying
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Decode JSON from the request body
    $json = file_get_contents('php://input');
    $data = json_decode($json, true); // decode to associative array

    if (isset($data['username']) && isset($data['password'])) {
        $new_username = $data["username"];
        $new_pass = $data['password'];
        $games_played = 0;
        $games_won = 0;
        $spotify = 0;

        // check if username exists
        $prepared = $conn->prepare("SELECT * FROM userProfile WHERE username = ?");
        if (!$prepared) {
            echo "Error in prepare statement: " . $conn->error;
            exit;
        }
        $prepared->bind_param("s", $new_username);
        $prepared->execute();
        $prepared->store_result();

        if ($prepared->num_rows > 0) {
            // Username exists
            echo json_encode(["status" => "f", "message" => "Username already exists!"]);
            exit;
        } 

        $hash_pass = password_hash($new_pass, PASSWORD_DEFAULT); // auto salts before hashing
        $sql = "INSERT INTO userProfile (username, password, gameplayed, gamewon) VALUES (?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);

        if ($stmt === false) {
            die("Error preparing statement: " . $conn->error);
        }

        $stmt->bind_param("ssii", $new_username, $hash_pass, $games_played, $games_won);

        if ($stmt->execute() === false) {
            die("Error executing statement: " . $stmt->error);
        }

        echo json_encode(["status" => "s", "message" => "New record created successfully!"]);
    } else {
        echo json_encode(["status"=>"f","message"=>"Username and password are needed!"]);
        exit;
    }

} else {
    echo "Not a POST request.";
}

$conn->close();
?>
