import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border-subtle py-6 text-sm text-text-secondary">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} {profile.name}. Built with care.</p>
        <div className="flex gap-4">
          <a href="#home" className="hover:text-text-primary">Home</a>
          <a href="#projects" className="hover:text-text-primary">Projects</a>
          <a href="#contact" className="hover:text-text-primary">Contact</a>
        </div>
      </div>
    </footer>
  );
}
