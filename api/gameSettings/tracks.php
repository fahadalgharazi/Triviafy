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

$username = $_GET['username'];
$playlistId = $_GET['playlist_id'];

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
// echo $playlistId;

$tracksApiUrl = "https://api.spotify.com/v1/playlists/{$playlistId}/tracks";
$curlTracks = curl_init($tracksApiUrl);
curl_setopt($curlTracks, CURLOPT_HTTPHEADER, array("Authorization: Bearer {$accessToken}"));
curl_setopt($curlTracks, CURLOPT_RETURNTRANSFER, true);
$tracksJson = curl_exec($curlTracks);
curl_close($curlTracks);

if (!$tracksJson) {
    echo json_encode(["error" => "Failed to retrieve tracks"]);
    $conn->close();
    exit;
}
function getArtistGenre($artistId, $accessToken) {
    $artistApiUrl = "https://api.spotify.com/v1/artists/{$artistId}";
    $curl = curl_init($artistApiUrl);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array("Authorization: Bearer {$accessToken}"));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $artistJson = curl_exec($curl);
    curl_close($curl);

    if (!$artistJson) {
        return "Unknown genre"; // Handle the case where artist data could not be fetched
    }

    $artistData = json_decode($artistJson, true);
    return $artistData['genres'] ? $artistData['genres'][0] : "Unknown genre"; // Return the first genre listed or a placeholder
}


function getRandomArtists($genre, $currentArtistName, $accessToken) {
    $encodedGenre = urlencode($genre);
    $searchApiUrl = "https://api.spotify.com/v1/search?q=genre:%22{$encodedGenre}%22&type=artist&limit=4";
    $curl = curl_init($searchApiUrl);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array("Authorization: Bearer {$accessToken}"));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $searchResultsJson = curl_exec($curl);
    
    if (curl_errno($curl)) {
        error_log('Curl error: ' . curl_error($curl));
        curl_close($curl);
        return [];
    }

    curl_close($curl);
    $searchResults = json_decode($searchResultsJson, true);

    $artists = [];
    if (isset($searchResults['artists']['items'])) {
        $artists = array_map(function($item) {
            return $item['name'];
        }, $searchResults['artists']['items']);
    }

    // Check if the current artist is already in the list; if not, replace a random artist
    if (!in_array($currentArtistName, $artists)) {
        if (count($artists) > 0) {
            $artists[rand(0, count($artists) - 1)] = $currentArtistName; // Replace a random artist with the current artist
        } else {
            $artists[] = $currentArtistName; // Add as the only artist if no other artists were found
        }
    }

    return $artists;
}

// Process tracks data to extract needed information
$tracksData = json_decode($tracksJson, true);
$songs = [];
foreach ($tracksData['items'] as $item) {
    if (isset($item['track']['preview_url']) && $item['track']['preview_url'] != null) {
        $artistName = $item['track']['artists'][0]['name']; // Assuming you want the first artist listed
        $artistId = $item['track']['artists'][0]['id']; // Get the artist ID
        $genre = getArtistGenre($artistId, $accessToken);

        // Fetch the genre for the artist
        $genre = getArtistGenre($artistId, $accessToken);

        // Fetch the names of random artists from the same genre
        $randomArtists = getRandomArtists($genre, $artistName, $accessToken);

        $songs[] = [
            'id' => $item['track']['id'],
            'name' => $item['track']['name'],
            'artist' => $artistName,
            'genre' => $genre,
            'preview_url' => $item['track']['preview_url'],
            'random_artists' => $randomArtists,
        ];
    }
}



echo json_encode($songs);

$conn->close();

?>
