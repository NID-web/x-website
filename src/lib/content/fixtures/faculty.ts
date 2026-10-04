// /people/faculty — the faculty directory's FIXTURE (STAGE-0-NOTES §82): a copy
// of real CMS records, small enough to read, enough to exercise every view.
// Three disciplines on three campuses (their records' shortName, campus, design
// faculty and faculty members), the nine people they list, and Shilpa Das, who
// is in the CMS's faculty list but in no discipline: she exercises "Other
// faculty". LIVE reads the full set from the same two sources: the `faculty`
// document's list and the discipline records (getFaculty.ts).
//
// Names, role lines and portraits are the CMS's, copied (the portraits resized
// to 288px, the 144px circle at 2×). Nothing here is a hand-made mapping: every
// group comes from a discipline record's own fields.
import type { UUID } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

export interface FacultyPersonSource {
  slug: string;
  name: string;
  /** The CMS list item's heroText: the role line the card's overline shows. */
  role?: string;
  photo?: ReturnType<typeof mediaAsset>;
  /** The person record's `detail.bio` and `detail.email`, copied (§83). */
  bio?: string;
  email?: string;
  /** The record's "Responsibilities" section, one line per TEXT block, copied
   *  as sent; the page drops the line that is the role line (§83). */
  responsibilities?: string[];
}

export interface FacultyDisciplineSource {
  slug: string;
  name: string;
  campus: UUID;
  faculty: string;
  members: string[];
}

