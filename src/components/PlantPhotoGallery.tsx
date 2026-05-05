import Image from 'next/image';

interface PlantPhotoGalleryProps {
  plantName: string;
  mainImage?: string;
  imageAlt?: string;
  imageCredit?: string;
  additionalImages?: string[];
  lang?: 'en' | 'es';
}

export default function PlantPhotoGallery({
  plantName,
  mainImage,
  imageAlt,
  imageCredit,
  additionalImages = [],
  lang = 'en',
}: PlantPhotoGalleryProps) {
  if (!mainImage) return null;

  const altText    = imageAlt ?? `${plantName} houseplant`;
  const photoLabel = lang === 'es' ? 'Foto' : 'Photo';
  const creditText = imageCredit && imageCredit !== 'AI Generated' ? imageCredit : 'PlantCare Central';

  return (
    <div className="bg-[#F0FDF4] rounded-3xl overflow-hidden border border-[#E2EFE7] mb-8">
      <div className="relative w-full h-64 sm:h-96">
        <Image
          src={mainImage}
          alt={altText}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent pt-12 pb-3 px-4">
          <p className="text-[11px] text-white/70 leading-none">
            {photoLabel}: {creditText}
          </p>
        </div>
      </div>

      {additionalImages.length > 0 && (
        <div
          className="grid gap-3 p-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(additionalImages.length, 3)}, minmax(0, 1fr))` }}
        >
          {additionalImages.slice(0, 3).map((imgUrl, i) => {
            const labels = ['close-up', 'detail', 'propagation'];
            return (
              <div
                key={imgUrl}
                className="relative aspect-square rounded-2xl overflow-hidden border border-[#E2EFE7] group"
              >
                <Image
                  src={imgUrl}
                  alt={`${plantName} ${labels[i] ?? 'photo'}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
