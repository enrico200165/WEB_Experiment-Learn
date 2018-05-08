function validateForename(field) {
	if (field == "") { //$NON-NLS-1$
		return "No Forename was entered.\n" //$NON-NLS-1$
	}
	return ""//$NON-NLS-1$  
}

function validateSurname(field) {
	if (field == "") //$NON-NLS-1$ 
		return "No Surname was entered.\n" //$NON-NLS-1$ 
	return ""//$NON-NLS-1$ 
}

function validateUsername(field) {
	if (field == "") //$NON-NLS-1$
		return "No Username was entered.\n" //$NON-NLS-1$
	else if (field.length < 5) //$NON-NLS-1$
		return "Usernames must be at least 5 characters.\n" //$NON-NLS-1$
	else if (/[^a-zA-Z0-9_-]/.test(field)) //$NON-NLS-1$
		return "Only a-z, A-Z, 0-9, - and _ allowed in Usernames.\n" //$NON-NLS-1$
	return ""
}

function validatePassword(field) {
	if (field == "")
		return "No Password was entered.\n"
	else if (field.length < 6)
		return "Passwords must be at least 6 characters.\n"
	else if (!/[a-z]/.test(field) || !/[A-Z]/.test(field)
			|| !/[0-9]/.test(field))
		return "Passwords require one each of a-z, A-Z and 0-9.\n"
	return ""
}

function validateAge(field) {
	if (isNaN(field))
		return "No Age was entered.\n"
	else if (field < 18 || field > 110)
		return "Age must be between 18 and 110.\n"
	return ""
}

function validateEmail(field) {
	if (field == "")
		return "No Email was entered.\n"
	else if (!((field.indexOf(".") > 0) && (field.indexOf("@") > 0))
			|| /[^a-zA-Z0-9.@_-]/.test(field))
		return "The Email address is invalid.\n"
	return ""
}
