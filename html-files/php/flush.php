<?php
try {
  echo "The flush function is <b style='color:green'>enabled</b> on your server";
  flush();
} catch (Exception $e) {
  echo "The flush() function is <b style='color:red'not</b> enabled on the server.";
}
?>