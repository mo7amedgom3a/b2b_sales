import type { ApiProductCard } from '../lib/api'

/**
 * Snapshot of real sales-category catalog cards («المبيعات وخدمة العملاء»), used only
 * when the API is unreachable. Normal loads call `fetchSalesProductCards`, which returns
 * the same category, so the grid never swaps to a different kind of course.
 */
export const fallbackProducts: ApiProductCard[] = [
  {
    "product_id": "3f5890a9-1497-e3d5-2992-ee8c0c83c156",
    "slug": "course-100",
    "product_type": "course",
    "title": "مهارات البيع والتسويق العقاري",
    "short_description": null,
    "image": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/fiunl0elrk55ma8b2m6i3rwhj5gp8f8rziuklvhm7z0664t0kv.png",
    "price": {
      "amount": 129.0,
      "compare_at_amount": null,
      "currency_code": "USD"
    },
    "category": "المبيعات وخدمة العملاء",
    "instructor_name": "أ. خالد الحداد",
    "instructor_avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/lxjfvjrksa.png",
    "instructor_key": "57",
    "lesson_count": 46,
    "duration_seconds": 187433.0,
    "updated_at": "2026-10-04T09:59:29.628796"
  },
  {
    "product_id": "a52c21df-64a7-1f7b-59ed-e70ba7e6adc3",
    "slug": "course-102",
    "product_type": "course",
    "title": "تحفيز فرق المبيعات \"النظريات والتطبيقات\"",
    "short_description": null,
    "image": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/h9nfvuiuiq95lxux8c3v9ld3kly26wj6jd9exv0r40qb0qwfv6.png",
    "price": {
      "amount": 129.0,
      "compare_at_amount": null,
      "currency_code": "USD"
    },
    "category": "المبيعات وخدمة العملاء",
    "instructor_name": "د. جوزيف حناني",
    "instructor_avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/x6bg69jt8n.png",
    "instructor_key": "63",
    "lesson_count": 60,
    "duration_seconds": 123799.0,
    "updated_at": "2026-10-04T09:59:29.628796"
  },
  {
    "product_id": "e1e19c03-8df8-889d-c1e1-864753801a65",
    "slug": "course-112",
    "product_type": "course",
    "title": "تصميم القمع البيعي",
    "short_description": null,
    "image": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/ccucaury93yvpbhxc0tnrkt38ihkubbqyp67kekodionqrz1n1.png",
    "price": {
      "amount": 129.0,
      "compare_at_amount": null,
      "currency_code": "USD"
    },
    "category": "المبيعات وخدمة العملاء",
    "instructor_name": "أ. عبدالرحمن زيدان",
    "instructor_avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/b2r2wl4x56.png",
    "instructor_key": "82",
    "lesson_count": 79,
    "duration_seconds": 114385.0,
    "updated_at": "2026-10-04T09:59:29.628796"
  },
  {
    "product_id": "23174924-74e0-b663-ea17-1135c2fd92ad",
    "slug": "course-117",
    "product_type": "course",
    "title": "طرق إغلاق المبيعات",
    "short_description": null,
    "image": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/ee5qoftt2k4dh0wefy4g9wk6vbmaug3te620vfbcro96aawevg.png",
    "price": {
      "amount": 190.0,
      "compare_at_amount": null,
      "currency_code": "USD"
    },
    "category": "المبيعات وخدمة العملاء",
    "instructor_name": "م. أيمن السيد",
    "instructor_avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/frlr336wwy.png",
    "instructor_key": "22",
    "lesson_count": 51,
    "duration_seconds": 163940.0,
    "updated_at": "2026-10-04T09:59:29.628796"
  },
  {
    "product_id": "8b0e3107-5f7d-2548-7f43-1327e6c07928",
    "slug": "course-118",
    "product_type": "course",
    "title": "مدخل في مهارات التحصيل",
    "short_description": null,
    "image": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/6xed44qpqjj2epbfax8v5uidlgv61kx5r32v5bjynym7su94n7.png",
    "price": {
      "amount": 69.0,
      "compare_at_amount": null,
      "currency_code": "USD"
    },
    "category": "المبيعات وخدمة العملاء",
    "instructor_name": "أ. زيد اليعيش",
    "instructor_avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/v36awtm8t9.png",
    "instructor_key": "67",
    "lesson_count": 32,
    "duration_seconds": 18959.0,
    "updated_at": "2026-10-04T09:59:29.628796"
  },
  {
    "product_id": "d903dc54-7176-554f-f63e-256b174962b3",
    "slug": "course-128",
    "product_type": "course",
    "title": "فن المتابعة للبائع المحترف",
    "short_description": null,
    "image": "https://s3.eu-west-1.amazonaws.com/course.emasteryacademy.com/agjanrvphqvqrdydpqwd3olx25nxr1afnpny1gj3p50m8dbcn7.png",
    "price": {
      "amount": 129.0,
      "compare_at_amount": null,
      "currency_code": "USD"
    },
    "category": "المبيعات وخدمة العملاء",
    "instructor_name": "أ. خالد الحداد",
    "instructor_avatar": "https://s3.eu-west-1.amazonaws.com/trainer.emasteryacademy.com/lxjfvjrksa.png",
    "instructor_key": "57",
    "lesson_count": 45,
    "duration_seconds": 163424.0,
    "updated_at": "2026-10-04T09:59:29.628796"
  }
]
