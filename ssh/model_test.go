package main

import (
	"regexp"
	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"
)

var ansiRe = regexp.MustCompile("\x1b\\[[?0-9;]*[A-Za-z]")

func strip(s string) string { return ansiRe.ReplaceAllString(s, "") }

func upd(m model, msg tea.Msg) model {
	nm, _ := m.Update(msg)
	return nm.(model)
}

func ready(w, h int) model {
	return upd(newModel(w, h), tea.WindowSizeMsg{Width: w, Height: h})
}

func runeKey(s string) tea.KeyMsg {
	return tea.KeyMsg(tea.Key{Type: tea.KeyRunes, Runes: []rune(s)})
}

func TestSectionsRender(t *testing.T) {
	want := map[string][]string{
		"Home":       {"AMIR", "READOUT", "Ontario"},
		"About":      {"EDUCATION", "Queen's", "AWARDS"},
		"Experience": {"AMD", "Huawei", "ROCm"},
		"Projects":   {"OptVerse", "DeepParse", "VehiPlus"},
		"Skills":     {"Languages", "OpenMP"},
		"Games":      {"Witcher", "NightBaRron1412", "Pragmata"},
		"Contact":    {"amirshetaia.com", "LinkedIn"},
	}
	m := ready(110, 32)
	for i, s := range sections {
		m.sec = i
		m.off = 0
		if strings.TrimSpace(strip(m.View())) == "" {
			t.Fatalf("%s: empty view", s)
		}
		full := strip(strings.Join(m.bodyLines(), "\n"))
		for _, w := range want[s] {
			if !strings.Contains(full, w) {
				t.Errorf("section %q: content missing %q", s, w)
			}
		}
	}
}

func TestNavigation(t *testing.T) {
	m := ready(100, 30)
	if got := upd(m, tea.KeyMsg(tea.Key{Type: tea.KeyTab})).sec; got != 1 {
		t.Errorf("tab -> sec %d, want 1", got)
	}
	if got := upd(m, tea.KeyMsg(tea.Key{Type: tea.KeyShiftTab})).sec; got != len(sections)-1 {
		t.Errorf("shift+tab from 0 -> sec %d, want %d", got, len(sections)-1)
	}
	if got := upd(m, runeKey("6")).sec; got != 5 {
		t.Errorf("'6' -> sec %d, want 5", got)
	}
	_, cmd := m.Update(runeKey("q"))
	if cmd == nil {
		t.Fatal("q should return a command")
	}
	if _, ok := cmd().(tea.QuitMsg); !ok {
		t.Fatal("q should quit")
	}
}

func TestScrollClamp(t *testing.T) {
	m := ready(80, 20)
	m.sec = 2 // Experience is long enough to scroll
	for i := 0; i < 1000; i++ {
		m = upd(m, tea.KeyMsg(tea.Key{Type: tea.KeyDown}))
	}
	maxOff := len(m.bodyLines()) - m.bodyHeight()
	if maxOff < 0 {
		maxOff = 0
	}
	if m.off != maxOff {
		t.Errorf("scroll not clamped: off=%d want %d", m.off, maxOff)
	}
	if got := upd(m, runeKey("g")).off; got != 0 {
		t.Errorf("g -> off %d, want 0", got)
	}
}

func TestNoPanicAcrossSizes(t *testing.T) {
	for _, sz := range [][2]int{{1, 1}, {8, 4}, {40, 12}, {63, 24}, {64, 24}, {220, 60}} {
		m := ready(sz[0], sz[1])
		for i := range sections {
			m.sec = i
			if m.View() == "" {
				t.Fatalf("empty view at %dx%d sec %d", sz[0], sz[1], i)
			}
		}
	}
}
