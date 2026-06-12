package main

import (
	"math"
	"strconv"
	"strings"
	"time"
	_ "time/tzdata" // embed the tz database so the clock works without system tzdata

	"github.com/charmbracelet/lipgloss"
)

// Brand gradient stops (teal -> purple -> magenta) — same as the website.
var brandStops = [][3]int{
	{45, 212, 191},  // #2dd4bf
	{167, 139, 250}, // #a78bfa
	{240, 171, 252}, // #f0abfc
}

// Arcade-mode palette (Konami easter egg): hot magenta -> cyan -> yellow.
var arcadeStops = [][3]int{
	{255, 45, 149}, // #ff2d95
	{34, 211, 238}, // #22d3ee
	{253, 224, 71}, // #fde047
}

const (
	colText    = "#e6e9ef"
	colDim     = "#9aa4b2"
	colFaint   = "#5b6472"
	colAccent  = "#2dd4bf"
	colArcade  = "#ff2d95"
	colBg      = "#0a0e14"
	colBorder  = "#243044"
	colBorderA = "#3a2740"
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

func clamp01(t float64) float64 {
	if t < 0 {
		return 0
	}
	if t > 1 {
		return 1
	}
	return t
}

// colorAtStops returns the hex color at position t in [0,1] across the stops.
func colorAtStops(t float64, stops [][3]int) string {
	t = clamp01(t)
	seg := t * float64(len(stops)-1)
	i := int(seg)
	if i >= len(stops)-1 {
		i = len(stops) - 2
	}
	f := seg - float64(i)
	a, b := stops[i], stops[i+1]
	return "#" + hex2(lerp(a[0], b[0], f)) + hex2(lerp(a[1], b[1], f)) + hex2(lerp(a[2], b[2], f))
}

// paintG colors a string across a gradient, rune by rune, optionally bold and
// phase-shifted (phase animates the gradient so it "flows").
func paintG(s string, bold bool, stops [][3]int, phase float64) string {
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
		t = math.Mod(t+phase, 1.0)
		st := lipgloss.NewStyle().Foreground(lipgloss.Color(colorAtStops(t, stops)))
		if bold {
			st = st.Bold(true)
		}
		b.WriteString(st.Render(string(r)))
	}
	return b.String()
}

func gradient(s string) string                  { return paintG(s, false, brandStops, 0) }
func gradientBold(s string) string              { return paintG(s, true, brandStops, 0) }
func gradientFlow(s string, ph float64) string  { return paintG(s, true, brandStops, ph) }

// bar renders a gradient-filled progress bar of the given width.
func bar(frac float64, width int, stops [][3]int) string {
	frac = clamp01(frac)
	fill := int(frac*float64(width) + 0.5)
	var b strings.Builder
	for i := 0; i < width; i++ {
		if i < fill {
			t := 0.0
			if width > 1 {
				t = float64(i) / float64(width-1)
			}
			b.WriteString(lipgloss.NewStyle().Foreground(lipgloss.Color(colorAtStops(t, stops))).Render("█"))
		} else {
			b.WriteString(stFaint.Render("░"))
		}
	}
	return b.String()
}

// ---- live clock (Toronto) ----

var torontoLoc *time.Location

func init() {
	if l, err := time.LoadLocation("America/Toronto"); err == nil {
		torontoLoc = l
	}
}

func clockStr() string {
	now := time.Now()
	if torontoLoc != nil {
		now = now.In(torontoLoc)
	}
	return now.Format("Mon 15:04:05")
}

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

// marquee scrolls text within width when it's too long (frame-driven).
func marquee(s string, width, frame int) string {
	if width < 1 {
		return ""
	}
	if lipgloss.Width(s) <= width {
		return s
	}
	r := []rune(s + "    •    ")
	n := len(r)
	off := (frame / 3) % n
	out := make([]rune, 0, width)
	for i := 0; i < width; i++ {
		out = append(out, r[(off+i)%n])
	}
	return string(out)
}

// ---- equalizer animation ----

var blocks = []rune{' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'}

func eqLevel(frame, i int) int {
	v := math.Sin(float64(frame)/3.0 + float64(i)*0.9)
	return int((v+1)/2*7) + 1 // 1..8
}
