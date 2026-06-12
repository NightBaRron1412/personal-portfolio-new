package main

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

const bootFrames = 22 // ~2.4s boot splash

type tickMsg time.Time

func tick() tea.Cmd {
	return tea.Tick(time.Millisecond*110, func(t time.Time) tea.Msg { return tickMsg(t) })
}

var konamiSeq = []string{"up", "up", "down", "down", "left", "right", "left", "right", "b", "a"}

func matchKonami(buf []string) bool {
	if len(buf) < len(konamiSeq) {
		return false
	}
	buf = buf[len(buf)-len(konamiSeq):]
	for i := range konamiSeq {
		if buf[i] != konamiSeq[i] {
			return false
		}
	}
	return true
}

type model struct {
	w, h    int
	sec     int
	off     int
	frame   int
	now     *nowPlaying
	gh      *githubData
	arcade  bool
	booting bool
	konami  []string
	ready   bool
}

func newModel(w, h int) model {
	return model{w: w, h: h, ready: w > 0 && h > 0, booting: true}
}

func (m model) Init() tea.Cmd {
	return tea.Batch(tick(), fetchSpotify, spotifyTick(), fetchGithub)
}

func (m model) contentWidth() int {
	if m.w < 64 {
		w := m.w - 4
		if w < 10 {
			w = 10
		}
		return w
	}
	w := m.w - 23
	if w < 10 {
		w = 10
	}
	return w
}

func (m model) sectionLines(w int) []string {
	switch sections[m.sec] {
	case "Home":
		return viewHome(w)
	case "About":
		return viewAbout(w)
	case "Experience":
		return viewExperience(w)
	case "Projects":
		return viewProjects(w)
	case "Skills":
		return viewSkills(w)
	case "Signals":
		return viewSignals(w, m.gh)
	case "Games":
		return viewGames(w)
	case "Contact":
		return viewContact(w)
	}
	return nil
}

func (m model) bodyLines() []string { return m.sectionLines(m.contentWidth()) }

// inner content height (inside the panel border).
func (m model) bodyHeight() int {
	h := m.h - 5
	if h < 1 {
		h = 1
	}
	return h
}

func (m *model) clamp() {
	maxOff := len(m.bodyLines()) - m.bodyHeight()
	if maxOff < 0 {
		maxOff = 0
	}
	if m.off > maxOff {
		m.off = maxOff
	}
	if m.off < 0 {
		m.off = 0
	}
}

func (m model) pageStep() int {
	s := m.bodyHeight() - 1
	if s < 1 {
		s = 1
	}
	return s
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.w, m.h = msg.Width, msg.Height
		m.ready = m.w > 0 && m.h > 0
		m.clamp()
		return m, nil
	case tickMsg:
		m.frame++
		if m.booting && m.frame >= bootFrames {
			m.booting = false
		}
		return m, tick()
	case spotifyMsg:
		if msg.np != nil {
			m.now = msg.np
		}
		return m, nil
	case spotifyTickMsg:
		return m, tea.Batch(fetchSpotify, spotifyTick())
	case githubMsg:
		if msg.data != nil {
			m.gh = msg.data
		}
		return m, nil
	case tea.MouseMsg:
		if !m.booting && m.w >= 64 &&
			msg.Action == tea.MouseActionPress && msg.Button == tea.MouseButtonLeft {
			// Sidebar item i sits at terminal row 4+i, within the 18-wide panel.
			idx := msg.Y - 4
			if msg.X >= 0 && msg.X < 18 && idx >= 0 && idx < len(sections) {
				m.sec = idx
				m.off = 0
			}
		}
		return m, nil
	case tea.KeyMsg:
		if m.booting {
			m.booting = false // any key skips the splash
			return m, nil
		}
		k := msg.String()
		m.konami = append(m.konami, k)
		if len(m.konami) > len(konamiSeq) {
			m.konami = m.konami[len(m.konami)-len(konamiSeq):]
		}
		if matchKonami(m.konami) {
			m.arcade = !m.arcade
			m.konami = nil
		}
		switch k {
		case "q", "ctrl+c", "esc":
			return m, tea.Quit
		case "tab", "right", "l":
			m.sec = (m.sec + 1) % len(sections)
			m.off = 0
		case "shift+tab", "left", "h":
			m.sec = (m.sec - 1 + len(sections)) % len(sections)
			m.off = 0
		case "down", "j":
			m.off++
			m.clamp()
		case "up", "k":
			if m.off > 0 {
				m.off--
			}
		case "pgdown", " ", "f":
			m.off += m.pageStep()
			m.clamp()
		case "pgup", "b":
			m.off -= m.pageStep()
			if m.off < 0 {
				m.off = 0
			}
		case "home", "g":
			m.off = 0
		case "end", "G":
			m.off = 1 << 30
			m.clamp()
		case "1", "2", "3", "4", "5", "6", "7", "8":
			i := int(k[0] - '1')
			if i >= 0 && i < len(sections) {
				m.sec = i
				m.off = 0
			}
		}
		return m, nil
	}
	return m, nil
}

func windowLines(lines []string, off, h int) []string {
	total := len(lines)
	if off > total-h {
		off = total - h
	}
	if off < 0 {
		off = 0
	}
	out := make([]string, 0, h)
	for i := off; i < off+h && i < total; i++ {
		out = append(out, lines[i])
	}
	for len(out) < h {
		out = append(out, "")
	}
	return out
}

