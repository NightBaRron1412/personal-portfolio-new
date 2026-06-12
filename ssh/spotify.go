package main

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

// The same public endpoint the website's widget uses.
const spotifyURL = "https://www.amirshetaia.com/api/spotify"

type nowPlaying struct {
	IsPlaying bool   `json:"isPlaying"`
	Title     string `json:"title"`
	Artist    string `json:"artist"`
}

type spotifyMsg struct{ np *nowPlaying }
type spotifyTickMsg struct{}

func fetchSpotify() tea.Msg {
	client := &http.Client{Timeout: 6 * time.Second}
	res, err := client.Get(spotifyURL)
	if err != nil {
		return spotifyMsg{nil}
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		return spotifyMsg{nil}
	}
	body, err := io.ReadAll(io.LimitReader(res.Body, 1<<16))
	if err != nil {
		return spotifyMsg{nil}
	}
	var np nowPlaying
	if err := json.Unmarshal(body, &np); err != nil || np.Title == "" {
		return spotifyMsg{nil}
	}
	return spotifyMsg{&np}
}

// spotifyTick schedules the next refresh (~20s, matching the site's cache).
func spotifyTick() tea.Cmd {
	return tea.Tick(20*time.Second, func(time.Time) tea.Msg { return spotifyTickMsg{} })
}
