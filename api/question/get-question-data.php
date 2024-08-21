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

// Retrieve the game_id from the query string
$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 0;

// Check if game_id is provided and greater than 0
if ($game_id > 0) {
    // SQL query to fetch all records with the specified game_id
    $sql = "SELECT spotify_song_id, preview_url, song_title, song_artist, question_type, answer_1, answer_2, answer_3, answer_4, ID FROM question_answer WHERE game_id = $game_id";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Create an array to store all the questions
        $questions = [];
        while ($row = $result->fetch_assoc()) {
            $questions[] = $row;
        }
        echo json_encode($questions);
    } else {
        // If no records are found
        echo json_encode(["message" => "No records found for the provided game_id"]);
    }
} else {
    // Return an error message if no valid game_id is provided
    echo json_encode(["error" => "No valid game_id provided"]);
}

// Close connection
$conn->close();

?>

