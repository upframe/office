package main

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

var (
	team   map[string]bool
	tpl    *template.Template
	pwd    string
	secure bool // TODO: isn't this a flag?
)

func main() {
	file, err := ioutil.ReadFile("team.json")
	if os.IsNotExist(err) {
		file = []byte("{}")
		err = ioutil.WriteFile("team.json", file, 0666)
	}

	if err != nil {
		log.Fatal(err)
	}

	password, err := ioutil.ReadFile("thisisnotthepassword.txt")
	if err != nil {
		log.Fatal(err)
	}
	pwd = string(password)

	err = json.Unmarshal(file, &team)
	if err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/auth", auth)
	http.HandleFunc("/logout", logout)
	http.HandleFunc("/api", api)
	http.HandleFunc("/", index)
	if err := http.ListenAndServe(":9696", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func index(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.Error(w, "Not Found", 404)
		return
	}

	if r.Method != "GET" {
		w.WriteHeader(405)
		return
	}

	// TODO: this could be done on main so we don't have to open the files
	// each request
	tpl = template.Must(template.ParseFiles("office.html"))
	tpl = template.Must(tpl.ParseFiles("office.js"))
	tpl = template.Must(tpl.ParseFiles("office.css"))

	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	// TODO: instead of doint all of this here, you could create a function
	// like I said in line 115. And instead of sending the whole cookie, you can
	// just send a boolean value saying if it's logged in or not.
	cookie, err := r.Cookie("office-login")
	if err != nil {
		cookie = &http.Cookie{
			Name:     "office-login",
			Value:    "0",
			Secure:   secure,
			HttpOnly: true,
		}
	}

	if err := tpl.Execute(w, map[string]interface{}{
		"Team":   team,
		"Cookie": cookie,
	}); err != nil {
		fmt.Println(err)
		http.Error(w, "Internal Server Error", 500)
	}
}

func api(w http.ResponseWriter, r *http.Request) {
	// If it's Get, return the JSON with the statuses
	if r.Method == http.MethodGet {
		data, err := json.Marshal(team)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			return
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Write(data)
		return
	}

	// If it's different from POST, return not allowed
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", 405)
		return
	}

	// TODO: what if you created a function to check if you are logged in.
	// then you could use it on Index too! Like 'if !loggedIn(r)'
	cookie, err := r.Cookie("office-login")
	if err != nil {
		// TODO: are you going to return 500 if the cookie doesn't exist?
		// I thought that it meant that you were Unauthorized...
		http.Error(w, "Internal Server Error", 500)
		return
	}

	// TODO: wouldn't it be a great idea to store the 'pwd' variable in md5
	// so you don't need to calculate it over and over again?
	h := md5.New()
	h.Write([]byte(pwd))
	// hex.EncodeToString(h.Sum(nil))

	if cookie.Value != hex.EncodeToString(h.Sum(nil)) {
		// TODO: I don't think this is a bug! And I don't see the point in
		// changing the max age if you are not going to write it to the header.
		// I think you could just delete this two lines and return 401
		fmt.Println("bug...")
		cookie.MaxAge = -1
		w.WriteHeader(401)
		return
	}

	object := map[string]bool{}
	rawBuffer := new(bytes.Buffer)
	rawBuffer.ReadFrom(r.Body)

	err = json.Unmarshal(rawBuffer.Bytes(), &object)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	for key, val := range object {
		team[key] = val
	}

	if save() != nil {
		w.WriteHeader(500)
		return
	}

	w.WriteHeader(200)
}

func auth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	rawBuffer := new(bytes.Buffer)
	rawBuffer.ReadFrom(r.Body)

	// TODO: isn't 'pwd' a string already?
	if (string(rawBuffer.Bytes())) != string(pwd) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	h := md5.New()
	h.Write(rawBuffer.Bytes())

	cookie := http.Cookie{
		Name:     "office-login",
		Value:    hex.EncodeToString(h.Sum(nil)),
		Path:     "/", // omited MaxAge so it's default value is 0
		Secure:   secure,
		HttpOnly: true,
	}

	http.SetCookie(w, &cookie)
	w.WriteHeader(200)
}

func logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(405)
		return
	}

	// TODO: you don't need to retrieve the cookie...
	// you just need to replace it!
	cookie, err := r.Cookie("office-login")
	if err != nil || cookie != nil {
		cookie = &http.Cookie{
			Name:     "office-login",
			MaxAge:   -1, // TODO: I changed this to -1 because because "MaxAge<0 means delete cookie now"
			Secure:   secure,
			HttpOnly: true,
		}

		http.SetCookie(w, cookie)
	}

	w.WriteHeader(200)
}

func save() error {
	data, err := json.Marshal(team)
	if err != nil {
		return err
	}

	return ioutil.WriteFile("team.json", data, 0666)
}

// TODO: remove all of the other TODOs after done or understood :)
// TODO: comment the functions and explain them :)
