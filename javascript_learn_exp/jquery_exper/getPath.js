/**
 * https://stackoverflow.com/questions/2420970/how-can-i-get-selector-from-jquery-object 
 */

function EVGetPath(e) {
	e.preventDefault();
    var selector = $(this)
    .parents()
    .map(function() { return this.tagName; })
    .get()
    .reverse()
    .concat([this.nodeName])
    .join(">");

    var id = $(this).attr("id");
    if (id) { 
    	selector += "#"+ id;
    }
    var classNames = $(this).attr("class");
    if (classNames) {
    	selector += "." + $.trim(classNames).replace(/\s/gi, ".");
    }
    console.log(selector);
    alert(selector);
}

//function EVGetPath(e) {
//    console.log(e);
//}