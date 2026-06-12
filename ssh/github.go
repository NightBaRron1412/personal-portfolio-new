package main

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

// Same public endpoint the website's "Live Signals" uses.
const githubURL = "https://www.amirshetaia.com/api/github"

type ghStats struct {
	TotalCommits  int `json:"totalCommits"`
	ActiveDays    int `json:"activeDays"`
	CurrentStreak int `json:"currentStreak"`
	Repos         int `json:"repos"`
}

type ghDay struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
	Level int    `json:"level"`
}

type ghCommit struct {
	Sha     string `json:"sha"`
	Message string `json:"message"`
	Repo    string `json:"repo"`
	Date    string `json:"date"`
}

type ghUser struct {
	Login       string `json:"login"`
	Followers   int    `json:"followers"`
	PublicRepos int    `json:"publicRepos"`
}

type githubData struct {
	User          ghUser     `json:"user"`
	Stats         ghStats    `json:"stats"`
	Heatmap       []ghDay    `json:"heatmap"`
	RecentCommits []ghCommit `json:"recentCommits"`
}

type githubMsg struct{ data *githubData }

func fetchGithub() tea.Msg {
	client := &http.Client{Timeout: 8 * time.Second}
	res, err := client.Get(githubURL)
	if err != nil {
		return githubMsg{nil}
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		return githubMsg{nil}
	}
	body, err := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if err != nil {
		return githubMsg{nil}
	}
	var d githubData
	if err := json.Unmarshal(body, &d); err != nil {
		return githubMsg{nil}
	}
	return githubMsg{&d}
}
