<?php
function test()
{
    static $count = 0;
    echo $count;
    $count++;
}

// lines added by me

test();
echo "<BR />";
test();

?>
