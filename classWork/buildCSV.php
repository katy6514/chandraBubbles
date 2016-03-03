<?php
/**
 * Created by PhpStorm.
 * User: consensus
 * Date: 4/6/14
 * Time: 8:52 PM
 *
 * This file works on the delimited.csv file katy provided.
 * In order for this to work, I removed all the ------------------ in the file
 * and added one line that reads "ENDHEADERS" on it's own line anywhere
 * after the headers, but before the column/row data.
 * I also removed the line "(25 rows affected)"
 *
 * One other thing: I have to load the data up in textwrangler and use the
 * "remove line breaks" option to remove all line breaks not at the end of a line
 * (not quite sure how else to explain that, as a linebreak shouldn't exist
 * in the middle of a line). Anyways, it works.
 *
 * This should work for the entire dataset, given that the format
 * is the same. It should also be flexible enough that we can add additional columns
 * and the script should still run!
 *
 * HORAY!
 *
 * Additional note: dataset.csv must be chmod 777 in order to write to it.
 */


// open our data file
$handle = fopen('rawData/cycle01delimited.csv', 'r');
$headers = '';
$values = array();
// if we successfully opened the file
if ($handle) {
  // while we still have lines to read
  while (($buffer = fgets($handle)) !== false) {
    // note teh newline character (\n) in "ENDHEADERS"
    // if we find our "ENDHEADERS" line, we break from this loop
    if (strcmp($buffer, "ENDHEADERS\n") == 0) {
      // stop processing since we are done with headers
      break;
    }
    // building a string of all the headers
    $headers .= $buffer;
  }

  // create an array of our headers. Allow _ in words.
  $headerArray = str_word_count($headers, 1, "_");


  // continue processing after the headers
  while (($buffer = fgets($handle))  !== false) {
    // ignore any lines that are just a new line character
    if ($buffer === "\n") {
      continue;
    }

    $buffer = str_replace('#&#', '$&', $buffer);
    // break our current line into elements in an array, delimited on $&
    $bufferArray = explode('$&', $buffer);

    // go through each item in this line
    foreach($bufferArray as $value) {
      // if it's not just a blank line
      if ($value != "\n" && $value != "\t" && $value != "\r" ) {
        // remove the end line delimiters 'cause we don't need them
        $value = str_replace('#&#', ' ', $value);
        // remove unnecessary whitespace
        $value = trim($value, " ");
        // remove any special characters
        $value = trim($value, "\x00..\x20");
        // if it's longer than 0 length
        if (strlen($value) > 0) {
          // push it onto our values array
          $values[] = $value;
        }
      }
    }

  }
  // loop through all our data
  for($i = 0; $i < count($values); $i++) {
    // at the end of each record
    if ($i % count($headerArray) == 0) {
      // insert some padding
      echo "</br><hr></br>";
    }
    // output: column_name + : + value
    echo $headerArray[$i % count($headerArray)] . ": " .$values[$i] . "</br>";
  }

  // close our handle
  fclose($handle);

}

// get a new handler for writing the CSV
$handle = fopen("dataset.csv", 'w');


$value_count = count($values);
$header_count = count($headerArray);//write out headers
for ($i = 0; $i < $header_count; $i++) {
  $header = $headerArray[$i];
  if ($i % $header_count == $header_count - 1) {
    fwrite($handle, $header);
  } else {
    fwrite($handle, $header . '|');
  }
}

// write out values
for ($i = 0; $i < $value_count; $i++) {
  $value = trim($values[$i], " ");
  if ($i % $header_count == 0) {
    fwrite($handle, "\n");
    fwrite($handle, $value . '|');
  } else if ($i % $header_count == $header_count - 1) {
    fwrite($handle, $value);
  } else {
    fwrite($handle, $value . '|');
  }
}

// close our handle
fclose($handle);



