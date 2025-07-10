
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export const Hero = () => {
  const scrollToRooms = () => {
    const roomsSection = document.getElementById('rooms-section');
    roomsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Enhanced Brixton/Brockwell Park Background Artwork */}
      <div className="absolute inset-0 opacity-20">
        <svg
          viewBox="0 0 1200 800"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Brixton Windmill */}
          <g transform="translate(100, 200)">
            <rect x="45" y="60" width="10" height="80" fill="currentColor" className="text-terracotta-400" />
            <polygon points="50,60 35,45 65,45" fill="currentColor" className="text-terracotta-500" />
            <line x1="50" y1="65" x2="20" y2="40" stroke="currentColor" strokeWidth="2" className="text-sage-400" />
            <line x1="50" y1="65" x2="80" y2="40" stroke="currentColor" strokeWidth="2" className="text-sage-400" />
            <line x1="50" y1="65" x2="25" y2="90" stroke="currentColor" strokeWidth="2" className="text-sage-400" />
            <line x1="50" y1="65" x2="75" y2="90" stroke="currentColor" strokeWidth="2" className="text-sage-400" />
          </g>

          {/* Victorian terraced houses - more detailed */}
          <g transform="translate(200, 300)">
            <rect x="0" y="60" width="25" height="80" fill="currentColor" className="text-terracotta-400" />
            <polygon points="0,60 12.5,45 25,60" fill="currentColor" className="text-terracotta-500" />
            <rect x="6" y="75" width="4" height="8" fill="currentColor" className="text-sage-300" />
            <rect x="15" y="75" width="4" height="8" fill="currentColor" className="text-sage-300" />
            <rect x="10" y="120" width="5" height="20" fill="currentColor" className="text-terracotta-600" />
            
            <rect x="25" y="50" width="25" height="90" fill="currentColor" className="text-sage-400" />
            <polygon points="25,50 37.5,35 50,50" fill="currentColor" className="text-sage-500" />
            <rect x="31" y="65" width="4" height="8" fill="currentColor" className="text-cream-200" />
            <rect x="40" y="65" width="4" height="8" fill="currentColor" className="text-cream-200" />
            <rect x="35" y="115" width="5" height="25" fill="currentColor" className="text-sage-600" />
            
            <rect x="50" y="65" width="25" height="75" fill="currentColor" className="text-terracotta-300" />
            <polygon points="50,65 62.5,50 75,65" fill="currentColor" className="text-terracotta-400" />
            <rect x="56" y="80" width="4" height="8" fill="currentColor" className="text-cream-200" />
            <rect x="65" y="80" width="4" height="8" fill="currentColor" className="text-cream-200" />
            <rect x="60" y="125" width="5" height="15" fill="currentColor" className="text-terracotta-600" />
          </g>

          {/* Railway arches */}
          <g transform="translate(400, 350)">
            <path d="M0 40 Q20 20 40 40 L40 60 L0 60 Z" fill="currentColor" className="text-sage-300" />
            <path d="M45 40 Q65 20 85 40 L85 60 L45 60 Z" fill="currentColor" className="text-sage-400" />
            <path d="M90 40 Q110 20 130 40 L130 60 L90 60 Z" fill="currentColor" className="text-sage-300" />
            <rect x="15" y="40" width="10" height="20" fill="currentColor" className="text-terracotta-200" />
            <rect x="60" y="40" width="10" height="20" fill="currentColor" className="text-terracotta-200" />
            <rect x="105" y="40" width="10" height="20" fill="currentColor" className="text-terracotta-200" />
          </g>

          {/* Electric Avenue market canopies */}
          <g transform="translate(600, 320)">
            <rect x="0" y="50" width="60" height="5" fill="currentColor" className="text-terracotta-300" />
            <rect x="70" y="50" width="60" height="5" fill="currentColor" className="text-sage-300" />
            <rect x="140" y="50" width="60" height="5" fill="currentColor" className="text-terracotta-300" />
            <line x1="10" y1="50" x2="10" y2="70" stroke="currentColor" strokeWidth="2" className="text-sage-400" />
            <line x1="50" y1="50" x2="50" y2="70" stroke="currentColor" strokeWidth="2" className="text-sage-400" />
            <line x1="80" y1="50" x2="80" y2="70" stroke="currentColor" strokeWidth="2" className="text-sage-400" />
            <line x1="120" y1="50" x2="120" y2="70" stroke="currentColor" strokeWidth="2" className="text-sage-400" />
            <line x1="150" y1="50" x2="150" y2="70" stroke="currentColor" strokeWidth="2" className="text-sage-400" />
            <line x1="190" y1="50" x2="190" y2="70" stroke="currentColor" strokeWidth="2" className="text-sage-400" />
          </g>

          {/* Brockwell Park trees - more detailed */}
          <g transform="translate(800, 400)">
            <ellipse cx="30" cy="40" rx="25" ry="30" fill="currentColor" className="text-sage-300" />
            <rect x="28" y="60" width="4" height="20" fill="currentColor" className="text-terracotta-300" />
            
            <ellipse cx="70" cy="35" rx="20" ry="25" fill="currentColor" className="text-sage-400" />
            <rect x="68" y="55" width="4" height="25" fill="currentColor" className="text-terracotta-300" />
            
            <ellipse cx="110" cy="45" rx="28" ry="35" fill="currentColor" className="text-sage-300" />
            <rect x="108" y="70" width="4" height="15" fill="currentColor" className="text-terracotta-300" />
            
            <ellipse cx="150" cy="38" rx="22" ry="28" fill="currentColor" className="text-sage-400" />
            <rect x="148" y="60" width="4" height="20" fill="currentColor" className="text-terracotta-300" />
          </g>

          {/* Brockwell Lido outline */}
          <g transform="translate(900, 450)">
            <rect x="0" y="0" width="80" height="40" rx="20" ry="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage-300" />
            <rect x="10" y="10" width="60" height="20" rx="10" ry="10" fill="currentColor" className="text-sage-200" opacity="0.3" />
          </g>

          {/* Clock tower silhouette */}
          <g transform="translate(1050, 250)">
            <rect x="15" y="40" width="10" height="60" fill="currentColor" className="text-terracotta-400" />
            <rect x="12" y="35" width="16" height="10" fill="currentColor" className="text-terracotta-500" />
            <rect x="10" y="30" width="20" height="8" fill="currentColor" className="text-terracotta-600" />
            <circle cx="20" cy="50" r="6" fill="currentColor" className="text-cream-200" />
            <circle cx="20" cy="50" r="1" fill="currentColor" className="text-terracotta-600" />
          </g>

          {/* Background hills/distant buildings */}
          <g transform="translate(0, 500)">
            <rect x="900" y="0" width="8" height="60" fill="currentColor" className="text-sage-200" />
            <rect x="920" y="10" width="6" height="50" fill="currentColor" className="text-terracotta-200" />
            <rect x="935" y="5" width="10" height="55" fill="currentColor" className="text-sage-200" />
            <rect x="950" y="15" width="7" height="45" fill="currentColor" className="text-terracotta-200" />
            <rect x="965" y="0" width="9" height="60" fill="currentColor" className="text-sage-200" />
          </g>
        </svg>
      </div>

      <div className="text-center max-w-4xl mx-auto animate-fade-in relative z-10">
        <h1 className="text-4xl md:text-6xl font-playfair font-bold text-terracotta-800 mb-6">
          La Casa
          <br />
          Veselukha Ruiz
        </h1>
        <p className="text-xl md:text-2xl text-sage-700 mb-4 font-light">
          South London's finest
        </p>
        <p className="text-lg text-sage-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Because I'm tired of manually tracking everyone's movements.
        </p>
        
        <Button 
          onClick={scrollToRooms}
          className="bg-terracotta-600 hover:bg-terracotta-700 text-white px-8 py-6 text-lg rounded-xl premium-shadow transition-all duration-300 hover:scale-105"
        >
          Check Availability
          <ArrowDown className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};
