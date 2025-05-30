import React from "react";

const productGroups = [
  {
    id: "1970c26d528",
    images: [
      "1970c26d528.jpg",
      "1970c26d528 (1).jpg",
      "1970c26d528 (2).jpg",
      "1970c26d528 (3).jpg",
      "1970c26d528 (4).jpg",
      "1970c26d528 (5).jpg",
      "1970c26d528 (6).jpg",
      "1970c26d528 (7).jpg",
    ],
  },
  {
    id: "1970c273ab8",
    images: [
      "1970c273ab8.jpg",
      "1970c273ab8 (1).jpg",
      "1970c273ab8 (2).jpg",
    ],
  },
  {
    id: "1970c282900",
    images: [
      "1970c282900.jpg",
      "1970c282900 (3).jpg",
      "1970c282900 (4).jpg",
      "1970c282900 (5).jpg",
      "1970c282900 (6).jpg",
      "1970c282900 (7).jpg",
      "1970c282900 (8).jpg",
      "1970c282900 (9).jpg",
      "1970c282900 (10).jpg",
      "1970c282900 (11).jpg",
      "1970c282900 (12).jpg",
      "1970c282900 (13).jpg",
      "1970c282900 (14).jpg",
      "1970c282900 (15).jpg",
      "1970c282900 (16).jpg",
      "1970c282900 (17).jpg",
      "1970c282900 (18).jpg",
      "1970c282900 (19).jpg",
      "1970c282900 (20).jpg",
      "1970c282900 (21).jpg",
      "1970c282900 (22).jpg",
      "1970c282900 (23).jpg",
      "1970c282900 (24).jpg",
      "1970c282900 (25).jpg",
      "1970c282900 (26).jpg",
    ],
  },
  {
    id: "1970c2830d0",
    images: [
      "1970c2830d0.jpg",
      "1970c2830d0 (1).jpg",
      "1970c2830d0 (2).jpg",
      "1970c2830d0 (3).jpg",
      "1970c2830d0 (4).jpg",
      "1970c2830d0 (5).jpg",
      "1970c2830d0 (6).jpg",
    ],
  },
  {
    id: "1970c343308",
    images: [
      "1970c343308.jpg",
      "1970c343308 (1).jpg",
      "1970c343308 (2).jpg",
      "1970c343308 (3).jpg",
      "1970c343308 (4).jpg",
      "1970c343308 (5).jpg",
    ],
  },
  {
    id: "1970c349c80",
    images: [
      "1970c349c80.jpg",
      "1970c349c80 (1).jpg",
      "1970c349c80 (2).jpg",
      "1970c349c80 (3).jpg",
      "1970c349c80 (4).jpg",
      "1970c349c80 (5).jpg",
      "1970c349c80 (6).jpg",
      "1970c349c80 (7).jpg",
      "1970c349c80 (8).jpg",
      "1970c349c80 (9).jpg",
      "1970c349c80 (10).jpg",
      "1970c349c80 (11).jpg",
      "1970c349c80 (12).jpg",
      "1970c349c80 (13).jpg",
      "1970c349c80 (14).jpg",
    ],
  },
  {
    id: "1970d7cc838",
    images: [
      "1970d7cc838.jpg",
      "1970d7cc838 (1).jpg",
      "1970d7cc838 (2).jpg",
      "1970d7cc838 (3).jpg",
      "1970d7cc838 (4).jpg",
      "1970d7cc838 (5).jpg",
      "1970d7cc838 (6).jpg",
      "1970d7cc838 (7).jpg",
      "1970d7cc838 (8).jpg",
      "1970d7cc838 (9).jpg",
      "1970d7cc838 (10).jpg",
    ],
  },
  {
    id: "1970d7ff4b8",
    images: ["1970d7ff4b8.jpg", "1970d7ff4b8 (1).jpg"],
  },
  {
    id: "1970d840b98",
    images: ["1970d840b98.jpg"],
  },
  {
    id: "1970d84f210",
    images: ["1970d84f210.jpg", "1970d84f210 (1).jpg"],
  },
  {
    id: "1970d875758",
    images: [
      "1970d875758.jpg",
      "1970d875758 (1).jpg",
      "1970d875758 (2).jpg",
      "1970d875758 (3).jpg",
      "1970d875758 (4).jpg",
    ],
  },
  {
    id: "1970d898208",
    images: ["1970d898208.jpg"],
  },
  {
    id: "1970d8d2b88",
    images: ["1970d8d2b88.jpg", "1970d8d2b88 (1).jpg"],
  },
  {
    id: "misc",
    images: ["5860683408543487874_400.jpeg", "thermvpt.jpg"],
  },
];

export default function ProductGallery() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 p-4">
      {productGroups.map((group) => (
        <div key={group.id} className="border rounded-2xl shadow p-2">
          <h2 className="text-lg font-bold mb-2">{group.id}</h2>
          <div className="grid grid-cols-2 gap-2">
            {group.images.map((img, index) => (
              <img
                key={index}
                src={`/images/products/${img}`}
                alt={img}
                className="w-full h-auto rounded"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
