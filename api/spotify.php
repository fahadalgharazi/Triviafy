<?php

$servername = "oceanus.cse.buffalo.edu:3306";
$username = "xiangjia";
$password = "50344634";
$database = "cse442_2024_spring_team_t_db";

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$postMap = json_decode(file_get_contents('php://input'), true);
$code = $postMap['code'];
$username = $postMap['username'];
$url = 'https://accounts.spotify.com/api/token';

$data = [
  'grant_type' => 'authorization_code',
  'code' => $code,
  'redirect_uri' => 'http://localhost:3000/spotifyURI',
  'client_id' => 'b819c8bc4b504da8a1b0f26fd745f408',
  'client_secret' => 'adb7b5cf81514c89ae43962c1f427a55',
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$responseData = json_decode($response, true);
echo json_encode($responseData);
// Check if the response contains an error
if (isset($responseData['error'])) {
    echo "Error from Spotify API: " . $responseData['error_description'];
    exit; // Exit the script or handle the error appropriately
}

// Check if the expected data is present in the response
if (!isset($responseData['access_token'], $responseData['refresh_token'], $responseData['expires_in'], $responseData['token_type'])) {
    echo "Required data not found in the response";
    exit; // Exit the script or handle this case appropriately
}

$accessToken = $responseData['access_token'];
$refreshToken = $responseData['refresh_token'];
$expiresIn = $responseData['expires_in'];
$tokenType = $responseData['token_type'];
$expiryTimestamp = date('Y-m-d H:i:s', time() + $expiresIn);
echo $expiryTimestamp;

// Prepare an insert or update statement
// $stmt = $conn->prepare("INSERT INTO Spotify (access_token, expires_in, refresh_token, token_type) VALUES (?, ?, ?, ?)");
$stmt = $conn->prepare("INSERT INTO Spotify (user_id, access_token, refresh_token, token_type, expires_in) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), refresh_token = VALUES(refresh_token), token_type = VALUES(token_type), expires_in = VALUES(expires_in)");

if (false === $stmt) {
    // Handle error when prepare() fails
    echo "Prepare failed: " . $conn->error;
} else {
    // Bind parameters and execute
    $stmt->bind_param("sssss", $username, $accessToken, $refreshToken, $tokenType, $expiryTimestamp);
    if ($stmt->execute()) {
        echo "Data inserted successfully";
    } else {
        // If execute() fails, output error
        echo "Execute failed: " . $stmt->error;
    }

    // Close statement
    $stmt->close();
}

// Close connection
$conn->close();
?>
