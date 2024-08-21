<?php
$servername = "oceanus.cse.buffalo.edu:3306";
$username = "xiangjia";
$password = "50344634";
$database = "cse442_2024_spring_team_t_db";

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Create connection
$conn = new mysqli($servername, $username, $password, $database);
$res = ["result"=>False, "message"=>"Username/password is incorrect.", "token" => null];

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true); // decode to associative array

    if ($json === null){
        error_log("JSON NULL");
        exit;
    }
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON decode error: " . json_last_error_msg());
        echo json_encode(["error" => "JSON decode error: " . json_last_error_msg()]);
        exit;
    }

    if (isset($data['usernameLogin']) && isset($data['passwordLogin'])) {

        $login_pass = $data['passwordLogin'];
        $new_username = $data["usernameLogin"];

        $sql = $conn->prepare("SELECT * FROM userProfile WHERE username=?");
        if (!$sql) {
            echo "Error in prepare statement: " . $conn->error;
            exit;
        }

        $sql->bind_param("s", $new_username);
        $sql->execute();
        $sql->store_result();

        if ($sql->num_rows > 0) {
            $sql->bind_result($id, $u, $p, $gp, $gw);
            $sql->fetch();

            if (password_verify($login_pass, $p)){

                // generate session token
                $token = bin2hex(random_bytes(16)); 

                // prepare data
                $responseData = [
                    "result"=>True,
                    "message"=>"Success!",
                    'token' => $token 
                ];

                // put token in login_auth database
                $stmt = $conn->prepare("INSERT INTO login_auth (username, token) VALUES (?, ?) ON DUPLICATE KEY UPDATE token = VALUES(token)");
                if ($stmt === False){
                    die("Error with parameters!");
                }
                
                $stmt->bind_param("ss", $new_username, $token);
                if ($stmt->execute() === False){
                    die("Error inserting data!");
                }

                // send data
                echo json_encode($responseData);
            } else {
                echo json_encode($res);
                exit;
            }
        } else {
            echo json_encode($res);
            exit;
        }
    } else {
        echo json_encode(["error" => "Username or password not provided."]);
        exit;
    }
} else {
    $res['message'] = "Not a post request.";
    echo json_encode($res);
}
$conn->close();
?>
