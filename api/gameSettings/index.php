<?php

$servername = "oceanus.cse.buffalo.edu:3306";
$username = "xiangjia";
$password = "50344634";
$database = "cse442_2024_spring_team_t_db";

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Your other PHP code here...

// header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


//cd into this directory then run the php server
$data = json_decode(file_get_contents('php://input'), true); // Get the JSON data sent via POST
echo json_encode($data);
// Extract data from the JSON object
$gamemode = $data['gameMode'];
$rounds = $data['rounds'];
$Time = $data['Time'];
$pin = $data['pin'];
$status = "OPEN";
$songs = json_encode(($data['songs']));
$host = $data["host"];
// Prepare and bind SQL statement
$stmt = $conn->prepare("INSERT INTO games (songs, gameMode, rounds, Time, pin, status, host, current_question, total_questions) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)");
$stmt->bind_param("ssssssss", $songs, $gamemode, $rounds, $Time, $pin, $status, $host, $rounds);

$stmt->execute();

// Get the last inserted ID for the game
$game_id = $conn->insert_id;
//spotify

foreach (json_decode($songs) as $song) {
    $stmt_song = $conn->prepare("INSERT INTO question_answer (game_id, spotify_song_id, preview_url, song_title, song_artist, question_type, answer_1, answer_2, answer_3, answer_4, correct) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");    
    
    // Make sure to set these variables before this point in the code
    $question_type = "artist";
    $answer_1 = $song->random_artists[0];
    $answer_2=$song->random_artists[1];
    $answer_3 =$song->random_artists[2];
    $answer_4 = $song->random_artists[3];

    // Determine the correct index
    $correctIndex = 0;  // Default to 0 in case of no match
    if ($song->artist == $answer_1) {
        $correctIndex = 1;  // Indexing starts from 1 as per SQL typical usage
    } elseif ($song->artist == $answer_2) {
        $correctIndex = 2;
    } elseif ($song->artist == $answer_3) {
        $correctIndex = 3;
    } elseif ($song->artist == $answer_4) {
        $correctIndex = 4;
    }

    $stmt_song->bind_param("isssssssssi", $game_id, $song->id, $song->preview_url, $song->name, $song->artist, $question_type, $answer_1, $answer_2, $answer_3, $answer_4, $correctIndex);
    
    $stmt_song->execute();
}

// Close connection
$conn->close();

?>
