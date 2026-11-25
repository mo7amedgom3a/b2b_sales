import type { ApiB2BProgram, B2BTrainer } from '../lib/api'

/**
 * Offline fallback: the first B2B programs of the «المبيعات والنمو» track
 * (`/api/v1/b2b/courses?track=sales-growth`, captured 2026-11-25). Only used
 * when the public B2B API is unreachable, so every course shown is B2B.
 */
export const b2bSnapshot: ApiB2BProgram[] = [
  {
    "program_id": "course-297",
    "kind": "program",
    "title": "محترف تسويق عبر Google Ads",
    "slug": "Professional_Marketing_Through_Google_Ads",
    "short_description": null,
    "image_url": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/qpo7ban5i3ctxfyaw2ksvfsue73ejiw141ijr5pdj6ao7oddwp.png",
    "is_diploma": false,
    "lesson_count": 12,
    "duration_seconds": 30901.0,
    "category": {
      "category_id": 27,
      "name": "التسويق المتكامل",
      "code": "legacy-category-27"
    },
    "categories": [
      {
        "category_id": 27,
        "name": "التسويق المتكامل",
        "code": "legacy-category-27"
      }
    ],
    "trainers": [
      {
        "trainer_id": 117,
        "name": "أ. الأمير أحمد",
        "avatar_url": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/9trxn4u2zb.png",
        "expert_key": "117"
      }
    ]
  },
  {
    "program_id": "course-174",
    "kind": "program",
    "title": "الدروب شيبينغ",
    "slug": "Dropshipping",
    "short_description": null,
    "image_url": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/0huod0zdx0oz2fnhoc1y9cse4guey2rkng8lij5o0t9km2tbb7.png",
    "is_diploma": false,
    "lesson_count": 11,
    "duration_seconds": 24577.0,
    "category": {
      "category_id": 27,
      "name": "التسويق المتكامل",
      "code": "legacy-category-27"
    },
    "categories": [
      {
        "category_id": 27,
        "name": "التسويق المتكامل",
        "code": "legacy-category-27"
      }
    ],
    "trainers": [
      {
        "trainer_id": 82,
        "name": "أ. عبدالرحمن زيدان",
        "avatar_url": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/b2r2wl4x56.png",
        "expert_key": "82"
      }
    ]
  },
  {
    "program_id": "course-233",
    "kind": "program",
    "title": "التسويق من خلال محركات البحث SEO",
    "slug": "Search_Engine_Optimization_SEO",
    "short_description": null,
    "image_url": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/2z1i9ywyf7pdbha22ugielfsiheglue3cqe6t8r0ufaxv02hlp.png",
    "is_diploma": false,
    "lesson_count": 10,
    "duration_seconds": 34583.0,
    "category": {
      "category_id": 27,
      "name": "التسويق المتكامل",
      "code": "legacy-category-27"
    },
    "categories": [
      {
        "category_id": 27,
        "name": "التسويق المتكامل",
        "code": "legacy-category-27"
      }
    ],
    "trainers": [
      {
        "trainer_id": 111,
        "name": "أ. مصطفى صبحي",
        "avatar_url": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/ns3jaw3csy.png",
        "expert_key": "111"
      }
    ]
  },
  {
    "program_id": "course-165",
    "kind": "program",
    "title": "إدارة الضغوط والتوتر",
    "slug": "Pressures_&_Stress_Management_",
    "short_description": null,
    "image_url": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/r1cs99u71i4s326fdy6duorpmsxlqnbyft1mz42vmvek7lkeb8.png",
    "is_diploma": false,
    "lesson_count": 9,
    "duration_seconds": 16152.0,
    "category": {
      "category_id": 4,
      "name": "الفاعلية الشخصية",
      "code": "legacy-category-4"
    },
    "categories": [
      {
        "category_id": 4,
        "name": "الفاعلية الشخصية",
        "code": "legacy-category-4"
      }
    ],
    "trainers": [
      {
        "trainer_id": 79,
        "name": "أ. علياء العنبر",
        "avatar_url": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/qhnvl66r6q.png",
        "expert_key": "79"
      }
    ]
  },
  {
    "program_id": "course-120",
    "kind": "program",
    "title": "أساسيات التسويق الإلكتروني",
    "slug": "Basics_of_E-marketing",
    "short_description": null,
    "image_url": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/sdf33uikbig7xiz7rl52i9t7xs9ssdk325c9sjy24gg47kev1d.png",
    "is_diploma": false,
    "lesson_count": 9,
    "duration_seconds": 19563.0,
    "category": {
      "category_id": 27,
      "name": "التسويق المتكامل",
      "code": "legacy-category-27"
    },
    "categories": [
      {
        "category_id": 27,
        "name": "التسويق المتكامل",
        "code": "legacy-category-27"
      }
    ],
    "trainers": [
      {
        "trainer_id": 82,
        "name": "أ. عبدالرحمن زيدان",
        "avatar_url": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/b2r2wl4x56.png",
        "expert_key": "82"
      }
    ]
  },
  {
    "program_id": "course-319",
    "kind": "program",
    "title": "التسويق في قطاع الاغذية والمشروبات",
    "slug": "Marketing_at_F&B_Sector",
    "short_description": null,
    "image_url": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/y2r9rgrqyyhael5np6z04wiwsqd8ilcoh5x44984gjpm04zz7x.png",
    "is_diploma": false,
    "lesson_count": 9,
    "duration_seconds": 34715.0,
    "category": {
      "category_id": 27,
      "name": "التسويق المتكامل",
      "code": "legacy-category-27"
    },
    "categories": [
      {
        "category_id": 27,
        "name": "التسويق المتكامل",
        "code": "legacy-category-27"
      }
    ],
    "trainers": [
      {
        "trainer_id": 150,
        "name": "أ. حسين غريب",
        "avatar_url": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/98mtbt5jxu.png",
        "expert_key": "150"
      }
    ]
  },
  {
    "program_id": "course-156",
    "kind": "program",
    "title": "الذكاء العاطفي",
    "slug": "Emotional_Intelligence",
    "short_description": null,
    "image_url": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/wbxjaruutfymyllzhtlxa3vcm1sy54qnl5gtqjy4ag4v5vbjnn.png",
    "is_diploma": false,
    "lesson_count": 9,
    "duration_seconds": 28307.0,
    "category": {
      "category_id": 4,
      "name": "الفاعلية الشخصية",
      "code": "legacy-category-4"
    },
    "categories": [
      {
        "category_id": 4,
        "name": "الفاعلية الشخصية",
        "code": "legacy-category-4"
      }
    ],
    "trainers": [
      {
        "trainer_id": 86,
        "name": "د. طارق رشيد",
        "avatar_url": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/0y0c5prhh2.png",
        "expert_key": "86"
      }
    ]
  },
  {
    "program_id": "course-346",
    "kind": "program",
    "title": "إدارة المبيعات",
    "slug": "Sales_Management",
    "short_description": null,
    "image_url": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/k7qw75b6ezzh3s1z2msrgo20mv4syq3tj0to6k3u9mlgotvjd1.jpg",
    "is_diploma": false,
    "lesson_count": 8,
    "duration_seconds": 0.0,
    "category": {
      "category_id": 3,
      "name": "المبيعات وخدمة العملاء",
      "code": "legacy-category-3"
    },
    "categories": [
      {
        "category_id": 3,
        "name": "المبيعات وخدمة العملاء",
        "code": "legacy-category-3"
      }
    ],
    "trainers": [
      {
        "trainer_id": 162,
        "name": "أ. أحمد قطقاطة",
        "avatar_url": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/dcc1tiwopj.jpg",
        "expert_key": "162"
      }
    ]
  }
]

