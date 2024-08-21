<?php
$servername = "oceanus.cse.buffalo.edu:3306";
$username = "xiangjia";
$password = "50344634";
$database = "cse442_2024_spring_team_t_db";

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Assume username is sent via GET from React
$username = $_GET['username'];

// Prepare SQL to fetch the access token
$stmt = $conn->prepare("SELECT access_token FROM Spotify WHERE user_id = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if (!$row) {
    echo json_encode(["error" => "No access token found for user"]);
    $stmt->close();
    $conn->close();
    exit;
}

$accessToken = $row['access_token'];
// $refreshToken = $row['refresh_token'];

// $accessToken = "BQDVoUh6BMtV97M6N2Rkp8DurnwiaTFvAbHH_PTXtjzZW0YR1ATSNxuXJSv8YJ2xxPd3HMPh6v14F7EvoWYZt-dTERbgSdAOk0tdsL6iX4rO5mdVbbksDNaAVBObJnX1hxiUjUEQJ0dneYZ9crLURt714I1RbE2WU7mnRYUGyv8O4EB02NM_2QmySFCVDLwIgo8";
$stmt->close();

// Use the access token to call Spotify API
$apiUrl = "https://api.spotify.com/v1/me/playlists";
$curl = curl_init($apiUrl);
curl_setopt($curl, CURLOPT_HTTPHEADER, array("Authorization: Bearer {$accessToken}"));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
$playlistsJson = curl_exec($curl);
curl_close($curl);
//echo $playlistsJson;
if (!$playlistsJson) {
    echo json_encode(["error" => "Failed to retrieve playlists"]);
    $conn->close();
    exit;
}
//get the songs 

echo $playlistsJson;
$conn->close();
?>
