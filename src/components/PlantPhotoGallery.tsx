import fs from 'fs';
import path from 'path';
import Image from 'next/image';

interface PlantPhotoGalleryProps {
  plantName: string;
  slug: string;
  mainImage?: string;
  imageAlt?: string;
  imageCredit?: string;
  lang?: 'en' | 'es';
}

function getExistingAdditionalImages(slug: string): string[] {
  const suffixes = ['-2', '-3', '-detail'];
  return suffixes
    .map((s) => ({ web: `/images/plants/${slug}${s}.jpg`, fs: path.join(process.cwd(), 'public', 'images', 'plants', `${slug}${s}.jpg`) }))
    .filter(({ fs: fsPath }) => {
      try { return fs.existsSync(fsPath); } catch { return false; }
    })
    .map(({ web }) => web);
}

function buildCaption(credit?: string): string {
  if (credit && credit !== 'AI Generated') return `Photo: ${credit}`;
  return 'PlantCare Central';
}

export default function PlantPhotoGallery({
  plantName,
  slug,
  mainImage,
  imageAlt,
  imageCredit,
  lang = 'en',
}: PlantPhotoGalleryProps) {
  if (!mainImage) return null;

  const altText = imageAlt ?? `${plantName} houseplant`;
  const caption = buildCaption(imageCredit);
  const secondaryImages = getExistingAdditionalImages(slug);
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

      {secondaryImages.length > 0 && (
        <div
          className="grid gap-3 p-4"
          style={{ gridTemplateColumns: `repeat(${secondaryImages.length}, minmax(0, 1fr))` }}
        >
          {secondaryImages.map((imgPath, i) => {
            const labels = ['close-up', 'detail', 'propagation'];
            const imgAlt = `${plantName} ${labels[i] ?? 'photo'}`;
            return (
              <div
                key={imgPath}
                className="relative aspect-square rounded-2xl overflow-hidden border border-[#E2EFE7] group"
              >
                <Image
                  src={imgPath}
                  alt={imgAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent pb-2 pt-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-[10px] text-white/80 leading-none truncate">{caption}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
