<?php
$images = glob('../data/*');
$sounds = glob('../sound/*');
echo json_encode(array_merge($images, $sounds));