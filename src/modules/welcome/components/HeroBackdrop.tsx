import { images, ResponsiveImage } from '@/assets/images';

const PHOTO_MASK =
  '[mask-image:linear-gradient(to_bottom,transparent_30%,black_62%,transparent_100%)] md:[mask-image:radial-gradient(70%_80%_at_0%_45%,black_0%,transparent_100%)]';

export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${PHOTO_MASK}`}>
      <div className="absolute inset-0 opacity-[0.1] dark:opacity-[0.12]">
        <ResponsiveImage
          image={images.heroPharmacy}
          alt=""
          priority
          grade
          fill
          sizes="100vw"
          className="bg-transparent"
        />
      </div>
    </div>
  );
}
