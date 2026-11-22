export default function AdCard({ imageUrl, alt = 'Publicidade' }) {
  if (!imageUrl) return null;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-card border border-navy-100/80 flex flex-col h-full min-h-[310px] sm:min-h-[340px] relative select-none group transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
      {/* Barra de identificação editorial de Publicidade */}
      <div className="px-3.5 py-1.5 bg-white border-b border-navy-100 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-navy-400 shrink-0">
        <span className="flex items-center gap-1.5 text-navy-600">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
          Publicidade
        </span>
        <span className="text-[9px] font-semibold text-navy-400 bg-navy-50 px-2 py-0.5 rounded-md border border-navy-100/60">
          Anúncio
        </span>
      </div>

      {/* Container da imagem do anúncio: sem cortar absolutamente nada */}
      <div className="w-full flex-1 relative bg-navy-950 flex items-center justify-center overflow-hidden min-h-[270px]">
        {/* Fundo dinâmico com blur da própria arte para preenchimento estético e imersivo */}
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none"
        />

        {/* Imagem do anúncio 100% nítida e visível sem nenhum corte de texto */}
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          className="relative z-10 w-full h-full object-contain p-2 max-h-[360px]"
        />
      </div>
    </div>
  );
}
