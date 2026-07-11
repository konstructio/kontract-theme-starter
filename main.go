// kontract-theme-starter — the smallest possible kontract theme.
// Serves the static frontend; all kontract logic lives in the browser.
package main

import (
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	http.Handle("/", http.FileServer(http.Dir("static")))
	http.ListenAndServe(":"+port, nil)
}