// Each person record's bio and email, copied as sent (the member pages, §83).
const RECORD: Record<string, { bio: string; email: string; responsibilities: string[] }> = {
  "ajay-kumar-tiwari": {
    email: "ajay_t@nid.edu",
    responsibilities: [
      "Discipline Lead, Animation Film Design",
      "Discipline Faculty, Animation Film Design",
    ],
    bio: "Ajay Kumar Tiwari earned a postgraduate degree in botany, specialising in Plant Pathology from Government College of Science, Raipur. He worked as an animation artist for three years in the areas of educational content development, animated television series production,industrial animation and web animation. He has also taught undergraduate students at the School of Life Sciences at MATS University, Raipur for a year, before he enrolled into the Animation Film Design discipline at NID in 2004.\n\nAjay joined NID as a faculty in 2008. He has been teaching various disciplines at the institute which include Animation Film Design, Film and Video Communication, New Media Design, Graphic Design, Design for Digital Experience, Toy and Game Design, and Foundation Studies. He has taught courses such as Screenwriting, Film Language, Experimental Animation, Sequential Narrative (Comic Book/Graphic Novel) Design, Elements of Moving Images, Media and Technology and Animation Production using Flash. In 2007 and 2009, Ajay headed the team that was instrumental in bringing and preselecting students’ films from animation schools around the world to Chitrakatha, the international students’ animation film festival held at NID.\n\nHis research interests include experimental animation as well as applied aspects of the medium of animation in the areas of education, medical, and social communication. He mentored IEEE students of Dhirubhai Ambani Institute of Information and Communication Technology (DA‐IICT) to conduct the Animation and Design track during Summer School 2011 at DA‐IICT, Gandhinagar. Ajay also conducted a workshop on Animated Storytelling at the Indian Institute\n\nof Information Technology, Allahabad in 2009.",
  },
  "amarnath-praful": {
    email: "amarnath_p@nid.edu",
    responsibilities: ["Discipline Faculty, Photography Design"],
    bio: "Amarnath Praful is a visual artist, writer and teacher who primarily works with photography. His artistic and research practice explores elements from performance, text, video, archive and found material. His work is often guided by the landscape, folk and oral traditions, modernities, cultural and political histories of Kerala, India. His pedagogical concerns on which he has been writing and teaching are in the area of contemporary photographic practices, representational politics, history of photography in the subcontinent, intermedia image practices and cinema studies. Currently he is a Faculty at the Photography Design master’s program at the National Institute of Design, Gandhinagar.",
  },
  "athul-dinesh": {
    email: "athul_d@nid.edu",
    responsibilities: [
      "Discipline Faculty, Interaction Design",
      "Additional Core Faculty Members for ITID",
    ],
    bio: "Athul Dinesh is an NID alumnus and completed his Master of Design (M.Des) in Universal Design in 2020, Master of Technology (M.Tech by Research) in Thermal Engineering from the National Institute of Technology Karnataka, Surathkal in 2016, and Bachelor of Technology (B.Tech) in Mechanical Engineering from Cochin University of Science and Technology in 2012.\n\nAthul began his professional journey as a Mechanical Engineering Intern at Yazaki Corporation in 2012 and worked as a Researcher at NITK, Surathkal, from 2014 to 2016. He also served as a Mechanical Engineering instructor at the TIME Institute in Cochin in 2016. After education at NID, he worked as a Design Intern with MIPL Global, Malleswaram, Bangalore and as a Designer with Stokr GmBH, Berlin, Germany Remote (2020 - 2021). In September 2021, he joined NID in the Universal Design Department as a Teaching Associate. Later, he joined as an Assistant Professor in the Product Design Department at RV University's School of Design and Innovation in Bengaluru in September 2023. He joined the Interaction Design department of NID on March 4, 2024.\n\nAthul is a Fellow of the Royal Society of Arts, Manufactures and Commerce, London, United Kingdom (FRSA). He won the Kokuyo Design Award in 2018 for 'Paletteballet,' a children's painting kit developed with Channapatna artisans. His 'Four Walls' project, an app and service design concept advocating accessible home design options, earned the Student Design Award from the Royal Society of Arts, UK, in 2021. His graduation project on 'Design for Play' was featured in the Artsthread Global graduate show sponsored by Gucci in 2021. Athul mentored students for the 'Pupil Design Awards 2021' and contributed to the test and learn group of the Design for Life (DfL) Awards by the Royal Society of Arts, UK. He exhibited his products in The Spiral, Tokyo (2019), Kokuyo International Centre, Kuala Lumpur (2019) and displayed handmade toy collections at Springfair 2022 in Birmingham, UK.\n\n​His areas of interest are the design of tangible interfaces, AI-aided services, the design for accessibility and the design for children.",
  },
  "dhiman-sengupta": {
    email: "dhiman_s@nid.edu",
    responsibilities: ["Discipline Faculty, Animation Film Design"],
    bio: "Dhiman Sengupta graduated from NID in 1999 in the stream of Animation Film Design. He has worked in Mumbai and Delhi, for a decade in the areas of e-learning, broadcast and motion graphics, and visual effects. Dhiman is a senior faculty member in the Animation Film Design department where he has taught for fifteen years and of which he was the Discipline Lead for nine years (2014-23).\n\nDhiman is a poet, musician, comic book and visual artist, a geometry and film enthusiast. Amongst the courses taught by him at NID are Storyboarding, Sequential & Graphic Narratives, Time & Image, Motion Graphics workshop, Sound Design, Music Appreciation and Geometric Construction for the Design Foundation & Apparel Design programmes.\n\nDhiman is a prolific pen and ink visual artist and had his first solo art exhibition at Alliance Francaise d’Ahmedabad in June, 2022 to considerable acclaim. He was an invited juror at the Toronto Animation Arts Festival International (TAAFI) in 2021 and at FirstCut, Pune in the Animation category in 2022. In 2019, he was invited on a faculty exchange to The Glasgow School of Art where he taught a fifteen day animation workshop to BA Illustration students. His key research area is about Geometric Patterns and its manifestations through History which he teaches through his lectures and workshops.",
  },
  "jagriti-p-galphade": {
    email: "jagriti@nid.edu",
    responsibilities: [
      "Discipline Lead, Interaction Design",
      "Discipline Faculty, Interaction Design",
    ],
    bio: "Jagriti P. Galphade is an Associate Senior Faculty at the National Institute of Design, Bengaluru, where she serves as the Lead Faculty for the Interaction Design Discipline. With a strong interdisciplinary background, she contributes significantly to academic leadership, curriculum development, and research initiatives at the institute.\n\nShe holds a postgraduate degree in Drawing and Painting and an Advanced Diploma in Computer Arts from the Centre for Development of Advanced Computing (CDAC), Pune. In the early phase of her professional career, she worked in the industry on developing user interfaces for e-learning products, which sparked her enduring interest in design education and research.\n\nAt NID, Jagriti has been actively involved in projects spanning visual design, UI/UX, branding and packaging, and logo design for a wide range of industries, State Government, and Government of India organizations. Her work reflects a strong integration of design thinking, cultural sensitivity, and technological innovation.\n\nHer areas of expertise include branding, visual design for digital media, Indian aesthetics, design for heritage, and service design. She is particularly interested in exploring how traditional knowledge systems and cultural practices can be meaningfully translated into contemporary digital and service experiences. She is currently pursuing her PhD in Interaction Design, with a research focus on digital inclusivity, Indian aesthetics, and culturally grounded design practices.\n\nIn addition to her academic and professional pursuits, Jagriti has extensive experience as a voiceover artist and performing artist. She has contributed voice work to numerous educational programmes and radio plays with Akashvani and has also been actively involved in theatre and performance, enriching her multidisciplinary approach to design and communication.",
  },
  "kaushik-chakraborty": {
    email: "kaushikc@nid.edu",
    responsibilities: [
      "Discipline Faculty, Animation Film Design",
      "Faculty, Design Foundation Studies",
    ],
    bio: "Kaushik Chakraborty enrolled into the Faculty Development Programme at NID and joined the institute in 2010 as a faculty in the Communication Design discipline. He has worked in the industry for five years. Kaushik holds postgraduate diplomas in Animation Creation and Direction from Indo-Italian Institute for Development Communication, Kolkata and Multimedia Development Technology from MTDRC at Kolkata’s Jadavpur University. He taught at NID for three years prior to joining the institute as faculty. He is part of the faculty group offering inputs in Freehand Drawing and Environmental Perception in the Foundation Programme.\n\nIn Animation Design, Kaushik teaches Drawing and Basics of Locomotion. He also conducted a workshop on Basics of Animation as part of the summer workshops held at the institute in 2011. Kaushik has worked as a visualiser and animator at Riddhi Management Services, Netguru and worked on projects such as Geographic Information System (GIS) for Gram Panchayat, series animation, web animation, and animation content for mobile phones. Kaushik’s hobbies include reading, photography, and learning foreign languages.",
  },
  "mamata-n-rao": {
    email: "mamatarao@nid.edu",
    responsibilities: [
      "Activity Chairperson, Knowledge Management Centre (KMC)",
      "Head, Faculty of IT Integrated Design",
      "Discipline Faculty, Interaction Design",
      "Mentor Publications",
    ],
    bio: "<strong>Mamata N. Rao</strong> is presently the Dean of National Institute of Design (NID) Bengaluru campus. She is the Principal faculty in IT Integrated Design stream and is the Discipline Lead for Master’s program in Interaction Design.\n\nShe holds master’s degrees in Design Science (Design Computing) from the University of Sydney, Australia; in Urban Design from School of Planning and Architecture, New Delhi and Bachelor’s in Architecture (B.Arch) from BVB College of Engg and Tech, Hubli.\n\nCurrently she is a member of the Governing Council and Senate of NID. She also carries the responsibility of being a Co-chair for Research and Development and has earlier served as a member of various academic and administrative committees at NID.\n\nHer areas of teaching and interest include: creative thinking, spatial perception in retail environments, user experience and interface design, space planning. She has worked as Principal Investigator on a Department of Science and Technology, Government of India funded project that looked at digital reconstructions of bazaar streets and two monuments within the royal enclosure at Hampi.\n\nShe has been involved in various consultancy projects at NID in the areas of User Interface Design for automotive company, curriculum development for a new design school, space planning and interior projects.\n\nShe has various publications to her credit including in journals and books in the areas of Design briefs, IT Integrated Design, Creative thinking and Digital heritage.",
  },
  "rishi-singhal": {
    email: "rishi_s@nid.edu",
    responsibilities: [
      "Discipline Lead, Photography Design",
      "Discipline Faculty, Photography Design",
    ],
    bio: "Rishi Singhal is the Discipline Lead of Photography Design discipline under the department of Communication Design. He has studied at the Centre for Environmental Planning & Technology (CEPT), Ahmedabad, Visual Studies Workshop (VSW), Rochester, NY, and the College of Visual & Performing Arts at Syracuse University, NY.",
  },
  "saurabh-srivastava": {
    email: "saurabh@nid.edu",
    responsibilities: [
      "Head, Information Technology",
      "Discipline Faculty, Photography Design",
    ],
    bio: "Saurabh Srivastava is a photographer and educator with focus on the documentary genre. He is a Photostory teller and mainly works on photo projects on social & ecological issues, communities, landscapes and cityscapes.\n\nAfter working for many years in the industry, Saurabh joined NID in 2007. He is Associate Senior Faculty and currently leading the Photography Design Discipline at NID, Gandhinagar and Heading Photography Lab at NID Ahmedabad",
  },
  "shilpa-das": {
    email: "shilpadas@nid.edu",
    responsibilities: ["Faculty of Interdisciplinary Design Studies (IDDS)"],
    bio: "Dr. Shilpa Das is Principal Faculty, Interdisciplinary Design Studies. She designed and has been heading NID’s PhD Programme since 2017 and Science and Liberal Arts Studies at NID since 2004. An alumnus of JNU New Delhi (MA), Gujarat University (MPhil), and TISS Mumbai (PhD), she has work experience of 30 years in the education, publishing, and voluntary sectors.\n\nShilpa has been the Founding Co-Editor of <em>The Trellis</em>, a research publication and a magazine, <em>D/signed</em> at NID. She is the editor, author and creative visualizer of the book “50 Years of the National Institute of Design: 1961-2011” (2013); and co-editor of the book, “Indian Crafts in a Globalizing World” (2017). She has several published research papers in journals, chapters in books, and school textbooks. She has been editorial consultant to Collins Cobuild Dictionaries, UK and to the Gujarat State Textbook Board, Gandhinagar. She is co-editor of a special issue on Human Centred Design in Global Health for the journal,<em> Global Health: Science and Practice</em><em> </em>and Reviewer for <em>The Design Journal, </em>Taylor and Francis.\n\nSelect courses she teaches are Aesthetics; History of Design; History of Art; History of Objects; Indian Story Telling Traditions; Design for Disability; Cultural Studies; Form, Emotion, Culture; Disability Studies; and Craft Documentation. She has been Visiting Faculty at Marist College, New York; HTW Berlin, Germany; SWIT, Melbourne, Australia; HSLU, Lucerne, Switzerland; Politecnico di Milano, Italy; School of Architecture CEPT, Ahmedabad; IIT Bombay among others. She has been awarded research grants with Konstfack University, Sweden and Stockholm School of Entrepreneurship; Swinburne University of Technology in Australia, and Lucerne School of Art and Design, Switzerland.\n\nHer notable projects have been for the Indian Navy, Department of Health and Family Welfare; Ministry of Women and Child Development, Department of Telecommunications, and Department of Posts and Telegraph, Government of India.\n\nShe was on the Board of Advisors to the Bill and Melinda Gates Foundation in 2018 on using human-centered design (HCD) in global health; and, in 2019-20 on the Core Project on women’s sexual/reproductive health in India, Kenya, Nigeria and Tanzania. She has been on the Advisory Board of the Swiss Graduate Network of Use-Inspired Research in Design, Switzerland since 2018. She serves widely on international juries, PhD Defences and scientific committees.\n\nAt NID, she co-convened an international conference on Indian Crafts in India, “Indian Crafts: The Future in A Globalising World” in 2004 and convened “Insight 2018”, an international conference on design research in 2018.",
  },
};

