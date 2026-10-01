import clsx from "clsx";
import { GridItem } from "@/components/layout/GridItem";
import { TileImage } from "@/components/home/TileImage";
import { ThumbCardView } from "@/components/cards/ThumbCard";
import { Icon } from "@/components/spine/Icon";
import { ImagePlaceholder } from "@/components/spine/ImagePlaceholder";
import { Title } from "@/components/spine/Title";
import { SectionBody } from "@/components/sections/parts";
import type { StudentWorkCard } from "@/lib/content/editorial";

/**
 * A discipline's student work (STAGE-0-NOTES §72): the section's prose in
 * columns 2–3; the first work as the feature — its panel (title, student,
 * description, arrow) in column 1 beside its image in columns 2–4 (2–3 at three
 * columns, stacked below that); the rest as Thumbs, three across in 2–4. A
 * description and an arrow render only with text and a real URL; one work is the
 * feature alone, with no thumb row.
 */
export function StudentWorkSection({
  title,
  body,
  works,
}: {
  title: string;
  body?: string;
  works: StudentWorkCard[];
}) {
  const [feature, ...thumbs] = works;
  return (
    <GridItem as="section" span={4} subgrid>
      <Title variant="section">{title}</Title>
      {body && <SectionBody body={body} />}
      {feature && (
        <>
          <GridItem span="full-then-1" start={1} className="flex flex-col justify-end gap-2">
            <h3 className="font-primary text-h5 text-text-primary">{feature.title}</h3>
            {feature.student && <p className="font-primary text-label text-text-secondary">{feature.student}</p>}
            {feature.description && (
              <p className="font-body text-caption text-text-secondary">{feature.description}</p>
            )}
            {feature.url && (
              <a
                href={feature.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={feature.title}
                className="mt-2 inline-flex size-6 items-center justify-center text-icon-quaternary transition-colors duration-150 ease-in-out hover:text-icon-secondary"
              >
                <Icon name="arrow-up-right" className="size-4" />
              </a>
            )}
          </GridItem>
          <GridItem span="hero" start={2} as="figure">
            {/* 1038 × 597 on the board. */}
            {feature.image ? (
              <TileImage
                media={feature.image}
                className="relative aspect-[1038/597] w-full"
                sizes="(min-width: 1280px) 1038px, (min-width: 1024px) 64vw, 96vw"
              />
            ) : (
              <ImagePlaceholder className="aspect-[1038/597]" />
            )}
          </GridItem>
        </>
      )}
      {thumbs.map((work, i) => (
        <GridItem
          key={work.id}
          span={1}
          // Each row opens at column 2: every second thumb at three columns,
          // every third at four.
          className={clsx(
            i % 2 === 0 ? "laptop:col-start-2" : "laptop:col-start-auto",
            i % 3 === 0 ? "desktop:col-start-2" : "desktop:col-start-auto",
          )}
        >
          {/* Unlinked: a work has no page. */}
          <ThumbCardView title={work.title} meta={work.student} image={work.image} />
        </GridItem>
      ))}
    </GridItem>
  );
}
