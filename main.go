package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

var team = map[string]bool{}

func main() {
	file, err := ioutil.ReadFile("team.json")
	if os.IsNotExist(err) {
		err := ioutil.WriteFile("team.json", []byte("{}"), 0666)
		if err != nil {
			log.Fatal(err)
		}
	} else if err != nil {
		log.Fatal(err)
	}

	err = json.Unmarshal(file, &team)
	if err != nil {
		log.Fatal(err)
	}

	http.Handle("/static/", http.FileServer(http.Dir("./")))
	http.HandleFunc("/switch", Switch)
	http.HandleFunc("/", Index)
	if err := http.ListenAndServe(":9696", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

// Index ...
func Index(w http.ResponseWriter, r *http.Request) {
	page, err := ioutil.ReadFile("office.html")
	if err != nil {
		w.WriteHeader(500)
		return
	}

	tpl, err := template.New("office").Parse(string(page))
	if err != nil {
		w.WriteHeader(500)
		return
	}
	err = tpl.Execute(w, team)
	if err != nil {
		w.WriteHeader(500)
	}
}

// Switch ...
func Switch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(400)
		return
	}

	o := map[string]bool{}
	rawBuffer := new(bytes.Buffer)
	rawBuffer.ReadFrom(r.Body)

	fmt.Println(rawBuffer)

	err := json.Unmarshal(rawBuffer.Bytes(), &o)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	for key, val := range o {
		team[key] = val
	}

	if Save() != nil {
		w.WriteHeader(500)
		return
	}
}

// Save ...
func Save() (err error) {
	data, err := json.Marshal(team)
	if err != nil {
		return
	}

	err = ioutil.WriteFile("team.json", data, 0666)
	if err != nil {
		return
	}
	return
}
