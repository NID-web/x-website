// One view of the faculty directory (STAGE-0-NOTES §82): SecondaryTemplate with
// no hero and no standfirst, the view switcher under the back link, one grouped
// rail, and "Browse faculty by". Both routes render this; what differs is the
// view, never a branch on it.
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SecondaryTemplate } from "@/components/sections/SecondaryTemplate";
import { ViewSwitcher } from "@/components/spine/ViewSwitcher";
import { FACULTY_VIEWS, facultyViewPath, type FacultyView } from "@/lib/content/faculty-views";
import { getFaculty } from "@/lib/content/getFaculty";

export async function facultyMetadata(view: FacultyView): Promise<Metadata> {
  const { page } = await getFaculty(view);
  return { title: page.seoTitle ?? page.title };
}

export async function FacultyDirectory({ view }: { view: FacultyView }) {
  const [response, t] = await Promise.all([getFaculty(view), getTranslations("Faculty")]);
  return (
    <SecondaryTemplate
      path={facultyViewPath(view)}
      response={response}
      backFallback="/people"
      heroPlaceholder={false}
      railThreeUp
      siblingTitle="browseFacultyBy"
      utility={
        <ViewSwitcher
          label={t("switcher")}
          views={FACULTY_VIEWS.map((v) => ({
            label: t(`views.${v.key}`),
            href: facultyViewPath(v.key),
            current: v.key === view,
          }))}
        />
      }
    />
  );
}
