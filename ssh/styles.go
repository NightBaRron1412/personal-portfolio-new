package main

import (
	"math"
	"strconv"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// Brand gradient stops (teal -> purple -> magenta) — same as the website.
var brandStops = [][3]int{
	{45, 212, 191},  // #2dd4bf
	{167, 139, 250}, // #a78bfa
	{240, 171, 252}, // #f0abfc
}

const (
	colText   = "#e6e9ef"
	colDim    = "#9aa4b2"
	colFaint  = "#5b6472"
	colAccent = "#2dd4bf"
	colBg     = "#0a0e14"
)

var (
	stText    = lipgloss.NewStyle().Foreground(lipgloss.Color(colText))
	stDim     = lipgloss.NewStyle().Foreground(lipgloss.Color(colDim))
	stFaint   = lipgloss.NewStyle().Foreground(lipgloss.Color(colFaint))
	stAccent  = lipgloss.NewStyle().Foreground(lipgloss.Color(colAccent))
	stAccent2 = lipgloss.NewStyle().Foreground(lipgloss.Color("#a78bfa"))
	stLabel   = lipgloss.NewStyle().Foreground(lipgloss.Color(colAccent)).Bold(true)
	stBadge   = lipgloss.NewStyle().Foreground(lipgloss.Color(colBg)).
			Background(lipgloss.Color(colAccent)).Bold(true)
)

func lerp(a, b int, t float64) int { return int(float64(a) + (float64(b)-float64(a))*t) }

func hex2(v int) string {
	s := strconv.FormatInt(int64(v), 16)
	if len(s) == 1 {
		s = "0" + s
	}
	return s
}

// colorAt returns the gradient hex at position t in [0,1].
func colorAt(t float64) string {
	if t < 0 {
		t = 0
	}
	if t > 1 {
		t = 1
	}
	seg := t * float64(len(brandStops)-1)
	i := int(seg)
	if i >= len(brandStops)-1 {
		i = len(brandStops) - 2
	}
	f := seg - float64(i)
	a, b := brandStops[i], brandStops[i+1]
	return "#" + hex2(lerp(a[0], b[0], f)) + hex2(lerp(a[1], b[1], f)) + hex2(lerp(a[2], b[2], f))
}

func paint(s string, bold bool) string {
	runes := []rune(s)
	n := len(runes)
	if n == 0 {
		return s
	}
	var b strings.Builder
	for i, r := range runes {
		t := 0.0
		if n > 1 {
			t = float64(i) / float64(n-1)
		}
		st := lipgloss.NewStyle().Foreground(lipgloss.Color(colorAt(t)))
		if bold {
			st = st.Bold(true)
		}
		b.WriteString(st.Render(string(r)))
	}
	return b.String()
}

func gradient(s string) string     { return paint(s, false) }
func gradientBold(s string) string { return paint(s, true) }

// ---- layout helpers ----

func padRight(s string, w int) string {
	d := w - lipgloss.Width(s)
	if d > 0 {
		s += strings.Repeat(" ", d)
	}
	return s
}

func lineLR(left, right string, w int) string {
	gap := w - lipgloss.Width(left) - lipgloss.Width(right)
	if gap < 1 {
		gap = 1
	}
	return left + strings.Repeat(" ", gap) + right
}

func truncate(s string, w int) string {
	return lipgloss.NewStyle().MaxWidth(w).Render(s)
}

// wrapText word-wraps plain (unstyled) text to width w.
func wrapText(s string, w int) []string {
	if w < 1 {
		w = 1
	}
	words := strings.Fields(s)
	if len(words) == 0 {
		return []string{""}
	}
	var lines []string
	cur := ""
	for _, word := range words {
		switch {
		case cur == "":
			cur = word
		case len([]rune(cur))+1+len([]rune(word)) <= w:
			cur += " " + word
		default:
			lines = append(lines, cur)
			cur = word
		}
	}
	if cur != "" {
		lines = append(lines, cur)
	}
	return lines
}

// ---- equalizer animation ----

var blocks = []rune{' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'}

func eqLevel(frame, i int) int {
	v := math.Sin(float64(frame)/3.0 + float64(i)*0.9)
	return int((v+1)/2*7) + 1 // 1..8
}
