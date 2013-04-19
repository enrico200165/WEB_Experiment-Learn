<div class="<?php print $classes; ?>" <?php print $attributes; ?>>
	<?php if ($title): ?>
	<h2 <?php print $title_attributes; ?>>
		<?php print $title; ?>
	</h2>
	<?php endif;?>
	<div class="submitted">
		<?php print t('By !author @time ago', 
				       array('@time' => $time,
				             '!author' => $author,
                             )
				      ); ?>
	</div>
	<div class="content" <?php print $content_attributes; ?>>
		<?php
		// We hide the links now so that we can render them later.
		hide($content['links']);
		print render($content);
		?>
	</div>
	<?php print render($content['links']); ?>
</div>

