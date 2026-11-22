export default function AdCard({ imageUrl, alt = 'Publicidade' }) {
  if (!imageUrl) return null;

  return (
    <div className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 border border-navy-100/80 h-full relative select-none">
      {/* Selo elegante de Publicidade sobreposto no canto superior */}
      <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-950/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md border border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
          Publicidade
        </span>
      </div>

      {/* A imagem cobre 100% do card sem nenhuma margem, respeitando o tamanho exato dos cards de notícias */}
      <div className="w-full h-full flex-1 relative overflow-hidden bg-navy-100">
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover block"
        />
      </div>
    </div>
  );
}
