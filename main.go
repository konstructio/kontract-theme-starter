// kontract-theme-starter — the smallest possible kontract theme.
// Serves the static frontend; all kontract logic lives in the browser.
//
// Assets are embedded in the binary (go:embed) because cloud-native
// buildpacks strip source files from the final image — a bare
// http.Dir("static") would 404 in production.
package main

import (
	"embed"
	"io/fs"
	"net/http"
	"os"
)

//go:embed static
var assets embed.FS

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	static, err := fs.Sub(assets, "static")
	if err != nil {
		panic(err)
	}
	http.Handle("/", http.FileServer(http.FS(static)))
	http.ListenAndServe(":"+port, nil)
}
