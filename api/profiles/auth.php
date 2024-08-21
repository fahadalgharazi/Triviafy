<?php

$servername = "oceanus.cse.buffalo.edu:3306";
$username = "xiangjia";
$password = "50344634";
$database = "cse442_2024_spring_team_t_db";

header('Access-Control-Allow-Origin: *'); // change this when deploying
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

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

    if (isset($data['token']))
    {

        $token = $data['token'];

        $sql = $conn->prepare("SELECT * FROM login_auth WHERE token=?");
        if (!$sql) 
        {
            echo "Error in prepare statement: " . $conn->error;
            exit;
        }

        $sql->bind_param("s",$token);
        $sql->execute();
        $sql->store_result();
        $sql->bind_result($u, $t, $i);
        if ($sql->num_rows > 0) {
            while ($sql->fetch()) {
                echo json_encode($u);
            }
        }
        else{
            echo json_encode(null);
            exit;
        }
}
}
else 
{
    $res['message'] = "Not a post request.";
    echo json_encode($res);
}
$conn->close();
?>
