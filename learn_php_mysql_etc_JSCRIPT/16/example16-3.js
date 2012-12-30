//<script>

function fixNames()
{
	print("nella funzione");
	var s = ""

	for (j = 0 ; j < fixNames.arguments.length ; ++j)
		s += fixNames.arguments[j].charAt(0).toUpperCase() +
			 fixNames.arguments[j].substr(1).toLowerCase() + " "
	
	return s.substr(0, s.length-1)
}
//</script>

words = fixNames("the", "DALLAS", "CowBoys")
// document.write(words[0] + " " + words[2])

print(fixNames("the", "DALLAS", "CowBoys")[0])
print(fixNames("the", "DALLAS", "CowBoys")[1])

print(words[0])
print(words[1])
