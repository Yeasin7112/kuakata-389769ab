import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-muted/50 border-t border-border py-4 px-4 text-center max-w-6xl mx-auto w-full space-y-2">
      <p className="text-sm text-muted-foreground font-bangla">
        সার্বিক সহযোগিতায়ঃ{' '}
        <span className="text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded-md">
          কুয়াকাটা পৌরসভা
        </span>
      </p>
      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 font-bangla">
        কারিগরি সহায়তায় :{' '}
        <a 
          href="https://facebook.com/helloYeasin007" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary font-bold hover:underline bg-primary/10 px-1.5 py-0.5 rounded-md"
        >
          ইয়াছিন আরাফাত শাওন
        </a>।
      </p>
    </footer>
  );
};

export default Footer;
