import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-savage-nation.jpg";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

export const Hero = () => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--pointer-x", `${x}%`);
      el.style.setProperty("--pointer-y", `${y}%`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero" aria-hidden />
      <img
        src={heroImage}
        alt="Abstract patriotic American flag hero for Savage Nation USA"
        className="absolute inset-0 size-full object-cover opacity-70"
        loading="eager"
        fetchPriority="high"
      />
      <div className="relative container mx-auto min-h-[70vh] flex items-center">
        <div className="max-w-2xl glass-panel p-8 rounded-xl shadow-elevated">
          <h1 className="display text-5xl md:text-6xl mb-4">Savage Nation USA</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            Patriotic gear, stories, and a mission that stands with veterans.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/store">Shop the Store</Link>
            </Button>
            <Button asChild variant="soft" size="xl">
              <Link to="/mission">Our Mission</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
