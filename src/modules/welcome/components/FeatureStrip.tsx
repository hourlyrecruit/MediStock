import { m } from 'framer-motion';
import { images, ResponsiveImage, type ImageEntry } from '@/assets/images';
import { heroItem, heroSequence } from './motion';

interface Feature {
  title: string;
  line: string;
  image: ImageEntry;
}

const FEATURES: readonly Feature[] = [
  {
    title: 'Batch-wise stock',
    line: 'Every batch keeps its own quantity, price and expiry, with a full movement history.',
    image: images.shelves,
  },
  {
    title: 'Expiry tracking',
    line: 'Batches expiring today, soon or already expired surface before they reach the counter.',
    image: images.capsules,
  },
  {
    title: 'Reports & CSV',
    line: 'Stock, expiry and movement reports that export to CSV in one click.',
    image: images.supplies,
  },
];

export function FeatureStrip() {
  return (
    <section
      aria-labelledby="welcome-features"
      className="mx-auto w-full max-w-[1200px] px-4 py-16 md:px-8 md:py-24"
    >
      <h2 id="welcome-features" className="text-xl font-semibold">
        Everything the shelf needs to say.
      </h2>
      <p className="text-fg-muted mt-2 max-w-[48ch] text-base">
        Three things MediStock does quietly, every day.
      </p>
      <m.ul
        variants={heroSequence}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="mt-10 grid gap-6 md:grid-cols-3"
      >
        {FEATURES.map((feature) => (
          <m.li
            key={feature.title}
            variants={heroItem}
            className="group card hover:border-border-strong overflow-hidden transition-[border-color] duration-200"
          >
            <ResponsiveImage
              image={feature.image}
              alt=""
              grade
              imgClassName="transition-[scale] duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
              sizes="(min-width: 1200px) 380px, (min-width: 768px) 33vw, 100vw"
            />
            <div className="p-5">
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="text-fg-muted mt-1 text-sm">{feature.line}</p>
            </div>
          </m.li>
        ))}
      </m.ul>
    </section>
  );
}
