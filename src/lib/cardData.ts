export const months = [
  { name: "January", days: 31 },
  { name: "February", days: 29 },
  { name: "March", days: 31 },
  { name: "April", days: 30 },
  { name: "May", days: 31 },
  { name: "June", days: 30 },
  { name: "July", days: 31 },
  { name: "August", days: 31 },
  { name: "September", days: 30 },
  { name: "October", days: 31 },
  { name: "November", days: 30 },
  { name: "December", days: 31 },
];

export const messagePresets = [
  {
    id: "warm",
    label: "Warm",
    headline: "Wishing you a day full of joy.",
    body: "May this year bring bright moments, good people, and the kind of memories you keep smiling about.",
  },
  {
    id: "funny",
    label: "Funny",
    headline: "Another year wiser, somehow still this fun.",
    body: "Hope your birthday is packed with cake, laughs, and absolutely no boring grown-up responsibilities.",
  },
  {
    id: "heartfelt",
    label: "Heartfelt",
    headline: "You make life brighter just by being you.",
    body: "Today is the perfect excuse to celebrate your kindness, your spark, and all the ways you are loved.",
  },
];

export const cardTemplates = [
  { id: "elegant", label: "Sweet" },
  { id: "playful", label: "Confetti" },
  { id: "bold", label: "Pop Art" },
  { id: "photo", label: "Photo Fun" },
  { id: "boho", label: "Boho" },
] as const;

export type CardTemplateId = (typeof cardTemplates)[number]["id"];
export type MovableItemId = "cake" | "flowers" | "balloons" | "gift" | "photo";

// Stickers the user can opt into adding to the card - "photo" isn't here
// since it's core content, not a decoration, and stays always present.
// "label" isn't shown (the sticker's own art speaks for itself) but is kept
// for accessible button labels in the picker.
export const stickerCatalog: Array<{ id: MovableItemId; label: string }> = [
  { id: "cake", label: "Cake" },
  { id: "flowers", label: "Flowers" },
  { id: "balloons", label: "Balloons" },
  { id: "gift", label: "Gift" },
];
export type MovablePoint = {
  x: number;
  y: number;
};
export type ResizeCorner = "nw" | "ne" | "sw" | "se";
export type TemplateMovableLayout = Record<MovableItemId, MovablePoint>;

export const defaultMovableLayouts: Record<CardTemplateId, TemplateMovableLayout> = {
  elegant: {
    cake: { x: 16, y: 28 },
    flowers: { x: 82, y: 82 },
    balloons: { x: 82, y: 24 },
    gift: { x: 52, y: 18 },
    photo: { x: 60, y: 31 },
  },
  playful: {
    cake: { x: 16, y: 28 },
    flowers: { x: 62, y: 70 },
    balloons: { x: 86, y: 27 },
    gift: { x: 46, y: 18 },
    photo: { x: 60, y: 31 },
  },
  bold: {
    cake: { x: 84, y: 31 },
    flowers: { x: 78, y: 33 },
    balloons: { x: 17, y: 28 },
    gift: { x: 28, y: 34 },
    photo: { x: 60, y: 28 },
  },
  photo: {
    cake: { x: 84, y: 34 },
    flowers: { x: 16, y: 33 },
    balloons: { x: 84, y: 28 },
    gift: { x: 35, y: 16 },
    photo: { x: 60, y: 26 },
  },
  boho: {
    cake: { x: 18, y: 76 },
    flowers: { x: 86, y: 18 },
    balloons: { x: 84, y: 74 },
    gift: { x: 16, y: 20 },
    photo: { x: 50, y: 27 },
  },
};

export const defaultPhotoScales: Record<CardTemplateId, number> = {
  elegant: 100,
  playful: 100,
  bold: 100,
  photo: 100,
  boho: 100,
};

export function formatBirthdayDate(monthIndex: number, day: number) {
  const month = months[monthIndex];

  if (!month || !day) {
    return "Choose a birthday date";
  }

  return `${month.name} ${day}`;
}

export function cloneMovableLayouts() {
  return Object.fromEntries(
    Object.entries(defaultMovableLayouts).map(([templateId, layout]) => [
      templateId,
      Object.fromEntries(
        Object.entries(layout).map(([itemId, point]) => [
          itemId,
          { ...point },
        ]),
      ),
    ]),
  ) as Record<CardTemplateId, TemplateMovableLayout>;
}
