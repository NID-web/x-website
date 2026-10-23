// /programmes/resources and its labs (STAGE-0-NOTES §104). The labs are the
// CMS's `lab_and_facilities` documents; this file is their fixture, a copy of
// each document as sent (23 Oct 2026: the same words as nid.edu's lab pages),
// so FIXTURE and LIVE render the same 18 pages. The landing has no CMS document:
// its standfirst is nid.edu's, held here (RS3).
import type { LabelValue, PageResponse, Section } from "@/lib/content-model";
import { joinBlocks, richParagraphs } from "@/lib/content/format";
import { PAGE_ID, labPageId } from "@/lib/content/pages";
import { programmeDerived } from "@/lib/content/fixtures/programme-parts";
import { RESOURCES_PATH, labPath, type LabGroup } from "@/lib/content/resources";
import { mediaAsset } from "@/lib/media";

/** A lab as the CMS document holds it. `blocks` are its About section's TEXT
 *  blocks, verbatim (HTML); `people` the key-info rows `namedContacts:
 *  "nameRow"` makes from its contacts' `personName`s; `hero` the copy's size
 *  (a JPEG of the CMS's card PNG, same pixels), absent where the hero is
 *  refused (REFUSED_LAB_HEROES). */
export interface LabSource {
  slug: string;
  id: string;
  title: string;
  hero?: [width: number, height: number];
  blocks: readonly string[];
  contacts: readonly LabelValue[];
  people: readonly LabelValue[];
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
}

/** A lab page: no standfirst (the CMS's heroText is an excerpt of block 1, cut
 *  at ~280 characters, §104), About every TEXT block whole, built with the
 *  adapter's own rules so a CMS document renders identically (§103). The band
 *  and the Faculty row come from the list and the group (getResources.ts). */
export function labPage(lab: LabSource): PageResponse {
  const id = labPageId(lab.slug);
  const body = joinBlocks(lab.blocks.map((html) => richParagraphs(html).text)).body;
  const about: Section = {
    id: "section-lab-about",
    page: id,
    order: 1,
    type: "text",
    title: "About",
    ...(body ? { body } : {}),
    items: [],
    links: [],
    contacts: [],
  };
  return {
    page: {
      id,
      title: lab.title,
      slug: lab.slug,
      parent: PAGE_ID.programmesResources,
      template: "secondary",
      utility: "back",
      keyInfo: [...lab.people],
      hero: lab.hero ? [mediaAsset(`/programmes/resources/${lab.slug}.jpg`, lab.title, ...lab.hero)] : [],
      sections: [about],
      contacts: [...lab.contacts],
      ...(lab.seoTitle ? { seoTitle: lab.seoTitle } : {}),
      ...(lab.seoDescription ? { seoDescription: lab.seoDescription } : {}),
      publishedAt: lab.publishedAt ?? null,
    },
    derived: {
      menuTree: [],
      breadcrumb: [
        { id: PAGE_ID.programmes, title: "Programmes", path: "/programmes" },
        { id: PAGE_ID.programmesResources, title: "Resources", path: RESOURCES_PATH },
        { id, title: lab.title, path: labPath(lab.slug) },
      ],
      backNav: { label: "Resources", href: RESOURCES_PATH },
      subPageLinks: [],
      siblingBand: [],
    },
  };
}

/** The landing: nid.edu's intro, then one links section per group, in its
 *  order, each lab a row to its page labelled with its title. */
