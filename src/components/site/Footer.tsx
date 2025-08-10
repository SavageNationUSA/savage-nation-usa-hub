export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-10 grid gap-4 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p>&copy; {year} Savage Nation USA. All rights reserved.</p>
          <p>We proudly support veterans and their families.</p>
        </div>
      </div>
    </footer>
  );
};
