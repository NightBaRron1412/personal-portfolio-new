package main

import (
	"context"
	"errors"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/log"
	"github.com/charmbracelet/ssh"
	"github.com/charmbracelet/wish"
	"github.com/charmbracelet/wish/activeterm"
	bm "github.com/charmbracelet/wish/bubbletea"
	lm "github.com/charmbracelet/wish/logging"
	gossh "golang.org/x/crypto/ssh"
)

func env(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}

// teaHandler builds a fresh TUI per SSH session, sized to the client's PTY.
func teaHandler(s ssh.Session) (tea.Model, []tea.ProgramOption) {
	pty, _, _ := s.Pty()
	return newModel(pty.Window.Width, pty.Window.Height),
		[]tea.ProgramOption{tea.WithAltScreen()}
}

func main() {
	host := env("HOST", "0.0.0.0")
	port := env("PORT", "2222")

	srv, err := wish.NewServer(
		wish.WithAddress(net.JoinHostPort(host, port)),
		wish.WithHostKeyPath(".ssh/term_ed25519"),
		// Read-only public portfolio: accept everyone, run only the TUI.
		wish.WithPublicKeyAuth(func(ssh.Context, ssh.PublicKey) bool { return true }),
		wish.WithKeyboardInteractiveAuth(func(ssh.Context, gossh.KeyboardInteractiveChallenge) bool { return true }),
		wish.WithMiddleware(
			bm.Middleware(teaHandler),
			activeterm.Middleware(), // require an interactive terminal
			lm.Middleware(),         // log connections
		),
	)
	if err != nil {
		log.Fatal("could not create server", "err", err)
	}

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	log.Info("starting SSH portfolio", "addr", net.JoinHostPort(host, port))
	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
			log.Error("server error", "err", err)
			done <- os.Interrupt
		}
	}()

	<-done
	log.Info("stopping SSH portfolio")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
		log.Error("could not stop server", "err", err)
	}
}