export function resourcesLanding(groups: ReadonlyArray<{ group: LabGroup; labs: ReadonlyArray<{ slug: string; title: string }> }>): PageResponse {
  const sections: Section[] = groups
    .filter(({ labs }) => labs.length > 0)
    .map(({ group, labs }, i) => ({
      id: `section-resources-${group.id}`,
      page: PAGE_ID.programmesResources,
      order: i + 1,
      type: "links",
      title: group.title,
      items: labs.map((lab) => ({
        id: `link-lab-${lab.slug}`,
        label: lab.title,
        targetType: "page" as const,
        page: labPageId(lab.slug),
      })),
      links: [],
      contacts: [],
    }));
  return {
    page: {
      id: PAGE_ID.programmesResources,
      title: "Resources",
      slug: "resources",
      parent: PAGE_ID.programmes,
      template: "secondary",
      utility: "back",
      keyInfo: [],
      hero: [],
      // TODO(review): nid.edu, not in the CMS (backend ask RS3: a `resources`
      // document). nid.edu's intro, verbatim, its names as it writes them.
      intro:
        "Academic resources such as Animation Film Design Lab, Exhibition Design Studio and Lab, Film and Video Communication Design Labs, Design Vision Centre, Ceramic Glass Design Labs, Toy and Game Design Studio, Clay Studio, Cintiq Lab & Studio, Skill Development Lab, Physical Computing Lab, AV-Lab, Apparel Design Workshop, Textile Design Weaving Labs, Lifestyle Accessory Design Workshop and Studio, IT Centre, Photography Lab and Dyeing and Printing Studio and Lab in all three NID campuses facilitate students towards achieving academic potential.",
      sections,
      contacts: [],
      seoTitle: "Resources | National Institute of Design",
      // No document, so no publish date.
      publishedAt: null,
    },
    derived: programmeDerived(PAGE_ID.programmesResources, "Resources"),
  };
}

/** The 18 labs, from the CMS's documents (generated from them, not retyped),
 *  in nid.edu's order. */
