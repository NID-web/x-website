// /programmes/bdes/animation-film-design — the discipline board's demo (1440
// only). Copy is the board's, verbatim: the whole page in FIXTURE builds, and in
// LIVE only its Resources (getDiscipline.ts). It is a demo, never a template for
// the other 26 disciplines.
//
// Photos: the hero is the CMS's animation-bdes-hero-1 and Ajay Kumar Tiwari's
// portrait the CMS's (both the board's own files, pixel-identical); Kaushik
// Chakraborty's and Dhiman Sengupta's are the CMS portraits of the same people
// (the board's were not in the download). The lab, the feature and four thumbs
// are the board's — the CMS lab image is a different photograph. Ghalib's
// Friends uses the hero photo, as the board does.
//
// TODO(review): content — the board spells the same person "Upamanyu
// Bhattacharya" (the Wade thumb) and "Bhattacharyya" (the feature's text); both
// kept verbatim.
// TODO(review): The Silent Echo's image was not in the board download; it draws
// the thumb placeholder until the file is supplied.
import type { StudentWorkCard } from "@/lib/content/editorial";
import type { DisciplineSource } from "@/lib/content/getDiscipline";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

const DIR = "/programmes/bdes/animation-film-design";

function work(id: string, title: string, student: string, file?: [string, string, number, number]): StudentWorkCard {
  return {
    id: `demo-work-${id}`,
    title,
    student,
    ...(file ? { image: mediaAsset(`${DIR}/${file[0]}`, file[1], file[2], file[3]) } : {}),
    work: true,
  };
}

export const DEMO_RESOURCES: NonNullable<DisciplineSource["resources"]> = {
  subtitle: "The Animation Film Lab",
  body: "The Animation Film Design Lab at NID Ahmedabad is a vibrant hub where students, faculty, and industry professionals create animation films, graphic novels, and illustrated books. Equipped with Wacom Cintiqs and HP workstations, it supports 3D, hand-drawn, experimental, and stop-motion animation, backed by two full-time staff.",
  image: mediaAsset(`${DIR}/lab-workstations.png`, "Students at computer workstations in the Animation Film Design Lab.", 1264, 620),
};

export const DEMO_DISCIPLINE: DisciplineSource = {
  slug: "animation-film-design-bdes",
  title: "Animation Film Design",
  faculty: "Communication Design",
  seats: 19,
  campuses: [PAGE_ID.campusAhmedabad],
  hero: [
    mediaAsset(`${DIR}/hero-clay-puppet-set.jpg`, "Stop-motion clay puppets of three characters on a miniature set with wooden doors.", 1200, 628),
  ],
  overview:
    "The Animation Film Design program at NID nurtures students' visual storytelling through moving images, blending traditional art with digital techniques. Graduates often work in production houses or start their own studios, enhancing the Indian Animation Industry.",
  people: [
    {
      id: "demo-kaushik-chakraborty",
      name: "Kaushik Chakraborty",
      slug: "kaushik-chakraborty",
      role: "faculty",
      designation: "faculty",
      photo: mediaAsset(`${DIR}/kaushik-chakraborty.jpg`, "Kaushik Chakraborty", 288, 288),
      email: "kaushikc@nid.edu",
    },
    {
      id: "demo-ajay-kumar-tiwari",
      name: "Ajay Kumar Tiwari",
      slug: "ajay-kumar-tiwari",
      role: "faculty",
      designation: "discipline lead",
      photo: mediaAsset(`${DIR}/ajay-kumar-tiwari.jpg`, "Ajay Kumar Tiwari", 288, 288),
      email: "ajay_t@nid.edu",
    },
    {
      id: "demo-dhiman-sengupta",
      name: "Dhiman Sengupta",
      slug: "dhiman-sengupta",
      role: "faculty",
      designation: "faculty",
      photo: mediaAsset(`${DIR}/dhiman-sengupta.jpg`, "Dhiman Sengupta", 288, 288),
      email: "dhiman_s@nid.edu",
    },
  ],
  resources: DEMO_RESOURCES,
  studentWork: {
    prose:
      "Animation Film Design graduates thrive in production houses, TV channels, independent studios, digital gaming, UI/UX, and e-learning. Many NID Animation alumni run successful studios and contribute significantly to the Indian Animation Industry.",
    works: [
      {
        ...work("i-hope-youre-well", "I hope you're well", "Imaan Jahan", [
          "work-i-hope-youre-well.png",
          "A still from an animated short: a girl in a pink top drawing at a desk in a vaulted pink room.",
          1280,
          720,
        ]),
        description:
          "An animated short film based on the poem 'I hope you are well' by R. Queen. Done as a part of Design Project-I (Semester-4) at the National Institute of Design, Ahmedabad.  Guided by Dhiman Sengupta and Upamanyu Bhattacharyya. Made on Procreate and Adobe Premiere Pro",
      },
      work("selected", "Selected", "Parth Mahanta", ["work-selected.jpg", "A still from an animated film: two men in a room with a hanging lamp.", 480, 327]),
      work("wade", "Wade", "Upamanyu Bhattacharya", ["work-wade.jpg", "A still from an animated film: people wading through a flooded street.", 400, 299]),
      work("ghalibs-friends", "Ghalib's Friends", "Ankit Sengupta", [
        "hero-clay-puppet-set.jpg",
        "Stop-motion clay puppets on a miniature stage set.",
        1200,
        628,
      ]),
      work("the-silent-echo", "The Silent Echo", "Prathmesh Bhat"),
      work("tides-of-memory", "Tides of Memory", "Mrinal Ghai", [
        "work-tides-of-memory.jpg",
        "A still from an animated film: silhouetted trees against a red sun over hills.",
        480,
        270,
      ]),
      work("whispers-of-the-forgotten", "Whispers of the Forgotten", "Srimoyi Senhanumanta", [
        "work-whispers-of-the-forgotten.png",
        "A black-and-white illustration of a dense crowd of people.",
        465,
        349,
      ]),
    ],
  },
};