const person = (slug: string, name: string, role: string): FacultyPersonSource => ({
  slug,
  name,
  role,
  ...RECORD[slug],
  // TODO(review): the alt text is the person's name, the CMS's (§81).
  photo: mediaAsset(`/people/faculty/${slug}.jpg`, name, 288, 288),
});

export const FACULTY_FIXTURE: {
  title: string;
  people: FacultyPersonSource[];
  disciplines: FacultyDisciplineSource[];
} = {
  title: "Faculty",
  // The faculty document's list order (alphabetical by slug, as the CMS sends it).
  people: [
    person(
      "ajay-kumar-tiwari",
      "Ajay Kumar Tiwari",
      "Discipline Lead, Animation Film Design",
    ),
    person("amarnath-praful", "Amarnath Praful", "Discipline Faculty, Photography Design"),
    person("athul-dinesh", "Athul Dinesh", "Discipline Faculty, Interaction Design"),
    person(
      "dhiman-sengupta",
      "Dhiman Sengupta",
      "Discipline Faculty, Animation Film Design",
    ),
    person(
      "jagriti-p-galphade",
      "Jagriti P Galphade",
      "Discipline Lead, Interaction Design",
    ),
    person(
      "kaushik-chakraborty",
      "Kaushik Chakraborty",
      "Discipline Faculty, Animation Film Design",
    ),
    person(
      "mamata-n-rao",
      "Dr Mamata N. Rao",
      "Activity Chairperson, Knowledge Management Centre (KMC)",
    ),
    person("rishi-singhal", "Rishi Singhal", "Discipline Lead, Photography Design"),
    person("saurabh-srivastava", "Saurabh Srivastava", "Head, Information Technology"),
    person(
      "shilpa-das",
      "Shilpa Das",
      "Faculty of Interdisciplinary Design Studies (IDDS)",
    ),
  ],
  disciplines: [
    {
      slug: "animation-film-design-bdes",
      name: "Animation Film Design",
      campus: PAGE_ID.campusAhmedabad,
      faculty: "Communication Design",
      members: ["kaushik-chakraborty", "ajay-kumar-tiwari", "dhiman-sengupta"],
    },
    {
      slug: "interaction-design-mdes",
      name: "Interaction Design",
      campus: PAGE_ID.campusBengaluru,
      faculty: "IT Integrated Design",
      members: ["athul-dinesh", "jagriti-p-galphade", "mamata-n-rao"],
    },
    {
      slug: "photography-design-mdes",
      name: "Photography Design",
      campus: PAGE_ID.campusGandhinagar,
      faculty: "Communication Design",
      members: ["amarnath-praful", "rishi-singhal", "saurabh-srivastava"],
    },
  ],
};