export const FIXTURE_LABS: readonly LabSource[] = [
  {
    slug: "animation-film-design-lab",
    id: "875",
    title: "Animation Film Design Lab",
    hero: [584, 438],
    blocks: [
      "The Animation Film Design Lab at NID, Ahmedabad is one of the most active places where students learn in state-of-the-art classrooms and studios. This place is a hub where knowledge and creative ideas are nurtured and shared between the students, faculty members, and industry professionals. In the Animation Film Design lab, the future storytellers and animation filmmakers breathe life in to their characters and give life to their craziest creative story ideas through tangible forms like animation films, graphic novels, illustrated books, etc.",
      "The lab is well equipped with a range of tools and technologies like Wacom Cintiq, HP workstations, A3 scanners, hi-resolution digital cameras, big-scale display systems, hi-quality sound systems, Dragon Stop Motion, TV paint, Toon Boom Pencil Check Pro and other dedicated software suitable to produce student animation films. Animation Lab allows students to do production and post-production work for their digital animation films including character modeling, texturing, animating, rendering, lighting and compositing for 3D animation production. In addition, the students also learn classical hand-drawn animation techniques as well. Light-box, peg punching facilities are available in the lab. Also, the experimental animation and stop motion animation courses are offered in their curriculum. The required supports for these projects are also provided from the lab. Currently, the Animation Lab is supported by two full-time staff members.",
    ],
    contacts: [{ label: "Lab contact", value: "kaushikc@nid.edu" }, { label: "Lab contact", value: "+91 79 26629645" }],
    people: [{ label: "Lab contact", value: "Mr. Kaushik Chakraborty" }],
    seoTitle: "Animation Film Design Lab | National Institute of Design",
    seoDescription: "The Animation Film Design Lab at NID, Ahmedabad is one of the most active places where students learn in state-of-the-art classrooms and studios.",
    publishedAt: "2026-09-21T03:25:32.552Z",
  },
  {
    slug: "exhibition-design-studio-and-lab",
    id: "877",
    title: "Exhibition design Studio and Lab",
    hero: [546, 410],
    blocks: [
      "Exhibition design is the culmination of various disciplines that transcend and overlap. The ‘Exhib Studio’ provides a base for this process. A shared space with private areas of work, supported with an experimental laboratory providing essential requirements for co-working and co-creating. The course structure caters to the present-day situations of approaching design in a holistic manner and focuses on creating functional spaces and experiences around the participant’s lives generating noteworthy responses by intriguing them.",
      "Considering the environment in which one works impacts their emotional state. The students develop a sense of belonging with the space. Parallel to the essentials of the curriculum the studio functions through three essential layers: Adjacent, Subsequent and Superficial. The adjacent layer is space in which one constructs the consequent two. The sensory recognition of this immediate layer can determine as to how one perceives the subsequent layer which is physical and open to interpretation but can be explained and comprehended by another individual. The third layer could be more of a superficial composition which is an after effect of adjacent and is on the psychological side. The premises create a greater impact on the students on primary level when in comparison to the entire psychological experience. As a result, this ‘Exhib Lab’ functions as a ‘Think Bank’. They include spaces for the VF and TA alongside providing the ability to conduct explorations with new media and interactive technology. The transition of ideas from the creator’s perspective to thought process to implementation through a rigorous graph of finding the median between theory and state of the art technology is encompassed in the space. The lab is well equipped with projectors as well as 65\" mobile TV screens for conducting presentations and flexible for student use.",
    ],
    contacts: [{ label: "Lab contact", value: "dipakpatel@nid.edu" }, { label: "Lab contact", value: "+91 79 26629704" }],
    people: [{ label: "Lab contact", value: "Mr. Dipak Patel" }],
    seoTitle: "Exhibition design Studio and Lab | National Institute of Design",
    seoDescription: "Exhibition design is the culmination of various disciplines that transcend and overlap. The ‘Exhib Studio’ provides a base for this process. A shared",
    publishedAt: "2026-09-21T03:25:42.557Z",
  },
  {
    slug: "film-and-video-communication-fvc-labs",
    id: "878",
    title: "Film and Video Communication (FVC) Labs",
    hero: [584, 438],
    blocks: [
      "The Film and Video Communication (FVC) department has one shooting studio, two editing studios and one sound studio.",
      "The shooting studio is a space for students to work with chroma key effects. The studio also provides students with modern cameras, lights and grip for shooting their design projects. Each student is individually issued equipment as per the requirement of their project.",
      "Both the editing studios are equipped with modern editing machines which are basically high-end computers with respective software for editing. They are allotted to individual students on shift basis to edit their respective projects.",
      "The sound studio is a professional space for recording, mixing and mastering sound. They are also issued to students based on the requirement of their projects.",
    ],
    contacts: [{ label: "Lab contact", value: "rahulpatel@nid.edu" }, { label: "Lab contact", value: "+91 79 26629707" }],
    people: [{ label: "Lab contact", value: "Mr. Rahul Patel" }],
    seoTitle: "Film and Video Communication (FVC) Labs | National Institute of Design",
    seoDescription: "The Film and Video Communication (FVC) department has one shooting studio, two editing studios and one sound studio.",
    publishedAt: "2026-09-21T03:25:48.591Z",
  },
  {
    slug: "design-vision-centre",
    id: "872",
    title: "Design Vision Centre",
    hero: [546, 410],
    blocks: [
      "Design Vision Centre at the National Institute of Design is the third cutting edge facility of the Golden triangle of NID's upgraded education research and consultancy service infrastructure. Design Vision Centre (DVC) is a backbone of design support facilities, apart from the studios and labs dedicated to different design disciplines.",
      "Design Vision Centre at Paldi Campus consisting DVC Board room, CAID Lab, Rapid Product Development Lab and High Performance Visualization Lab and Railway Design Centre. Students and faculties from various disciplines use the facilities of all these labs since last eleven years as common facility. Students use the RPD Lab for Laser Cut and 3 D Printing. The CAID Lab which allow students to work on their Visualization Course Module. The Students from PD, FID, Ceramic and Exhibition Design are using facility for rendering their and visualizing their concept to realization.",
      "National Institute of Design Ahmadabad and Ministry of Railways (Railway Board), New Delhi entered MoU on 10 th April 2015. It aims at collaboration between NID and Railway Board in all fields of Design relevant to rail transport and allied activities, with a view to design, research and develop, innovative design ideas and the best design ideas and reinforce the best design practice in transportation design for the Indian Railways with participation of young designers, design service providers, design researchers and design professionals and practitioners under Railway Design Centre at NID the benefit of the Indian Railway utility services across the country.",
    ],
    contacts: [{ label: "Lab contact", value: "soni@nid.edu" }, { label: "Lab contact", value: "+91 79 26629734" }],
    people: [{ label: "Lab contact", value: "Mr. Paresh Soni" }],
    seoTitle: "Design Vision Centre | National Institute of Design",
    seoDescription: "Design Vision Centre at the National Institute of Design is the third cutting edge facility of the Golden triangle of NID's upgraded education",
    publishedAt: "2026-09-21T03:25:16.771Z",
  },
  {
    slug: "ceramic-and-glass-design-labs",
    id: "876",
    title: "Ceramic and Glass Design Labs",
    hero: [584, 438],
    blocks: [
      "Ceramic and Glass Design labs are an integral part of ceramic and glass design discipline at NID, this falls under the faculty of Industrial Design. These labs at NID have bothadvanced and indigenous technologies available. It facilitates students to experiment and explore a variety of techniques, methods and materials.",
      "The objective of these labs is to provide a dynamic learning environment to think and makeusing specific materials. It provides a stimulating ambience to pursue an individual’s creativity under the realm of art, craft and design, enabled by the technology of the materials. Within the pedagogical framework of NID, “learning by doing” the ceramic and glass labs become an indispensable space for learning and growing.",
      "The infrastructure facilitates the student to start their journey from basics, and build upon it to a higher level of understanding, investigation and application of these materials. The students of the discipline are sensitised and oriented towards the traditional methods, techniques and communities practising with these materials through demonstrations and interactions; while they are as well encouraged to push the traditional boundaries of these materials; experiment and explore beyond the conventional norms, contextualise to the current context and probe future possibilities.",
      "The Ceramic and Glass Labs in-house tools and equipment support explorations and production possibilities ranging from traditional to industrial. Equipment list, including potter’s wheels, plaster wheels, glass furnace enables students to learn the varied techniques of making in the material.",
      "The ceramic material lab has the whole gamut of raw materials to explore, experiment and develop a wide range of clay bodies, including earthenware, stoneware, bone china, porcelain, raku etc., colours, stains, engobes, glazes etc., The labs are also well equipped with ball mill, filter press, pug mill to produce clay bodies and glazes, pottery wheels and Slab rolling machine for building and collection of electric kilns and gas kilns, for firing ceramics at various temperatures ranging from 800°C to 1200°C.",
      "Glass processes such as cold, warm and hot can be very well carried out with the given set of equipment, including, flatbed kiln, lamp work torches, Glass blowing furnaces, glory hole furnace, annealing chamber, cutting, grinding and polishing machines etc.,",
      "The labs are managed by technical and skilled professionals, who can demonstrate the traditional art and craft of pottery and glassmaking. They also work efficiently with modern technology. They support and facilitate students in their ongoing projects, encourage them to develop models and prototypes.",
    ],
    contacts: [{ label: "Lab contact", value: "hneelima@nid.edu" }, { label: "Lab contact", value: "+91 79 26629656" }],
    people: [{ label: "Lab contact", value: "Ms. Neelima Hasija" }],
    seoTitle: "Ceramic and Glass Design Labs | National Institute of Design",
    seoDescription: "Ceramic and Glass Design labs are an integral part of ceramic and glass design discipline at NID, this falls under the faculty of Industrial Design.",
    publishedAt: "2026-09-21T03:25:37.958Z",
  },
  {
    slug: "user-centered-design-lab",
    id: "879",
    title: "User Centered Design Lab",
    hero: [974, 731],
    blocks: [
      "User Centered Design Lab (UCDL) is a space for someone or something that doesn't fit within traditional academic disciplines. It’s a field of study whichhas its own frameworks, and methods.",
      "Play is extremely important for creative learning. Pressure and rewards can often diminish play and tinkering, and thus, squash creative thinking. It’s also important to have fun while tinkering and the aim at the UCDL is to create a space and atmosphere where people are encouraged to think and try unconventional methods.",
      "Approaching real world wicked problems from a specialized discipline perspective ends up causing more damage. These problems require everyone to work coherently involving many disciplines, perspectives. It’s imperative for all the disciplines to collectively look at the bigger picture and vision. Theaim is to build mock-up models, simulate scenarios, co-create along with people and deploy contextual interventions.",
      "At UCDL, the aim is to explore design and creativity by thinking outside the box and use the various open source platformsand share with the world, so that they can tweak, remix and add. The iterative cycle of exploring, re-learning and re-making in a collective manner forms the core. Come and co-create with us.",
    ],
    contacts: [{ label: "Lab contact", value: "sahil_t@nid.edu" }, { label: "Lab contact", value: "+91 79 26629640" }],
    people: [{ label: "Lab contact", value: "Mr. Sahil Thappa" }],
    seoTitle: "User Centered Design Lab | National Institute of Design",
    seoDescription: "User Centered Design Lab (UCDL) is a space for someone or something that doesn't fit within traditional academic disciplines. It’s a field of study",
    publishedAt: "2026-09-21T03:25:53.642Z",
  },
  {
    slug: "toy-and-game-design-studio",
    id: "882",
    title: "Toy and Game Design Studio",
    hero: [546, 410],
    blocks: [
      "Toy & Game Design Discipline has a well-equipped studio will digital presentation facility. Walls are mounted with display panels and working desk is available for every student. The studio also has a small lab facility for prototyping and testing, equipped with all kinds of material manipulation machine such as jigsaw, drill, sander and many more, material library, 3D printer, gaming console, Oculus Go(64 GB), iPad, tablet for game testing, Wacom tablet etc.",
    ],
    contacts: [{ label: "Lab contact", value: "harry@nid.edu" }, { label: "Lab contact", value: "+91 79 23265730" }],
    people: [{ label: "Lab contact", value: "Mr. Haresh Galsar" }],
    seoTitle: "Toy and Game Design Studio | National Institute of Design",
    seoDescription: "Toy & Game Design Discipline has a well-equipped studio will digital presentation facility. Walls are mounted with display panels and working desk is",
    publishedAt: "2026-09-21T03:26:08.377Z",
  },
  {
    slug: "clay-studio-cintiq-lab-studio",
    id: "883",
    title: "Clay Studio, Cintiq Lab & Studio",
    hero: [546, 410],
    blocks: [
      "The studio provides a creative cutting edge design development/support facilities with traditional and advanced labs and workshops to help the students take their ideas far.",
      "- A dedicated digital design lab equipped with latest hardware/software for concept ideations, presentation renderings, 3D modeling and visualization.",
      "- Design studio for nurturing creativity and honing core skills.",
      "- A full fledged automotive clay-modeling studio.",
      "- Rapid Product Development Lab equipped with 3D Printers, Milling and Laser cutting machines.",
      "- Fully equipped wood and metal workshops and paint spray facilities.",
    ],
    contacts: [{ label: "Lab contact", value: "suresh_m@nid.edu" }, { label: "Lab contact", value: "+91 79 23265771" }],
    people: [{ label: "Lab contact", value: "Mr. Suresh Mistri" }],
    seoTitle: "Clay Studio, Cintiq Lab & Studio | National Institute of Design",
    seoDescription: "The studio provides a creative cutting edge design development/support facilities with traditional and advanced labs and workshops to help the",
    publishedAt: "2026-09-21T03:26:15.221Z",
  },
  {
    slug: "skill-development-lab-nid-bangalore",
    id: "886",
    title: "Skill Development Lab, NID- Bangalore",
    hero: [1600, 1200],
    blocks: [
      "The Skill Development Lab emphasizes on different types of model making, which enables the students to experiment with various material, lighting, structure, prototype, mock-up model by using different kinds of tools and equipment. This helps the design students to understand the real time situation while learning to design. The lab also deals with a lot of professional project prototype making, where students get exposed to different types of product finishing, packaging etc.",
    ],
    contacts: [{ label: "Skill Development Lab, NI", value: "skilllabs@nid.edu" }, { label: "Skill Development Lab, NI", value: "+91 80 29723276 ext. 125" }],
    people: [],
    seoTitle: "Skill Development Lab, NID- Bangalore | National Institute of Design",
    seoDescription: "The Skill Development Lab emphasizes on different types of model making, which enables the students to experiment with various material, lighting,",
    publishedAt: "2026-09-21T03:26:36.626Z",
  },
  {
    slug: "physical-computing-lab",
    id: "884",
    title: "Physical Computing Lab",
    blocks: [
      "Physical Computing LAB is dedicated to investigating the field of interactive media technologies and computational materials in Art, Science, Design and technology based practice and research.This space is a mix of hands-on approach and creative thinking, where students from different disciplines are working together on their projects and playing with different materials to design and build their digital and physical interactive prototypes.This lab lab provides digital fabrication and space to experiment with materials, media, and technology.",
      "Application of Physical computing lab is dedicated to facilitate Design, Innovation and Research in Healthcare, Immersive Experience, and inclusive design.",
    ],
    contacts: [{ label: "Lab contact", value: "anoop_s@nid.edu" }, { label: "Lab contact", value: "+91 80 29723276 ext. 156" }],
    people: [{ label: "Lab contact", value: "Mr. Anoop Saxena" }],
    seoTitle: "Physical Computing Lab | National Institute of Design",
    seoDescription: "Physical Computing LAB is dedicated to investigating the field of interactive media technologies and computational materials in Art, Science, Design",
    publishedAt: "2026-09-21T03:26:22.096Z",
  },
  {
    slug: "av-lab-nid-bengaluru",
    id: "889",
    title: "AV Lab-NID Bengaluru",
    blocks: [
      "Objective",
      "The objective of setting up the Audio-Visual Lab at Bengaluru Campus is to facilitate the IT Integrated Design education and give adequate support to research activities with multimedia tools and techniques. Examples of services include: digital audio recording, digital video editing, digital photography, multimedia production and creative graphics. As multimedia becoming a powerful tool for communication, this lab will provide substantial support to combine text, video, sound and pictures into a single, concise form used to convey messages effectively.",
      "<strong>AV-Lab Utilization</strong>",
      "The main focus of Audio-Visual and Electronic Resources of NID Bengaluru Campus, Bangalore is to facilitate educational programs and research activities by offering equipment, media and services. The primary function is to support all aspects of classroom instruction and related activities. The secondary function is to support the program and activities of R&D Campus, projects and events.",
    ],
    contacts: [{ label: "Lab contact", value: "willi@nid.edu" }, { label: "Lab contact", value: "+91 80 29723276 ext. 106" }],
    people: [{ label: "Lab contact", value: "Mr. J. Antony William" }],
    seoTitle: "AV Lab-NID Bengaluru | National Institute of Design",
    seoDescription: "Objective",
    publishedAt: "2026-09-21T03:26:52.533Z",
  },
  {
    slug: "apparel-design-workshop",
    id: "873",
    title: "Apparel Design Workshop",
    hero: [584, 438],
    blocks: [
      "The workshop has large studio space equipped with adjustable body forms, mannequins and workshop for prototyping of woven & non- woven garments & accessories. Optitex software for pattern making & pattern visualization, computerized embroidery machine for surface development and Wacom tablet are some of the digital equipments the workshop houses.",
    ],
    contacts: [{ label: "Lab contact", value: "bafjhaj@nid.edu" }, { label: "Lab contact", value: "+91 79 23265726" }],
    people: [{ label: "Lab contact", value: "Mr. Nasir Hussain Saiyed" }],
    seoTitle: "Apparel Design Workshop | National Institute of Design",
    seoDescription: "The workshop has large studio space equipped with adjustable body forms, mannequins and workshop for prototyping of woven & non- woven garments &",
    publishedAt: "2026-09-21T03:25:21.784Z",
  },
  {
    slug: "textile-design-weaving-labs",
    id: "880",
    title: "Textile Design Weaving Labs",
    hero: [584, 438],
    blocks: [
      "Weaving labs is an integral part of textile design discipline which falls under the Textile, Apparel & Lifestyle Accessory Design Faculty at NID. The Lab at NID has both the most advanced and indigenous technologies available. It facilitates students to experiment and explore vivid techniques, methods and materials.",
      "The objective of this lab is to provide students with technical and practical knowledge about the fundamentals of weaving as well as advanced weaving techniques and structures. These rigorous modules follow the ‘learning by doing’ model. The weaving lab becomes an indispensable resource to disseminate this exhaustive knowledge of weaving, through handling of the material, and preparatory process for weaving.",
      "The weaving labs at NID aims to widen the creative horizons of the students and sensitise them towards the concerns of the traditional handloom industry, sustainable practices, environmental issues, and users with an in depth understanding of traditional as well as modern production methods. It involves an understanding of the traditional culture, value and as well as advancement in modern technologies with commercial viability of design.",
      "The weaving lab has more than fifty handlooms which include AVM loom, ARM loom, table loom, dobby loom, jacquard loom and leno loom. Weaving lab has traditional as well as the most advanced loom which enables sampling and production much easier and faster.",
      "Weaving lab has a rich yarn library which includes a wide range of natural and manmade yarn. Students are allowed to set their customize loom depending upon their concept, design, material and colour.",
      "The labs are managed by skilled traditional hand loom weavers who help the student to learn the skills, technique, handling of the material and weaving etc. They also encourage students to make prototypes on an actual scale and develop them to be used physically.",
    ],
    contacts: [{ label: "Lab contact", value: "aalokjoshi@nid.edu" }, { label: "Lab contact", value: "+91 79 26629686" }],
    people: [{ label: "Lab contact", value: "Mr. Aalok Joshi" }],
    seoTitle: "Textile Design Weaving Labs | National Institute of Design",
    seoDescription: "Weaving labs is an integral part of textile design discipline which falls under the Textile, Apparel & Lifestyle Accessory Design Faculty at NID. The",
    publishedAt: "2026-09-21T03:25:58.377Z",
  },
  {
    slug: "lifestyle-accessory-design-workshop-studio",
    id: "881",
    title: "Lifestyle Accessory Design Workshop & Studio",
    hero: [546, 410],
    blocks: [
      "The Lifestyle Accessory Design department is dedicated to encouraging students to explore design through research and practices in contemporary context. The department is facilitated with a well-lit design studio/multipurpose classroom with flexible studio times, to give freedom to our students to nurture their creativity and honing their core skills. The barrier-free studios, flexible seating arrangements are also to encourage mutual learning within the department and inter-disciplinary areas at NID. Students are encouraged to use the visualization lab with the latest software and computer facilities.",
      "The department is equipped with cutting edge design development/support facilities with traditional and advanced labs and workshops for education, research, and consultancy services. The students are encouraged to use tools ranging from traditional to power hand tools to explore with all different kinds of conventional and unconventional material. The workshop has facilities to work with all kinds of materials such as metal, stone, bamboo, leather, fabric, wood, etc. A dedicated “Leather Design Lab” and “Fine Metalsmithing lab” equipped with the latest type of machinery for concept ideations, and prototyping. The highly trained dedicated technical staff are always ready to share their rich experience and knowledge with our students with utmost care.",
    ],
    contacts: [{ label: "Lab contact", value: "raje_shree@nid.edu" }, { label: "Lab contact", value: "+91 79 23265 724" }],
    people: [{ label: "Lab contact", value: "Ms. Rajeshree Chauhan" }],
    seoTitle: "Lifestyle Accessory Design Workshop & Studio | National Institute of Design",
    seoDescription: "The Lifestyle Accessory Design department is dedicated to encouraging students to explore design through research and practices in contemporary",
    publishedAt: "2026-09-21T03:26:03.087Z",
  },
  {
    slug: "information-technology-it-centre",
    id: "874",
    title: "Information Technology (IT) Centre",
    blocks: [
      "Technology allows personalising learning, building capacity of teachers and driving decisions based on real-time data through effectively integrating technology in the design education system.",
      "The main objective of the IT Centre at NID is to improve quality of education, research, teaching and learning by providing technology-enabled learning solutions. A virtual network has been created by interconnecting the three campuses of NID-Ahmedabad, Gandhinagar and Bengaluru. The campuses are connected with National Knowledge Network, a state-of-the-art multi-gigabit pan-India network, withapproximately3500 Giga speed computer network spread over the campuses.",
      "The IT Centre translates institute’s IT needs into system solutions, making maximum use of available IT tools and ensuring longer term supportability of the IT architecture. The IT Centre facilitates its workstations with high-end design software amongst other facilities like printing, scanning etc.",
    ],
    contacts: [{ label: "Lab contact", value: "itcentre@nid.edu" }, { label: "Lab contact", value: "+91 79 26629757" }],
    people: [{ label: "Lab contact", value: "Mr. Navin Parikh" }],
    seoTitle: "Information Technology (IT) Centre | National Institute of Design",
    seoDescription: "Technology allows personalising learning, building capacity of teachers and driving decisions based on real-time data through effectively integrating",
    publishedAt: "2026-09-21T03:25:26.982Z",
  },
  {
    slug: "skill-development-lab-ahmedabad",
    id: "885",
    title: "Skill Development Lab (Ahmedabad)",
    hero: [584, 438],
    blocks: [
      "The Skill development labs includes four important studios mainly Metal and Plastic Studio(MPS), Wood Studio (WS), Paint Studio (PS) and Student Model Making Studio (SMMS).",
      "<strong>Metal and Plastic studio(MPS)</strong>",
      "Metal objects, including some types of sheet metals, types of pipe-based furniture and prototypes of industrial products or household articles of every description are made here. Sheet metal of different gauges can be cut, processed and shaped, moulded and joined, to create the desired forms. The studio is equipped with all basic engineering machines- tools that are essential for train designers. The studios are manned by experienced technical staff, who guide students and participate in the product development process.",
      "<strong>Wood Studio (WS)</strong>",
      "Equipped with modern furniture -making facilities in wood, it can undertake prototype making and limited quantity batch production. A wide range of items can be made here, including furniture, partitions, doors, windows, boxes, wooden models and moulding and other such related objects to carpentry. All aspects of wood work- cutting, planning, joinery etc. are taught to students to enable them to make their own prototypes under supervision. Prototypes are also made for NID’s Clients by studio staff.",
      "<strong>Paint Studio(PS)</strong>",
      "NID has a fully equipped paint studio for spray- painting facilities, to provide the finishing for models.",
      "<strong>Student’s Model Making Studio</strong>",
      "All design students are required to learn the use of simple hand tools and basic materials such as wood, metal and plastics. The studio is equipped with all the requisite hand tools necessary to create models. All design ideas are first realised in the form of a model, which simulates the final production in the form of materials and finishes. Such models are made by the students in this studio, with expert guidance of faculty and staff, prior to making a prototype of a product.",
    ],
    contacts: [{ label: "Lab contact", value: "dasadia@nid.edu" }, { label: "Lab contact", value: "+91 79 26629726" }],
    people: [{ label: "Lab contact", value: "Mr. Kanjibhai H Dasadia" }],
    seoTitle: "Skill Development Lab (Ahmedabad) | National Institute of Design",
    seoDescription: "The Skill development labs includes four important studios mainly Metal and Plastic Studio(MPS), Wood Studio (WS), Paint Studio (PS) and Student",
    publishedAt: "2026-09-21T03:26:30.291Z",
  },
  {
    slug: "photography-lab-ahmedabad",
    id: "887",
    title: "Photography lab (Ahmedabad)",
    hero: [584, 438],
    blocks: [
      "The photography lab is one of the oldest labs at NID. Besides providing academic support in terms of photography modules, photo documentation of the various projects to NID, the lab also caters to the need for visual documentation of activities at NID.",
      "The department has a classroom and a studio. The studio is very equipped with the latest generation lighting systems.",
      "The department also manages the NID history-related image archival data.",
    ],
    contacts: [{ label: "Lab contact", value: "vishal_a@nid.edu" }, { label: "Lab contact", value: "+91 79-26629708" }],
    people: [{ label: "Lab contact", value: "Mr. Vishal Arora" }],
    seoTitle: "Photography lab (Ahmedabad) | National Institute of Design",
    seoDescription: "The photography lab is one of the oldest labs at NID. Besides providing academic support in terms of photography modules, photo documentation of the",
    publishedAt: "2026-09-21T03:26:42.521Z",
  },
  {
    slug: "dyeing-and-printing-studio-and-lab",
    id: "888",
    title: "Dyeing and Printing Studio and Lab",
    hero: [546, 410],
    blocks: [
      "The dyeing and screen-printing studio is part of the textile design studios and labs. The studio acts as both explorative studio and experimental lab. The students work here and learn dyeing and printing with both synthetic and natural dyes. For the faculty, the studios act like a lab and miniature industry where the ideas could be experimented and explored. The studio also offers workshops on natural dyes, screen printing to different sectors.",
      "This lab is actively involved in studying and experimenting with natural dyes and their range of applications in different fields. The studio especially works on Indigo dye and its whole cycle from farm to society.",
      "The lab is equipped with tools, equipment and systems that help both students and faculty to work with different materials for different purposes such as colouring, and exploring dyeing techniques such as Shibori, Bandhani. It also takes up both research as well as professional projects on specific requests or as and when needed.",
    ],
    contacts: [{ label: "Coordinator", value: "sakthivel@nid.edu" }, { label: "Coordinator", value: "+91 79 26629742" }],
    people: [],
    seoTitle: "Dyeing and Printing Studio and Lab | National Institute of Design",
    seoDescription: "The dyeing and screen-printing studio is part of the textile design studios and labs. The studio acts as both explorative studio and experimental",
    publishedAt: "2026-09-21T03:26:47.847Z",
  },
];
