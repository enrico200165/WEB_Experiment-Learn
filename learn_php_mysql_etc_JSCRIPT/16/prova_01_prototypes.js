function User(forename, username, password)
{
    this.forename = forename
    this.username = username
    this.password = password

    User.prototype.showUser = function()
    {
        document.write("Forename: " + this.forename + "<br />")
        document.write("Username: " + this.username + "<br />")
        document.write("Password: " + this.password + "<br />")
    }
}

details  = new User()

User.prototype.greeting = "Hello"
print(details.greeting);

details2 = new User();
User.prototype.greeting = "ciao"
print(details2.greeting);
