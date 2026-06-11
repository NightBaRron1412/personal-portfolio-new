package main

import (
	"fmt"
	"strings"
)

// Blocky "AS" monogram for the Home view.
var asLogo = []string{
	" █████  ███████",
	"██   ██ ██     ",
	"███████ ███████",
	"██   ██      ██",
	"██   ██ ███████",
}

func heading(s string) string { return gradientBold("▌ " + strings.ToUpper(s)) }

func padLabel(k string) string { return stAccent2.Render(fmt.Sprintf("%-13s", k)) }

func kv(k, v string, w int) []string {
	key := stAccent2.Render(fmt.Sprintf("%-14s", k))
	vals := wrapText(v, w-15)
	out := []string{key + stText.Render(vals[0])}
	for _, l := range vals[1:] {
		out = append(out, strings.Repeat(" ", 14)+stText.Render(l))
	}
	return out
}

func bulletLines(items []string, w int) []string {
	var out []string
	for _, it := range items {
		ls := wrapText(it, w-2)
		for i, l := range ls {
			if i == 0 {
				out = append(out, stAccent.Render("› ")+stText.Render(l))
			} else {
				out = append(out, "  "+stText.Render(l))
			}
		}
	}
	return out
}

func viewHome(w int) []string {
	var L []string
	for _, ln := range asLogo {
		L = append(L, gradient(ln))
	}
	L = append(L,
		"",
		gradientBold("AMIR  SHETAIA"),
		stDim.Render(pRole),
		stFaint.Render("⌖ "+pLoc),
		"",
		stLabel.Render("// READOUT"),
	)
	for _, qf := range quickFacts {
		L = append(L, "  "+stAccent.Render("▸ ")+padLabel(qf[0])+stText.Render(qf[1]))
	}
	L = append(L, "", stLabel.Render("// NOW"))
	for _, ln := range wrapText(pNow, w-2) {
		L = append(L, "  "+stText.Render(ln))
	}
	L = append(L, "")
	for _, ln := range wrapText(pBio, w) {
		L = append(L, stDim.Render(ln))
	}
	L = append(L, "", stFaint.Render("Tab / 1–7 to explore · ↑↓ scroll · q to quit"))
	return L
}

func viewAbout(w int) []string {
	out := []string{heading("About"), ""}
	for _, l := range wrapText(pBio, w) {
		out = append(out, stText.Render(l))
	}
	out = append(out, "", stLabel.Render("// AT A GLANCE"))
	for _, qf := range quickFacts {
		out = append(out, kv(qf[0], qf[1], w)...)
	}
	out = append(out, "", stLabel.Render("// EDUCATION"))
	for _, d := range education {
		out = append(out, stAccent2.Render(d.degree))
		out = append(out, stText.Render(d.school)+stFaint.Render("  ·  "+d.year+"  ·  GPA "+d.gpa))
		for _, l := range wrapText(d.details, w) {
			out = append(out, stDim.Render(l))
		}
		out = append(out, "")
	}
	out = append(out, stLabel.Render("// AWARDS"))
	for _, a := range awards {
		for i, l := range wrapText(a, w-2) {
			if i == 0 {
				out = append(out, stAccent.Render("★ ")+stText.Render(l))
			} else {
				out = append(out, "  "+stText.Render(l))
			}
		}
	}
	out = append(out, "", stLabel.Render("// COMMUNITY"))
	for _, c := range community {
		for i, l := range wrapText(c, w-2) {
			if i == 0 {
				out = append(out, stAccent.Render("◆ ")+stText.Render(l))
			} else {
				out = append(out, "  "+stText.Render(l))
			}
		}
	}
	return out
}

func viewExperience(w int) []string {
	out := []string{heading("Experience"), ""}
	for _, e := range experience {
		out = append(out, gradientBold(e.role))
		out = append(out, stAccent2.Render(e.company)+stFaint.Render("  ·  "+e.dates))
		out = append(out, stFaint.Render(e.location))
		for _, l := range wrapText(e.summary, w) {
			out = append(out, stDim.Render(l))
		}
		out = append(out, bulletLines(e.bullets, w)...)
		if len(e.tech) > 0 {
			for _, l := range wrapText("tech · "+strings.Join(e.tech, " · "), w) {
				out = append(out, stFaint.Render(l))
			}
		}
		out = append(out, "")
	}
	return out
}

func viewProjects(w int) []string {
	out := []string{heading("Selected Work"), ""}
	for _, p := range projects {
		out = append(out, gradientBold(p.title))
		out = append(out, stFaint.Render(p.role))
		for _, l := range wrapText(p.desc, w) {
			out = append(out, stText.Render(l))
		}
		for _, l := range wrapText("Outcome — "+p.outcomes, w) {
			out = append(out, stDim.Render(l))
		}
		if len(p.tech) > 0 {
			for _, l := range wrapText("tech · "+strings.Join(p.tech, " · "), w) {
				out = append(out, stFaint.Render(l))
			}
		}
		if p.link != "" {
			out = append(out, stAccent.Render("↪ "+p.link))
		}
		out = append(out, "")
	}
	return out
}

func viewSkills(w int) []string {
	out := []string{heading("Skills"), ""}
	for _, c := range skillCats {
		out = append(out, stAccent2.Render(c.name))
		for _, l := range wrapText(strings.Join(c.items, " · "), w) {
			out = append(out, stText.Render(l))
		}
		out = append(out, "")
	}
	return out
}

func viewGames(w int) []string {
	out := []string{
		heading("Off the Clock"),
		stDim.Render("Games I keep coming back to."),
		stFaint.Render("player · " + playerTag),
		"",
	}
	for _, g := range games {
		out = append(out, gradientBold(g.title)+"  "+stBadge.Render(" "+strings.ToUpper(g.status)+" "))
		for _, l := range wrapText(g.note, w) {
			out = append(out, stDim.Render(l))
		}
		out = append(out, stFaint.Render(strings.Join(g.platforms, " · ")))
		out = append(out, "")
	}
	return out
}

func viewContact(w int) []string {
	out := []string{heading("Contact"), ""}
	for _, l := range links {
		out = append(out, kv(l[0], l[1], w)...)
	}
	out = append(out, "")
	msg := "Open to conversations about GPU/driver work, HPC, and systems engineering. The full visual experience lives at amirshetaia.com."
	for _, l := range wrapText(msg, w) {
		out = append(out, stDim.Render(l))
	}
	out = append(out, "", gradient("Thanks for SSHing in. ◇"))
	return out
}

func bodyFor(sec, w int) []string {
	switch sections[sec] {
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
	case "Games":
		return viewGames(w)
	case "Contact":
		return viewContact(w)
	}
	return nil
}
