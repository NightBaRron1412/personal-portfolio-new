package main

import (
	"crypto/ed25519"
	"crypto/rand"
	"net"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/charmbracelet/ssh"
	"github.com/charmbracelet/wish"
	"github.com/charmbracelet/wish/activeterm"
	bm "github.com/charmbracelet/wish/bubbletea"
	gossh "golang.org/x/crypto/ssh"
)

// End-to-end: start the real wish server, connect over SSH with a PTY, and
// assert the first rendered frame actually contains the portfolio TUI.
func TestSSHServeRendersTUI(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	addr := ln.Addr().String()

	srv, err := wish.NewServer(
		wish.WithHostKeyPath(filepath.Join(t.TempDir(), "hostkey")),
		wish.WithPublicKeyAuth(func(ssh.Context, ssh.PublicKey) bool { return true }),
		wish.WithMiddleware(
			bm.Middleware(teaHandler),
			activeterm.Middleware(),
		),
	)
	if err != nil {
		t.Fatal(err)
	}
	go func() { _ = srv.Serve(ln) }()
	defer srv.Close()

	_, priv, _ := ed25519.GenerateKey(rand.Reader)
	signer, err := gossh.NewSignerFromKey(priv)
	if err != nil {
		t.Fatal(err)
	}
	cfg := &gossh.ClientConfig{
		User:            "guest",
		Auth:            []gossh.AuthMethod{gossh.PublicKeys(signer)},
		HostKeyCallback: gossh.InsecureIgnoreHostKey(),
		Timeout:         5 * time.Second,
	}

	var client *gossh.Client
	deadline := time.Now().Add(5 * time.Second)
	for {
		client, err = gossh.Dial("tcp", addr, cfg)
		if err == nil {
			break
		}
		if time.Now().After(deadline) {
			t.Fatalf("dial: %v", err)
		}
		time.Sleep(50 * time.Millisecond)
	}
	defer client.Close()

	sess, err := client.NewSession()
	if err != nil {
		t.Fatal(err)
	}
	defer sess.Close()
	if err := sess.RequestPty("xterm-256color", 32, 110, gossh.TerminalModes{}); err != nil {
		t.Fatal(err)
	}
	stdout, err := sess.StdoutPipe()
	if err != nil {
		t.Fatal(err)
	}
	if err := sess.Shell(); err != nil {
		t.Fatal(err)
	}

	got := make(chan string, 1)
	go func() {
		buf := make([]byte, 0, 1<<18)
		tmp := make([]byte, 4096)
		end := time.Now().Add(5 * time.Second) // read past the ~2.4s boot splash
		for time.Now().Before(end) {
			n, e := stdout.Read(tmp)
			if n > 0 {
				buf = append(buf, tmp[:n]...)
			}
			if e != nil {
				break
			}
		}
		got <- strip(string(buf))
	}()

	var text string
	select {
	case text = <-got:
	case <-time.After(7 * time.Second):
		t.Fatal("timeout reading TUI output")
	}

	for _, w := range []string{"AMIR", "Home", "Experience"} {
		if !strings.Contains(text, w) {
			t.Errorf("rendered TUI missing %q; got snippet:\n%s", w, snippet(text))
		}
	}
}

func snippet(s string) string {
	s = strings.TrimSpace(s)
	if len(s) > 600 {
		s = s[:600]
	}
	return s
}
