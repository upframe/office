package main

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"flag"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
)

var (
	team       map[string]bool
	tpl        *template.Template
	pwd        string
	secure     bool
	port       int
	dev        bool
	teamFile   string
	staticPath string
	pwdFile    string
)

func init() {
	flag.BoolVar(&secure, "secure", false, "Protocol port (https if enabled; default: http)")
	flag.IntVar(&port, "port", 9696, "HTTP service port")
	flag.BoolVar(&dev, "dev", false, "Development mode")
	flag.StringVar(&teamFile, "team", "team.json", "Place to save the status")
	flag.StringVar(&staticPath, "static", "./", "Static files storage")
	flag.StringVar(&pwdFile, "pwd", "thisisnotthepassword.txt", "Password file")
}

func main() {
	flag.Parse()

	tpl = template.Must(template.ParseFiles("office.html", "office.js", "office.css"))

	file, err := ioutil.ReadFile(teamFile)
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

	// Remove all trailing spaces from the password
	password = []byte(strings.TrimSpace(string(password)))

	h := md5.New()
	h.Write(password)
	pwd = hex.EncodeToString(h.Sum(nil))

	err = json.Unmarshal(file, &team)
	if err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/auth", auth)
	http.HandleFunc("/logout", logout)
	http.HandleFunc("/api", api)
	http.HandleFunc("/", index)
	if err := http.ListenAndServe(":"+strconv.Itoa(port), nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func index(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.Error(w, "Not Found", 404)
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(405)
		return
	}

	if dev {
		tpl = template.Must(template.ParseFiles("office.html", "office.js", "office.css"))
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	if err := tpl.Execute(w, map[string]interface{}{
		"Team":     team,
		"LoggedIn": loggedIn(r),
	}); err != nil {
		log.Print(err)
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
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	if !loggedIn(r) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	object := map[string]bool{}
	rawBuffer := new(bytes.Buffer)
	rawBuffer.ReadFrom(r.Body)

	err := json.Unmarshal(rawBuffer.Bytes(), &object)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	for key, val := range object {
		if key[0] == '-' {
			delete(team, strings.TrimPrefix(key, "-"))
			continue
		}

		team[key] = val
	}

	if save() != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func auth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	rawBuffer := new(bytes.Buffer)
	rawBuffer.ReadFrom(r.Body)

	h := md5.New()
	h.Write(rawBuffer.Bytes())
	authPwd := hex.EncodeToString(h.Sum(nil))
	if authPwd != pwd {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	cookie := http.Cookie{
		Name:     "office-login",
		Value:    authPwd,
		Path:     "/", // omitted MaxAge so it's default value is 0
		Secure:   secure,
		HttpOnly: true,
	}

	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)
}

func logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	cookie := &http.Cookie{
		Name:     "office-login",
		MaxAge:   -1,
		Secure:   secure,
		HttpOnly: true,
	}

	http.SetCookie(w, cookie)

	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

func loggedIn(r *http.Request) bool {
	cookie, err := r.Cookie("office-login")
	if err != nil {
		return false
	}

	if cookie.Value != pwd {
		return false
	}
	return true
}

func save() error {
	data, err := json.Marshal(team)
	if err != nil {
		return err
	}

	return ioutil.WriteFile(teamFile, data, 0666)
}
