def greet_user(name:str, count:int):
    if(count==10):
        return;
    print(f"hello {name}, how are you doing today! {count}")
    greet_user(name,count+1)
    print("returned",count)

username = input("Please enter your name: ")
greet_user(username,0)

