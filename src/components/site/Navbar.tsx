import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag, Menu } from "lucide-react";

const navItems = [
  { to: "/store", label: "Store" },
  { to: "/videos", label: "Videos" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/gallery", label: "Gallery" },
  { to: "/faq", label: "FAQ" },
  { to: "/story", label: "Story" },
  { to: "/charities", label: "Charities" },
  { to: "/mission", label: "Mission" },
  { to: "/toolshed", label: "Toolshed" },
  { to: "/weekly-blog", label: "Weekly Blog" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav className="container mx-auto flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2">
          <Flag className="text-primary" aria-hidden />
          <span className="text-xl font-semibold tracking-wide">Savage Nation USA</span>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `text-sm transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {item.label}
            </NavLink>
          ))}
          <Button asChild variant="hero" size="lg">
            <Link to="/store">Shop Now</Link>
          </Button>
        </div>

        <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setOpen((v) => !v)}>
          <Menu />
        </Button>
      </nav>

      {open && (
        <div className="lg:hidden border-t bg-background">
          <div className="container mx-auto py-3 grid gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `text-sm ${isActive ? "text-primary" : "text-foreground"}`}
              >
                {item.label}
              </NavLink>
            ))}
            <Button asChild variant="hero" size="lg" onClick={() => setOpen(false)}>
              <Link to="/store">Shop Now</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
