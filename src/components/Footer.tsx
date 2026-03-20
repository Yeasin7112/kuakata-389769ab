import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-muted/50 border-t border-border py-4 px-4 text-center max-w-6xl mx-auto w-full">
      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 font-bangla">
        কারিগরি সহায়তায় :{' '}
        <a 
          href="https://facebook.com/helloYeasin007" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary font-semibold hover:underline"
        >
          ইয়াছিন আরাফাত শাওন
        </a>।
      </p>
    </footer>
  );
};

export default Footer;
