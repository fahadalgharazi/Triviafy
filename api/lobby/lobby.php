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

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    
    exit(0);
}

header('Content-Type: application/json');

// Check the HTTP method of the request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Decode the incoming JSON payload
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate incoming data
    if (isset($data['lobbyId']) && isset($data['player'])) {
        $lobbyId = $data['lobbyId'];
        $player = $data['player']['username'];
        // Add player to the specified lobby
        if (!isset($data["action"])){

            // enter player data & pin into lobby
            $stmt = $conn->prepare("INSERT INTO players_users (username, lobby_pin) VALUES (?,?)");
            $stmt->bind_param("ss",$player, $lobbyId);

            // Execute the statement
            if ($stmt->execute()) {
                echo "Data inserted successfully";
            } else {
                echo "Error: " . $conn->error;
            }

            echo json_encode(['status' => 'success', 'message' => 'Player added to the lobby.']);
        }
        elseif(isset($data["action"])){
            if ($data["action"] === "LOBBY_GET"){
                $stmt = $conn->prepare("SELECT username FROM players_users WHERE lobby_pin=?");
                $stmt->bind_param("s", $lobbyId);
                if (!$stmt->execute()) {
                    echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
                } else {
                    $result = $stmt->get_result(); // Get the result object.
                    $retVal = [];
                    while ($row = $result->fetch_assoc()) { // Fetch as associative array.
                        array_push($retVal, $row['username']); // Assuming you want just the username.
                        // For more data, push the entire $row or a subset: array_push($retVal, ['username' => $row['username'], 'id' => $row['id']]);
                    }
                    if (count($retVal) > 0) {
                        echo json_encode(['status' => 'success', 'message' => 'Grabbing all players!', 'players' => $retVal]);
                    } else {
                        echo json_encode(['status' => 'success', 'message' => 'No players found', 'players' => $retVal]);
                    }
                }

            }
            elseif (isset($data['action']) && $data['action'] === 'disconnect') {
                // Disconnect logic
                $lobbyId = $data['lobbyId'];
                $username = $data["player"]['username'];

                $stmt = $conn->prepare("DELETE FROM players_users WHERE username=? AND lobby_pin=?");
                $stmt->bind_param("ss", $username, $lobbyId);
                if (!$stmt->execute()) {
                    echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
                }
                echo json_encode(['status'=>'success','message'=>sprintf("Player %s has been dropped", $username)]);
            }
            elseif (isset($data['action']) && $data['action']==="LOBBY_DATA"){
                $lobbyId = $data['lobbyId'];
                $stmt = $conn->prepare("SELECT * from games WHERE pin = ?");
                $stmt->bind_param("s", $lobbyId);
                if (!$stmt->execute()) {
                    echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
                }
                $stmt->store_result();
                $stmt->bind_result($i, $cq, $songs, $tq, $gm, $rds, $time, $p, $stat, $host);
                if ($stmt->num_rows > 0) {
                    $stmt->fetch();
                    $r = ["id"=>$i, "currQ"=>$cq,"songs"=>$songs ,"totalQ"=>$tq, "gamemode"=>$gm, "rounds"=>$rds, "time"=>$time, "pin"=>$p, "status"=>$stat, "host"=>$host];
                    echo json_encode($r);
                }
                else {
                    echo json_encode(["result"=>false,"message"=>"Lobby doesn't exist"]);
                    exit;
                }
            }
            elseif (isset($data["action"]) && $data['action']==="SET_LOBBY_STATUS"){
                $lobbyId = $data['lobbyId'];
                $newStatus = $data['updatedStatus'];
                $stmt = $conn->prepare("UPDATE games SET status = ? WHERE pin = ?");
                $stmt->bind_param("ss", $newStatus, $lobbyId);
                $stmt->execute();

                if ($stmt->affected_rows > 0) {
                    echo "Record updated successfully";
                } else {
                    echo "No records updated";
                }
            }
        }
    }

else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request data.']);
    }
} else {
    // Handle unsupported HTTP methods
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
?>
