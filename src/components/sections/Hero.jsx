import { useEffect, useState } from "react";
import { ArrowDown, Download, Sparkles } from "lucide-react";
import clients from "../../assets/images/clients.webp";

const roles = [
  "Développeur Full Stack",
  "Administrateur Systèmes",
  "Expert Marketing Digital",
];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const current = roles[roleIndex];
    let i = 0;
    let timer;

    if (typing) {
      timer = setInterval(() => {
        setDisplayed(current.slice(0, i + 1));
        i++;
        if (i === current.length) {
          clearInterval(timer);
          setTimeout(() => setTyping(false), 2000);
        }
      }, 60);
    } else {
      timer = setInterval(() => {
        setDisplayed((prev) => {
          const next = prev.slice(0, -1);
          if (next.length === 0) {
            clearInterval(timer);
            setRoleIndex((p) => (p + 1) % roles.length);
            setTyping(true);
          }
          return next;
        });
      }, 30);
    }

    return () => clearInterval(timer);
  }, [roleIndex, typing]);

  const scrollDown = () =>
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background orbs */}
      <div className="orb w-[600px] h-[600px] bg-brand-500 -top-40 -left-40" />
      <div className="orb w-[400px] h-[400px] bg-neon-purple top-1/2 -right-20" />
      <div className="orb w-[300px] h-[300px] bg-neon-cyan bottom-20 left-1/3" style={{ opacity: 0.05 }} />

      <div className="grid-overlay absolute inset-0 z-0" />

      {/* ── Contenu principal — pb-24 sur mobile pour dégager le bouton scroll ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24 lg:pb-10 w-full">
        <div className="grid lg:grid-cols-[1fr_auto] lg:gap-12 items-center">

          {/* Left column */}
          <div className="flex flex-col items-start gap-8">

            {/* Badge */}
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full animate-fade-in">
              <Sparkles size={14} className="text-brand-400" />
              <span className="text-sm font-mono text-brand-400">
                Disponible pour de nouveaux projets
              </span>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <p className="font-mono text-brand-400 text-sm tracking-widest uppercase">
                Bonjour, je suis
              </p>
              <h1 className="section-title text-white leading-tight">
                Yann
                <br />
                <span className="bg-gradient-to-r from-brand-400 via-neon-purple to-neon-cyan bg-clip-text text-transparent">
                  NDALA
                </span>
              </h1>
            </div>

            {/* Typing role */}
            <div className="h-10 flex items-center">
              <span className="font-display text-xl md:text-2xl text-light font-medium">
                {displayed}
                <span className="typing-cursor" />
              </span>
            </div>

            {/* Description */}
            <p className="text-subtle text-lg max-w-xl leading-relaxed">
              Je conçois et développe des applications web et mobiles
              performantes, et j'élabore des stratégies digitales qui
              convertissent. Du code propre à la croissance digitale 
              tout sous un même toit.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 py-4 border-y border-border w-full">
              {[
                { value: "10+", label: "Projets livrés" },
                { value: "1+", label: "Ans XP" },
                {
                  value: (
                    <img
                      src={clients}
                      alt="Clients satisfaits"
                      className=" object-contain"
                      width="50" height="10"
                    />
                  ),
                  label: "Clients satisfaits",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-display font-bold text-2xl text-white glow-text">
                    {stat.value}
                  </span>
                  <span className="text-muted text-xs mt-1">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() =>
                  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
                }
                className="neon-btn text-white font-semibold px-7 py-3 rounded-xl flex items-center gap-2"
              >
                Voir mes projets
                <ArrowDown size={16} />
              </button>

              {/* Bouton CV — lien direct vers un seul CV */}
              <a
                href="/cv.pdf"
                download="CV_Yann_NDALA_FullStack_Marketing.pdf"
                className="glass glow-border text-light font-medium px-7 py-3 rounded-xl flex items-center gap-2 hover:text-brand-400 transition-all duration-300"
              >
                <Download size={16} />
                Télécharger CV
              </a>
            </div>

          </div>
          {/* end left column */}

          {/* Right column — code snippet (desktop only) */}
          <div className="hidden lg:block glass glow-border rounded-2xl p-5 font-mono text-xs text-subtle w-72 animate-float shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-auto text-muted text-xs">portfolio.js</span>
            </div>
            <pre className="text-xs leading-6">
              <span className="text-brand-400">const</span>{" "}
              <span className="text-neon-cyan">dev</span>
              {" = {"}
              {"\n"}{"  "}
              <span className="text-light">stack</span>:{" "}
              <span className="text-green-400">'React, Node'</span>
              {",\n"}{"  "}
              <span className="text-light">mobile</span>:{" "}
              <span className="text-green-400">'React Native'</span>
              {",\n"}{"  "}
              <span className="text-light">marketing</span>:{" "}
              <span className="text-green-400">'Digital'</span>
              {",\n"}{"  "}
              <span className="text-light">passion</span>:{" "}
              <span className="text-brand-400">true</span>
              {"\n}"}
            </pre>
          </div>
          {/* end right column */}

        </div>
        {/* end grid */}
      </div>

      {/* ── Scroll indicator — toujours visible, z-index élevé ── */}
      <button
        onClick={scrollDown}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-muted hover:text-brand-400 transition-colors animate-bounce"
        aria-label="Défiler vers le bas"
      >
        <span className="text-xs font-mono tracking-widest uppercase">Scroll</span>
        <ArrowDown size={16} />
      </button>

    </section>
  );
}