func (m model) renderSidebar(h int, accent string) []string {
	lines := []string{stFaint.Render("NAV"), ""}
	for i, s := range sections {
		num := stFaint.Render(strconv.Itoa(i + 1))
		if i == m.sec {
			tag := lipgloss.NewStyle().
				Foreground(lipgloss.Color(colBg)).
				Background(lipgloss.Color(accent)).
				Bold(true).Render(" " + s + " ")
			lines = append(lines, num+" "+tag)
		} else {
			lines = append(lines, num+" "+stDim.Render(s))
		}
	}
	for len(lines) < h-1 {
		lines = append(lines, "")
	}
	lines = append(lines, stFaint.Render("q quit"))
	if len(lines) > h {
		lines = lines[:h]
	}
	for len(lines) < h {
		lines = append(lines, "")
	}
	return lines
}

func (m model) renderEQ(n int, stops [][3]int) string {
	var b strings.Builder
	for i := 0; i < n; i++ {
		ch := blocks[eqLevel(m.frame, i)]
		t := 0.0
		if n > 1 {
			t = float64(i) / float64(n-1)
		}
		b.WriteString(lipgloss.NewStyle().Foreground(lipgloss.Color(colorAtStops(t, stops))).Render(string(ch)))
	}
	return b.String()
}

func (m model) renderBoot() string {
	steps := []string{
		"establishing secure channel",
		"loading profile · Amir Shetaia",
		"mounting /experience /projects /games",
		"sync spotify.now_playing",
		"fetch github.signals",
		"render engine · bubbletea + lipgloss",
	}
	lines := []string{
		gradientFlow("AMIR_OS", float64(m.frame)*0.03),
		stFaint.Render("instrument terminal · v4.8"),
		"",
	}
	shown := m.frame / 2
	for i, s := range steps {
		if i < shown {
			lines = append(lines, stDim.Render("› "+s+" ")+stAccent.Render("ok"))
		} else if i == shown {
			lines = append(lines, stDim.Render("› "+s+" ")+stFaint.Render("…"))
		}
	}
	lines = append(lines, "")
	if shown >= len(steps) {
		lines = append(lines, gradient("ready."))
	} else {
		lines = append(lines, stFaint.Render("booting…"))
	}
	return lipgloss.Place(m.w, m.h, lipgloss.Center, lipgloss.Center, strings.Join(lines, "\n"))
}

func (m model) renderFooter(w int, stops [][3]int) string {
	total := len(m.bodyLines())
	bh := m.bodyHeight()
	off := m.off
	if off > total-bh {
		off = total - bh
	}
	if off < 0 {
		off = 0
	}
	scroll := ""
	if total > bh {
		shown := bh
		if off+shown > total {
			shown = total - off
		}
		scroll = stFaint.Render(fmt.Sprintf("%d–%d/%d", off+1, off+shown, total))
	}

	spot := ""
	if m.now != nil {
		icon := lipgloss.NewStyle().Foreground(lipgloss.Color(colorAtStops(0, stops))).Render("♫")
		var label, eq string
		if m.now.IsPlaying {
			label = stFaint.Render("now playing ")
			eq = m.renderEQ(7, stops) + " "
		} else {
			label = stFaint.Render("last played ")
		}
		info := m.now.Title
		if m.now.Artist != "" {
			info += " — " + m.now.Artist
		}
		avail := w - lipgloss.Width(scroll) - lipgloss.Width(label) - lipgloss.Width(eq) - 6
		if avail < 8 {
			avail = 8
		}
		spot = icon + " " + label + eq + stText.Render(marquee(info, avail, m.frame))
	}
	lineA := truncate(lineLR(" "+spot, scroll+" ", w), w)

	hints := stFaint.Render("↑↓ scroll · ⇥ section · 1–8 jump · click nav · ↑↑↓↓←→←→ba")
	right := stFaint.Render("ssh.amirshetaia.com ")
	lineB := truncate(lineLR(" "+hints, right, w), w)
	return lineA + "\n" + lineB
}

func (m model) View() string {
	if !m.ready || m.w < 24 || m.h < 10 {
		return "Make the window a touch bigger — this needs ~30×12.  (q to quit)"
	}
	if m.booting {
		return m.renderBoot()
	}

	stops := brandStops
	accent := colAccent
	border := colBorder
	if m.arcade {
		stops = arcadeStops
		accent = colArcade
		// CRT pulse: border flickers between hot magenta and cyan.
		if (m.frame/8)%2 == 0 {
			border = "#ff2d95"
		} else {
			border = "#22d3ee"
		}
	}
	ph := float64(m.frame) * 0.015
	w := m.w
	narrow := w < 64

	// Header.
	left := " " + paintG("Amir Shetaia", true, stops, ph) + stFaint.Render("  ·  ") + stDim.Render(pRole)
	tag := stFaint.Render("◷ " + clockStr())
	if m.arcade {
		badge := "★ ARCADE ★"
		bs := lipgloss.NewStyle().Foreground(lipgloss.Color(border)).Bold(true)
		if (m.frame/5)%2 == 0 {
			tag = bs.Render(badge) + "  " + tag
		} else {
			tag = stFaint.Render(badge) + "  " + tag
		}
	}
	header := truncate(lineLR(left, tag+" ", w), w)

	// Body panels.
	innerH := m.bodyHeight()
	contentInnerW := m.contentWidth()
	win := windowLines(m.sectionLines(contentInnerW), m.off, innerH)
	box := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color(border)).
		Padding(0, 1)

	var row string
	if narrow {
		row = box.Width(contentInnerW).Height(innerH).Render(strings.Join(win, "\n"))
	} else {
		sidebar := box.Width(14).Height(innerH).Render(strings.Join(m.renderSidebar(innerH, accent), "\n"))
		content := box.Width(contentInnerW).Height(innerH).Render(strings.Join(win, "\n"))
		row = lipgloss.JoinHorizontal(lipgloss.Top, sidebar, " ", content)
	}

	return header + "\n" + row + "\n" + m.renderFooter(w, stops)
}
