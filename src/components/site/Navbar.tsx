import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { user, isAdmin, enabled, signOut } = useAuth();

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
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `text-sm transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              Admin
            </NavLink>
          )}
          <Button asChild variant="hero" size="lg">
            <Link to="/store">Shop Now</Link>
          </Button>

          {/* Auth controls */}
          {enabled && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Account" className="rounded-full outline-none">
                  <Avatar>
                    <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && <DropdownMenuItem asChild><Link to="/admin">Go to Admin</Link></DropdownMenuItem>}
                <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
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
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? "text-primary" : "text-foreground"}`}>
                Admin
              </NavLink>
            )}
            <Button asChild variant="hero" size="lg" onClick={() => setOpen(false)}>
              <Link to="/store">Shop Now</Link>
            </Button>
            {enabled && user ? (
              <Button variant="outline" onClick={() => { signOut(); setOpen(false); }}>Sign out</Button>
            ) : (
              <Button asChild variant="outline" onClick={() => setOpen(false)}>
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
