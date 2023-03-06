<?php 
session_start();
$chat_number = 2;
if (!isset($_SESSION['requests_dall_e2'])) {
  $_SESSION['requests_dall_e2'] = 0;
}

if ($_SESSION['requests_dall_e2'] >= $chat_number) {
    echo json_encode([
        "status" => 0,
        "message" => "The maximum limit of images in demo mode has been reached.",
    ]);
  die();
}
$_SESSION['requests_dall_e2']++;