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

// Retrieve the question ID from the query string
$index = isset($_GET['id']) ? intval($_GET['id']) : 0;
$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 0;

// Added: Retrieve username from the request body
$username = isset($data["username"]) ? $data["username"] : '';
$auth_token = isset($data["auth_token"]) ? $data["auth_token"] : '';

if ($index > 0 && isset($data["answer"]) && !empty($auth_token)) {
    $sql = "SELECT correct, ID FROM question_answer WHERE game_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $game_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $questions = [];
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }

    // Check if the index is within the range of available questions
    if (isset($questions[$index - 1])) {
        $selectedAnswer = intval($data["answer"]);
        $correctAnswerIndex = $questions[$index - 1]["correct"];
        
        // Determine if the selected answer is correct
        $isCorrect = ($selectedAnswer == $correctAnswerIndex);

        // If the answer is correct, update the user's score
        if ($isCorrect) {
            // code here to search for token in 
            $stmt = $conn->prepare("SELECT username, token FROM login_auth WHERE token = ?");
            $stmt->bind_param("s", $auth_token);
            $stmt->execute();
            $result = $stmt->get_result();
        
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $username = $row["username"];
            }

            // Prepare a statement to insert or update the user's score
            $updateScoreStmt = $conn->prepare("
                INSERT INTO scores (username, score, round, game_id) 
                VALUES (?, 100, ?, ?) 
                ON DUPLICATE KEY UPDATE score = 100, round = ?
            ");
            $updateScoreStmt->bind_param("siii", $username, $index, $game_id, $index);

            if ($updateScoreStmt->execute()) {
                $updateSuccess = true; // Record success
            } else {
                $updateSuccess = false; // Record failure
            }
            $updateScoreStmt->close();
        }

        // Prepare the response
        $response = [
            'isCorrect' => $isCorrect,
            'correctAnswer' => $correctAnswerIndex,
            'scoreUpdated' => $updateSuccess ?? false // Ensure this key exists even if not updated
        ];
        echo json_encode($response);
    } else {
        echo json_encode(["error" => "Question not found"]);
    }

    $stmt->close();
    // end
}

else if ($index > 0 && isset($data["answer"]) && !empty($username)) {
    $sql = "SELECT correct, ID FROM question_answer WHERE game_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $game_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $questions = [];
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }

    // Check if the index is within the range of available questions
    if (isset($questions[$index - 1])) {
        $selectedAnswer = intval($data["answer"]);
        $correctAnswerIndex = $questions[$index - 1]["correct"];
        
        // Determine if the selected answer is correct
        $isCorrect = ($selectedAnswer == $correctAnswerIndex);

        // If the answer is correct, update the user's score
        if ($isCorrect) {
            // Prepare a statement to insert or update the user's score
            $updateScoreStmt = $conn->prepare("
                INSERT INTO scores (username, score, round, game_id) 
                VALUES (?, 100, ?, ?) 
                ON DUPLICATE KEY UPDATE score = 100, round = ?
            ");
            $updateScoreStmt->bind_param("siii", $username, $index, $game_id, $index);

            if ($updateScoreStmt->execute()) {
                $updateSuccess = true; // Record success
            } else {
                $updateSuccess = false; // Record failure
            }
            $updateScoreStmt->close();
        }

        // Prepare the response
        $response = [
            'isCorrect' => $isCorrect,
            'correctAnswer' => $correctAnswerIndex,
            'scoreUpdated' => $updateSuccess ?? false // Ensure this key exists even if not updated
        ];
        echo json_encode($response);
    } else {
        echo json_encode(["error" => "Question not found"]);
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "Invalid request"]);
}

$conn->close();

?>
