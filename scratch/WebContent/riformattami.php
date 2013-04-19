<?php 
/**
 * Implements hook_theme().
 */
function retro_theme() {
 return array(
   // The array key is the name of the theme hook.
   'wonder' => array(
     // Use a template and give the template's name.
     'template' => 'wonder',
     // Specify the default variable names and their values.
     'variables' => array(
       'twin' => 'zen',
       'with_monkey' => FALSE,
       'activations' => array(),
     ),
     // Add a partial pattern to help hook theme suggestion
     // matches.
     'pattern' => 'wonder__',
   ),
   'austinite' => array(
     // Specify the name of the render element.
     'render element' => 'my_element',
     // We don't use this theme function often, so let's put
     // it in a separate file that is lazy loaded, if needed.
     'file' => 'retro.texas.inc',
   ),
 );
}