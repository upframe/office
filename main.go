package main

import (
	"bytes"
	"encoding/json"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

var (
	team map[string]bool
	tpl  *template.Template
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

	err = json.Unmarshal(file, &team)
	if err != nil {
		log.Fatal(err)
	}

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
		http.Error(w, "Method Not Allowed", 405)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	// TODO: Make the TPL variable global
	tpl = template.Must(template.ParseFiles("office.html"))
	tpl = template.Must(tpl.ParseFiles("office.js"))
	tpl = template.Must(tpl.ParseFiles("office.css"))

	if err := tpl.Execute(w, team); err != nil {
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

	object := map[string]bool{}
	rawBuffer := new(bytes.Buffer)
	rawBuffer.ReadFrom(r.Body)

	err := json.Unmarshal(rawBuffer.Bytes(), &object)
	if err != nil {
		http.Error(w, "Internal Server Error", 500)
		return
	}

	for key, val := range object {
		team[key] = val
	}

	if save() != nil {
		http.Error(w, "Internal Server Error", 500)
	}

	w.WriteHeader(http.StatusOK)
}

func save() error {
	data, err := json.Marshal(team)
	if err != nil {
		return err
	}

	return ioutil.WriteFile("team.json", data, 0666)
}
