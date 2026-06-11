package main

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

const sidebarW = 18

type tickMsg time.Time

func tick() tea.Cmd {
	return tea.Tick(time.Millisecond*110, func(t time.Time) tea.Msg { return tickMsg(t) })
}

type model struct {
	w, h  int
	sec   int
	off   int
	frame int
	ready bool
}

func newModel(w, h int) model {
	return model{w: w, h: h, ready: w > 0 && h > 0}
}

func (m model) Init() tea.Cmd { return tick() }

func (m model) contentWidth() int {
	w := m.w - 2
	if m.w >= 64 {
		w = m.w - sidebarW - 3
	}
	if w < 20 {
		w = 20
	}
	return w
}

func (m model) bodyLines() []string { return bodyFor(m.sec, m.contentWidth()) }

func (m model) bodyHeight() int {
	h := m.h - 4
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
		return m, tick()
	case tea.KeyMsg:
		switch msg.String() {
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
		case "1", "2", "3", "4", "5", "6", "7":
			i := int(msg.String()[0] - '1')
			if i >= 0 && i < len(sections) {
				m.sec = i
				m.off = 0
			}
		}
		return m, nil
	}
	return m, nil
}

func (m model) renderSidebar(h int) []string {
	lines := []string{stFaint.Render(" PORTFOLIO"), ""}
	for i, s := range sections {
		num := stFaint.Render(strconv.Itoa(i + 1))
		if i == m.sec {
			tag := lipgloss.NewStyle().
				Foreground(lipgloss.Color(colBg)).
				Background(lipgloss.Color(colAccent)).
				Bold(true).Render(" " + s + " ")
			lines = append(lines, " "+num+" "+tag)
		} else {
			lines = append(lines, " "+num+" "+stDim.Render(s))
		}
	}
	for len(lines) < h {
		lines = append(lines, "")
	}
	return lines[:h]
}

func (m model) renderEQ(n int) string {
	var b strings.Builder
	for i := 0; i < n; i++ {
		ch := blocks[eqLevel(m.frame, i)]
		t := 0.0
		if n > 1 {
			t = float64(i) / float64(n-1)
		}
		b.WriteString(lipgloss.NewStyle().Foreground(lipgloss.Color(colorAt(t))).Render(string(ch)))
	}
	return b.String()
}

func (m model) View() string {
	if !m.ready || m.w < 4 || m.h < 8 {
		return "loading…"
	}
	w := m.w
	narrow := w < 64
	var b strings.Builder

	// Header.
	left := " " + gradientBold("Amir Shetaia") + stFaint.Render(" · ") + stDim.Render(pRole)
	right := stDim.Render(sections[m.sec]) + " "
	b.WriteString(truncate(lineLR(left, right, w), w))
	b.WriteString("\n")
	if narrow {
		l2 := lineLR(
			" "+gradientBold(sections[m.sec]),
			stFaint.Render(fmt.Sprintf("%d/%d  ‹←/→›", m.sec+1, len(sections)))+" ",
			w,
		)
		b.WriteString(truncate(l2, w))
	} else {
		b.WriteString(stFaint.Render(strings.Repeat("─", w)))
	}
	b.WriteString("\n")

	// Body (windowed by scroll offset).
	bodyH := m.bodyHeight()
	content := m.bodyLines()
	total := len(content)
	off := m.off
	if maxOff := total - bodyH; off > maxOff {
		off = maxOff
	}
	if off < 0 {
		off = 0
	}
	win := make([]string, 0, bodyH)
	for i := off; i < off+bodyH && i < total; i++ {
		win = append(win, content[i])
	}
	for len(win) < bodyH {
		win = append(win, "")
	}

	if narrow {
		for _, l := range win {
			b.WriteString(truncate(" "+l, w))
			b.WriteString("\n")
		}
	} else {
		side := m.renderSidebar(bodyH)
		sep := stFaint.Render("│")
		for i := 0; i < bodyH; i++ {
			row := padRight(side[i], sidebarW) + " " + sep + " " + win[i]
			b.WriteString(truncate(row, w))
			b.WriteString("\n")
		}
	}

	// Footer.
	b.WriteString(stFaint.Render(strings.Repeat("─", w)))
	b.WriteString("\n")
	shown := bodyH
	if off+shown > total {
		shown = total - off
	}
	scroll := ""
	if total > bodyH {
		scroll = stFaint.Render(fmt.Sprintf("%d–%d/%d", off+1, off+shown, total))
	}
	hints := stFaint.Render("↑/↓ scroll · ⇥ section · 1–7 jump · q quit")
	rightF := scroll + "  " + m.renderEQ(10) + " "
	b.WriteString(truncate(lineLR(" "+hints, rightF, w), w))
	return b.String()
}