/** Offline fallback: the B2B library's leading trainers (sales track first), captured 2026-11-25. */
export const b2bTrainersSnapshot: B2BTrainer[] = [
  {
    "id": 82,
    "name": "أ. عبدالرحمن زيدان",
    "avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/b2r2wl4x56.png",
    "programs": 3,
    "salesPrograms": 3,
    "topCategory": "التسويق المتكامل"
  },
  {
    "id": 112,
    "name": "أ. محمد سعد إبراهيم",
    "avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/gvp1hl9wm8.png",
    "programs": 3,
    "salesPrograms": 3,
    "topCategory": "التسويق المتكامل"
  },
  {
    "id": 145,
    "name": "أ. عمر عبدالرحيم",
    "avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/amint0g4ra.png",
    "programs": 3,
    "salesPrograms": 3,
    "topCategory": "الفاعلية الشخصية"
  },
  {
    "id": 108,
    "name": "أ. إبراهيم سلامة",
    "avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/54rsouhhsa.png",
    "programs": 5,
    "salesPrograms": 2,
    "topCategory": "الادارة والأعمال"
  },
  {
    "id": 79,
    "name": "أ. علياء العنبر",
    "avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/qhnvl66r6q.png",
    "programs": 2,
    "salesPrograms": 2,
    "topCategory": "الفاعلية الشخصية"
  },
  {
    "id": 116,
    "name": "أ. مدحت ياسين",
    "avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/mrqlgr7ixm.png",
    "programs": 2,
    "salesPrograms": 2,
    "topCategory": "التسويق المتكامل"
  },
  {
    "id": 73,
    "name": "أ. كريم عبدالحميد",
    "avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/mdt5gsym07.webp",
    "programs": 2,
    "salesPrograms": 2,
    "topCategory": "التسويق المتكامل"
  },
  {
    "id": 128,
    "name": "أ. براءه الزعبي",
    "avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/sca186uo2e.png",
    "programs": 3,
    "salesPrograms": 1,
    "topCategory": "القطاع المصرفي"
  },
  {
    "id": 71,
    "name": "أ. مصطفى شعيب",
    "avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/26whbts6ei.png",
    "programs": 3,
    "salesPrograms": 1,
    "topCategory": "الادارة والأعمال"
  }
]
