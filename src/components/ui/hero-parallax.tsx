import { useEffect, useMemo, useState } from "react";

export interface HeroParallaxProduct {
  title: string;
  link: string;
  thumbnail: string;
}

interface HeroParallaxProps {
  products: HeroParallaxProduct[];
}

const ProductCard = ({ product, offset }: { product: HeroParallaxProduct; offset: number }) => {
  return (
    <a
      href={product.link}
      target="_blank"
      rel="noreferrer"
      className="group block min-w-[260px] w-[260px] rounded-2xl overflow-hidden border border-white/20 bg-white/5 backdrop-blur transition-transform duration-300 hover:scale-[1.02]"
      style={{ transform: `translate3d(${offset}px, 0, 0)` }}
    >
      <div className="h-36 w-full overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-white">{product.title}</p>
      </div>
    </a>
  );
};

export const HeroParallax = ({ products }: HeroParallaxProps) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const rows = useMemo(() => {
    const chunkSize = Math.ceil(products.length / 3);
    return [
      products.slice(0, chunkSize),
      products.slice(chunkSize, chunkSize * 2),
      products.slice(chunkSize * 2),
    ].filter((row) => row.length > 0);
  }, [products]);

  return (
    <div className="space-y-4">
      {rows.map((row, rowIndex) => {
        const direction = rowIndex % 2 === 0 ? 1 : -1;
        const amount = Math.min(scrollY * 0.08, 80);
        const rowOffset = direction * amount;

        return (
          <div key={rowIndex} className="overflow-x-auto pb-2">
            <div className="flex gap-4 w-max">
              {row.map((product, index) => (
                <ProductCard key={`${product.title}-${index}`} product={product} offset={rowOffset} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

