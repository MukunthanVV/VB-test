const NormalFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-outline-variant py-12 px-8 md:px-16 lg:px-24 relative z-10">
      <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3 font-headline-md text-2xl text-on-surface tracking-tighter">
          VB ASSOCIATES
        </div>

        <div className="text-on-surface-variant text-sm">
          &copy; {currentYear} VB Associates. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default NormalFooter;
