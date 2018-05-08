

numbers = [1,2,3,4,5,6,7,8,9,10];
removed = numbers.splice(6,5,"a","b","c","d","e");
print("elements removed: ",removed);
print("numbers arr. dopo splice: ",numbers);
numbers.splice(6,0,removed);
print("numbers dopo splice 2: ",numbers);
