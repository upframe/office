package main

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
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
	secure bool
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

	tpl = template.Must(template.ParseFiles("office.html"))
	tpl = template.Must(tpl.ParseFiles("office.js"))
	tpl = template.Must(tpl.ParseFiles("office.css"))

	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	if err := tpl.Execute(w, map[string]interface{}{
		"Team": team,
	}); err != nil {
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

	_, password, ok := r.BasicAuth()
	if !ok || password != pwd {
		w.WriteHeader(401)
		return
	}

	object := map[string]bool{}
	rawBuffer := new(bytes.Buffer)
	rawBuffer.ReadFrom(r.Body)

	err := json.Unmarshal(rawBuffer.Bytes(), &object)
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

	if string(rawBuffer.Bytes()) != pwd {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	h := md5.New()
	h.Write(rawBuffer.Bytes())

	cookie := http.Cookie{
		Name:     "login",
		Value:    hex.EncodeToString(h.Sum(nil)),
		Path:     "/", // omited MaxAge so it's default value is 0
		Secure:   secure,
		HttpOnly: true,
	}

	http.SetCookie(w, &cookie)

	w.WriteHeader(200)
}

func save() error {
	data, err := json.Marshal(team)
	if err != nil {
		return err
	}

	return ioutil.WriteFile("team.json", data, 0666)
}
