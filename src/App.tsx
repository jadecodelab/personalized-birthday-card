import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

const months = [
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

const messagePresets = [
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

const cardTemplates = [
  { id: "elegant", label: "Sweet" },
  { id: "playful", label: "Confetti" },
  { id: "bold", label: "Pop Art" },
  { id: "photo", label: "Photo Fun" },
] as const;

const wizardSteps = [
  { id: "recipient", label: "Recipient" },
  { id: "message", label: "Message" },
  { id: "photo", label: "Photo" },
  { id: "customize", label: "Customize" },
  { id: "preview", label: "Preview" },
  { id: "download", label: "Download" },
] as const;

type CardTemplateId = (typeof cardTemplates)[number]["id"];
type WizardStepId = (typeof wizardSteps)[number]["id"];
type MovableItemId =
  | "cake"
  | "flowers"
  | "balloons"
  | "gift"
  | "photo"
  | "ribbon";
type MovablePoint = {
  x: number;
  y: number;
};
type ResizeCorner = "nw" | "ne" | "sw" | "se";
type TemplateMovableLayout = Record<MovableItemId, MovablePoint>;

const defaultMovableLayouts: Record<CardTemplateId, TemplateMovableLayout> = {
  elegant: {
    cake: { x: 16, y: 28 },
    flowers: { x: 82, y: 82 },
    balloons: { x: 82, y: 24 },
    gift: { x: 52, y: 18 },
    photo: { x: 60, y: 31 },
    ribbon: { x: 20, y: 13 },
  },
  playful: {
    cake: { x: 16, y: 28 },
    flowers: { x: 62, y: 70 },
    balloons: { x: 86, y: 27 },
    gift: { x: 46, y: 18 },
    photo: { x: 60, y: 31 },
    ribbon: { x: 80, y: 10 },
  },
  bold: {
    cake: { x: 84, y: 31 },
    flowers: { x: 78, y: 33 },
    balloons: { x: 17, y: 28 },
    gift: { x: 28, y: 34 },
    photo: { x: 60, y: 28 },
    ribbon: { x: 24, y: 12 },
  },
  photo: {
    cake: { x: 84, y: 34 },
    flowers: { x: 16, y: 33 },
    balloons: { x: 84, y: 28 },
    gift: { x: 35, y: 16 },
    photo: { x: 60, y: 26 },
    ribbon: { x: 22, y: 13 },
  },
};

const defaultPhotoScales: Record<CardTemplateId, number> = {
  elegant: 100,
  playful: 100,
  bold: 100,
  photo: 100,
};

function formatBirthdayDate(monthIndex: number, day: number) {
  const month = months[monthIndex];

  if (!month || !day) {
    return "Choose a birthday date";
  }

  return `${month.name} ${day}`;
}

function cloneMovableLayouts() {
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSafeFileName(name: string) {
  return (name.trim() || "birthday-card")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getDocumentStyleText() {
  return Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");
}

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function inlineExportImages(cardClone: HTMLElement) {
  const images = Array.from(cardClone.querySelectorAll("img"));

  await Promise.all(
    images.map(async (image) => {
      if (!image.src || image.src.startsWith("data:")) {
        return;
      }

      const response = await fetch(image.src);
      const imageBlob = await response.blob();

      image.src = await readBlobAsDataUrl(imageBlob);
    }),
  );
}

function escapeStyleText(styleText: string) {
  return styleText.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not render the card image."));
    image.src = source;
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create the card PNG."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

async function createCardPngBlob(cardElement: HTMLElement) {
  const cardRect = cardElement.getBoundingClientRect();
  const exportWidth = Math.ceil(cardRect.width);
  const exportHeight = Math.ceil(cardRect.height);
  const cardClone = cardElement.cloneNode(true) as HTMLElement;
  const photoElement = cardElement.querySelector(".photo-placeholder");
  const photoRect = photoElement?.getBoundingClientRect();

  cardClone.classList.add("card-preview--exporting");
  cardClone.querySelectorAll(".is-dragging").forEach((element) => {
    element.classList.remove("is-dragging");
  });
  cardClone.style.width = `${exportWidth}px`;
  cardClone.style.height = `${exportHeight}px`;

  if (photoRect) {
    const clonedPhotoElement = cardClone.querySelector(
      ".photo-placeholder",
    ) as HTMLElement | null;

    cardClone.style.setProperty("--photo-size", `${Math.round(photoRect.width)}px`);
    cardClone.style.setProperty(
      "--media-height",
      `${Math.round(photoRect.width / 0.92)}px`,
    );
    clonedPhotoElement?.style.setProperty("--item-scale", "1");
  }

  await inlineExportImages(cardClone);

  const styleText = escapeStyleText(getDocumentStyleText());
  const serializedCard = new XMLSerializer().serializeToString(cardClone);
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${exportWidth}" height="${exportHeight}" viewBox="0 0 ${exportWidth} ${exportHeight}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <style>${styleText}</style>
          ${serializedCard}
        </div>
      </foreignObject>
    </svg>
  `;
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    svgMarkup,
  )}`;

  const image = await loadImage(svgUrl);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const exportScale = 2;

  if (!context) {
    throw new Error("Could not create the card canvas.");
  }

  canvas.width = exportWidth * exportScale;
  canvas.height = exportHeight * exportScale;
  context.scale(exportScale, exportScale);
  context.drawImage(image, 0, 0, exportWidth, exportHeight);

  return await canvasToPngBlob(canvas);
}

function downloadBlob(blob: Blob, fileName: string) {
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = downloadUrl;
  downloadLink.download = fileName;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(downloadUrl);
}

export default function App() {
  const [recipientName, setRecipientName] = useState("Snoopy");
  const [birthdayMonth, setBirthdayMonth] = useState(7);
  const [birthdayDay, setBirthdayDay] = useState(18);
  const [selectedMessageId, setSelectedMessageId] = useState("warm");
  const [messageHeadline, setMessageHeadline] = useState(
    messagePresets[0].headline,
  );
  const [messageBody, setMessageBody] = useState(messagePresets[0].body);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<CardTemplateId>("elegant");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState("");
  const [movableLayouts, setMovableLayouts] = useState(cloneMovableLayouts);
  const [photoScales, setPhotoScales] = useState({ ...defaultPhotoScales });
  const [activeMovableItemId, setActiveMovableItemId] =
    useState<MovableItemId | null>(null);
  const [selectedMovableItemId, setSelectedMovableItemId] =
    useState<MovableItemId | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [currentWizardStepId, setCurrentWizardStepId] =
    useState<WizardStepId>("recipient");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const previewCardRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    itemId: MovableItemId;
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const resizeStateRef = useRef<{
    corner: ResizeCorner;
    pointerId: number;
    startX: number;
    startY: number;
    startScale: number;
    startWidth: number;
  } | null>(null);
  const photoPointersRef = useRef(
    new Map<number, { clientX: number; clientY: number }>(),
  );
  const pinchStateRef = useRef<{
    startDistance: number;
    startScale: number;
  } | null>(null);
  const previewName = recipientName.trim() || "Birthday Star";
  const selectedMessage = {
    headline: messageHeadline.trim() || "Add your own birthday card headline.",
    body: messageBody.trim() || "Write your own birthday message to see it here.",
  };
  const availableDays = Array.from(
    { length: months[birthdayMonth].days },
    (_, index) => index + 1,
  );
  const previewBirthday = formatBirthdayDate(birthdayMonth, birthdayDay);
  const selectedTemplate =
    cardTemplates.find((template) => template.id === selectedTemplateId) ??
    cardTemplates[0];
  const cardPreviewClassName = `card-preview card-preview--${selectedTemplate.id}`;
  const selectedMovableLayout = movableLayouts[selectedTemplate.id];
  const selectedPhotoScale = photoScales[selectedTemplate.id];
  const cardFileName = `${getSafeFileName(previewName)}-birthday-card.png`;
  const currentWizardStepIndex = wizardSteps.findIndex(
    (step) => step.id === currentWizardStepId,
  );
  const currentWizardStep = wizardSteps[currentWizardStepIndex] ?? wizardSteps[0];
  const isFirstWizardStep = currentWizardStepIndex === 0;
  const isLastWizardStep = currentWizardStepIndex === wizardSteps.length - 1;

  function handleBirthdayMonthChange(value: string) {
    const nextMonth = Number(value);
    const maxDay = months[nextMonth].days;

    setBirthdayMonth(nextMonth);
    setBirthdayDay((currentDay) => Math.min(currentDay, maxDay));
  }

  function handleMessagePresetSelect(message: (typeof messagePresets)[number]) {
    setSelectedMessageId(message.id);
    setMessageHeadline(message.headline);
    setMessageBody(message.body);
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoPreviewUrl(URL.createObjectURL(file));
    setPhotoFileName(file.name);
  }

  function handleRemovePhoto() {
    setPhotoPreviewUrl(null);
    setPhotoFileName("");

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  }

  function getPreviewPoint(clientX: number, clientY: number) {
    const previewRect = previewCardRef.current?.getBoundingClientRect();

    if (!previewRect) {
      return null;
    }

    return {
      x: ((clientX - previewRect.left) / previewRect.width) * 100,
      y: ((clientY - previewRect.top) / previewRect.height) * 100,
    };
  }

  function getBoundedMovablePoint(
    itemId: MovableItemId,
    point: MovablePoint,
    scale = selectedPhotoScale,
  ) {
    if (itemId !== "photo") {
      return {
        x: clamp(point.x, 4, 96),
        y: clamp(point.y, 4, 96),
      };
    }

    const previewRect = previewCardRef.current?.getBoundingClientRect();
    const photoRect = previewCardRef.current
      ?.querySelector(".photo-placeholder")
      ?.getBoundingClientRect();

    if (!previewRect || !photoRect || !previewRect.width || !previewRect.height) {
      return {
        x: clamp(point.x, 4, 96),
        y: clamp(point.y, 4, 96),
      };
    }

    const scaleRatio = scale / selectedPhotoScale;
    const nextPhotoWidth = photoRect.width * scaleRatio;
    const nextPhotoHeight = photoRect.height * scaleRatio;
    const halfWidthPercent = Math.min(
      (nextPhotoWidth / previewRect.width) * 50,
      50,
    );
    const halfHeightPercent = Math.min(
      (nextPhotoHeight / previewRect.height) * 50,
      50,
    );

    return {
      x:
        halfWidthPercent >= 50
          ? 50
          : clamp(point.x, halfWidthPercent, 100 - halfWidthPercent),
      y:
        halfHeightPercent >= 50
          ? 50
          : clamp(point.y, halfHeightPercent, 100 - halfHeightPercent),
    };
  }

  function getPhotoPointerDistance() {
    const pointers = Array.from(photoPointersRef.current.values());

    if (pointers.length < 2) {
      return 0;
    }

    return Math.hypot(
      pointers[0].clientX - pointers[1].clientX,
      pointers[0].clientY - pointers[1].clientY,
    );
  }

  function updateMovableItemPosition(
    templateId: CardTemplateId,
    itemId: MovableItemId,
    point: MovablePoint,
  ) {
    setMovableLayouts((currentLayouts) => ({
      ...currentLayouts,
      [templateId]: {
        ...currentLayouts[templateId],
        [itemId]: point,
      },
    }));
  }

  function handleMovablePointerDown(
    event: PointerEvent<HTMLElement | SVGSVGElement>,
    itemId: MovableItemId,
  ) {
    const pointerPoint = getPreviewPoint(event.clientX, event.clientY);

    if (!pointerPoint) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedMovableItemId(itemId);
    setActiveMovableItemId(itemId);

    if (itemId === "photo") {
      photoPointersRef.current.set(event.pointerId, {
        clientX: event.clientX,
        clientY: event.clientY,
      });

      if (photoPointersRef.current.size >= 2) {
        dragStateRef.current = null;
        pinchStateRef.current = {
          startDistance: getPhotoPointerDistance(),
          startScale: selectedPhotoScale,
        };
        return;
      }
    }

    const currentPoint = selectedMovableLayout[itemId];

    dragStateRef.current = {
      itemId,
      pointerId: event.pointerId,
      offsetX: currentPoint.x - pointerPoint.x,
      offsetY: currentPoint.y - pointerPoint.y,
    };
  }

  function handleMovablePointerMove(
    event: PointerEvent<HTMLElement | SVGSVGElement>,
    itemId: MovableItemId,
  ) {
    if (itemId === "photo" && photoPointersRef.current.has(event.pointerId)) {
      event.preventDefault();
      photoPointersRef.current.set(event.pointerId, {
        clientX: event.clientX,
        clientY: event.clientY,
      });

      const pinchState = pinchStateRef.current;

      if (photoPointersRef.current.size >= 2 && pinchState) {
        const nextDistance = getPhotoPointerDistance();

        if (pinchState.startDistance > 0) {
          const nextScale = clamp(
            Math.round(
              (pinchState.startScale * nextDistance) /
                pinchState.startDistance,
            ),
            70,
            130,
          );

          updatePhotoScale(nextScale);
        }

        return;
      }
    }

    const dragState = dragStateRef.current;

    if (
      !dragState ||
      dragState.itemId !== itemId ||
      dragState.pointerId !== event.pointerId
    ) {
      return;
    }

    const pointerPoint = getPreviewPoint(event.clientX, event.clientY);

    if (!pointerPoint) {
      return;
    }

    updateMovableItemPosition(
      selectedTemplate.id,
      itemId,
      getBoundedMovablePoint(itemId, {
        x: pointerPoint.x + dragState.offsetX,
        y: pointerPoint.y + dragState.offsetY,
      }),
    );
  }

  function handleMovablePointerEnd(
    event: PointerEvent<HTMLElement | SVGSVGElement>,
    itemId: MovableItemId,
  ) {
    const dragState = dragStateRef.current;

    if (
      dragState?.itemId === itemId &&
      dragState.pointerId === event.pointerId
    ) {
      dragStateRef.current = null;
    }

    if (itemId === "photo") {
      photoPointersRef.current.delete(event.pointerId);

      if (photoPointersRef.current.size < 2) {
        pinchStateRef.current = null;
      }
    }

    if (!dragStateRef.current && !pinchStateRef.current) {
      setActiveMovableItemId(null);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleResetMovableLayout() {
    setMovableLayouts((currentLayouts) => ({
      ...currentLayouts,
      [selectedTemplate.id]: {
        cake: { ...defaultMovableLayouts[selectedTemplate.id].cake },
        flowers: { ...defaultMovableLayouts[selectedTemplate.id].flowers },
        balloons: { ...defaultMovableLayouts[selectedTemplate.id].balloons },
        gift: { ...defaultMovableLayouts[selectedTemplate.id].gift },
        photo: { ...defaultMovableLayouts[selectedTemplate.id].photo },
        ribbon: { ...defaultMovableLayouts[selectedTemplate.id].ribbon },
      },
    }));
    setPhotoScales((currentScales) => ({
      ...currentScales,
      [selectedTemplate.id]: defaultPhotoScales[selectedTemplate.id],
    }));
  }

  function updatePhotoScale(nextScale: number) {
    const boundedScale = clamp(nextScale, 70, 130);

    setPhotoScales((currentScales) => ({
      ...currentScales,
      [selectedTemplate.id]: boundedScale,
    }));
    setMovableLayouts((currentLayouts) => ({
      ...currentLayouts,
      [selectedTemplate.id]: {
        ...currentLayouts[selectedTemplate.id],
        photo: getBoundedMovablePoint(
          "photo",
          currentLayouts[selectedTemplate.id].photo,
          boundedScale,
        ),
      },
    }));
  }

  function getMovableItemStyle(itemId: MovableItemId) {
    const point = selectedMovableLayout[itemId];

    const style = {
      "--item-x": `${point.x}%`,
      "--item-y": `${point.y}%`,
    } as CSSProperties;

    if (itemId === "photo") {
      return {
        ...style,
        "--item-scale": `${selectedPhotoScale / 100}`,
      } as CSSProperties;
    }

    return style;
  }

  function getMovableItemClassName(baseClassName: string, itemId: MovableItemId) {
    return `${baseClassName} movable-card-item ${
      activeMovableItemId === itemId ? "is-dragging" : ""
    } ${selectedMovableItemId === itemId ? "is-selected" : ""}`;
  }

  function handlePreviewPointerDown(event: PointerEvent<HTMLDivElement>) {
    const target = event.target;

    if (
      target instanceof Element &&
      !target.closest(".movable-card-item") &&
      !target.closest(".photo-resize-handle")
    ) {
      setSelectedMovableItemId(null);
    }
  }

  function handlePhotoResizePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    corner: ResizeCorner,
  ) {
    const photoRect = previewCardRef.current
      ?.querySelector(".photo-placeholder")
      ?.getBoundingClientRect();

    if (!photoRect) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedMovableItemId("photo");
    setActiveMovableItemId("photo");
    resizeStateRef.current = {
      corner,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScale: selectedPhotoScale,
      startWidth: photoRect.width,
    };
  }

  function updatePhotoScaleFromResize(clientX: number, clientY: number) {
    const resizeState = resizeStateRef.current;

    if (!resizeState) {
      return;
    }

    const horizontalSign = resizeState.corner.includes("w") ? -1 : 1;
    const verticalSign = resizeState.corner.includes("n") ? -1 : 1;
    const signedX = (clientX - resizeState.startX) * horizontalSign;
    const signedY = (clientY - resizeState.startY) * verticalSign;
    const dominantDelta =
      Math.abs(signedX) > Math.abs(signedY) ? signedX : signedY;
    const nextScale =
      resizeState.startScale +
      (dominantDelta / resizeState.startWidth) * resizeState.startScale;

    updatePhotoScale(Math.round(nextScale));
  }

  function handlePhotoResizePointerMove(
    event: PointerEvent<HTMLButtonElement>,
  ) {
    const resizeState = resizeStateRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    updatePhotoScaleFromResize(event.clientX, event.clientY);
  }

  function handlePhotoResizePointerEnd(event: PointerEvent<HTMLButtonElement>) {
    const resizeState = resizeStateRef.current;

    if (resizeState?.pointerId === event.pointerId) {
      resizeStateRef.current = null;
      setActiveMovableItemId(null);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handlePhotoResizeMouseDown(
    event: MouseEvent<HTMLButtonElement>,
    corner: ResizeCorner,
  ) {
    const photoRect = previewCardRef.current
      ?.querySelector(".photo-placeholder")
      ?.getBoundingClientRect();

    if (!photoRect) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setSelectedMovableItemId("photo");
    setActiveMovableItemId("photo");
    resizeStateRef.current = {
      corner,
      pointerId: -1,
      startX: event.clientX,
      startY: event.clientY,
      startScale: selectedPhotoScale,
      startWidth: photoRect.width,
    };
  }

  function handlePreviousWizardStep() {
    if (isFirstWizardStep) {
      return;
    }

    setCurrentWizardStepId(wizardSteps[currentWizardStepIndex - 1].id);
  }

  function handleNextWizardStep() {
    if (isLastWizardStep) {
      return;
    }

    setCurrentWizardStepId(wizardSteps[currentWizardStepIndex + 1].id);
  }

  async function getCardPngBlob() {
    if (!previewCardRef.current) {
      throw new Error("The card preview is not ready yet.");
    }

    return await createCardPngBlob(previewCardRef.current);
  }

  async function handleDownloadCard() {
    setIsExporting(true);
    setExportStatus("");

    try {
      const cardBlob = await getCardPngBlob();

      downloadBlob(cardBlob, cardFileName);
      setExportStatus("Card downloaded.");
    } catch {
      setExportStatus("Download did not work. Try again after the preview loads.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleShareCard() {
    setIsExporting(true);
    setExportStatus("");

    try {
      const cardBlob = await getCardPngBlob();
      const cardFile = new File([cardBlob], cardFileName, {
        type: "image/png",
      });
      const shareData = {
        files: [cardFile],
        title: `Birthday card for ${previewName}`,
        text: `A birthday card for ${previewName}`,
      };
      const shareNavigator = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };

      if (shareNavigator.share && shareNavigator.canShare?.(shareData)) {
        await shareNavigator.share(shareData);
        setExportStatus("Share sheet opened.");
        return;
      }

      downloadBlob(cardBlob, cardFileName);
      setExportStatus("Sharing is not available here, so the card downloaded.");
    } catch {
      setExportStatus("Share did not work. Try downloading the card instead.");
    } finally {
      setIsExporting(false);
    }
  }

  useEffect(() => {
    if (!photoPreviewUrl) {
      return;
    }

    return () => URL.revokeObjectURL(photoPreviewUrl);
  }, [photoPreviewUrl]);

  useEffect(() => {
    function handleWindowPointerMove(event: globalThis.PointerEvent) {
      const resizeState = resizeStateRef.current;

      if (!resizeState) {
        return;
      }

      event.preventDefault();
      updatePhotoScaleFromResize(event.clientX, event.clientY);
    }

    function handleWindowPointerUp(event: globalThis.PointerEvent) {
      const resizeState = resizeStateRef.current;

      if (resizeState?.pointerId === event.pointerId) {
        resizeStateRef.current = null;
        setActiveMovableItemId(null);
      }
    }

    function handleWindowMouseMove(event: globalThis.MouseEvent) {
      const resizeState = resizeStateRef.current;

      if (!resizeState || resizeState.pointerId !== -1) {
        return;
      }

      event.preventDefault();
      updatePhotoScaleFromResize(event.clientX, event.clientY);
    }

    function handleWindowMouseUp() {
      const resizeState = resizeStateRef.current;

      if (resizeState?.pointerId === -1) {
        resizeStateRef.current = null;
        setActiveMovableItemId(null);
      }
    }

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);
    window.addEventListener("mousemove", handleWindowMouseMove, {
      passive: false,
    });
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  });

  return (
    <main className="app-shell">
      <section className="builder-panel" aria-label="Birthday card builder">
        <div className="builder-header">
          <p className="eyebrow">Personalized Birthday Card</p>
          <h1>Birthday Card Builder</h1>
        </div>

        <div className="wizard-shell">
          <ol className="wizard-progress" aria-label="Birthday card steps">
            {wizardSteps.map((step, index) => {
              const isCurrentStep = step.id === currentWizardStep.id;
              const isFinishedStep = index < currentWizardStepIndex;

              return (
                <li
                  key={step.id}
                  className={`wizard-progress-item ${
                    isCurrentStep || isFinishedStep ? "is-filled" : ""
                  }`}
                  aria-current={isCurrentStep ? "step" : undefined}
                >
                  <span className="wizard-dot" aria-hidden="true" />
                  <span className="wizard-step-label">
                    {index + 1}. {step.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="control-stack">
            {currentWizardStep.id === "recipient" && (
              <section className="control-group" aria-labelledby="recipient-title">
                <div>
                  <h2 id="recipient-title">Recipient</h2>
                  <p>Name and birthday details for the card.</p>
                </div>
                <div className="field-grid">
                  <label>
                    Name
                    <input
                      value={recipientName}
                      onChange={(event) => setRecipientName(event.target.value)}
                      placeholder="Maya"
                      maxLength={40}
                      autoComplete="name"
                    />
                  </label>
                  <label>
                    Month
                    <select
                      value={birthdayMonth}
                      onChange={(event) =>
                        handleBirthdayMonthChange(event.target.value)
                      }
                    >
                      {months.map((month, index) => (
                        <option key={month.name} value={index}>
                          {month.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Day
                    <select
                      value={birthdayDay}
                      onChange={(event) =>
                        setBirthdayDay(Number(event.target.value))
                      }
                    >
                      {availableDays.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>
            )}

            {currentWizardStep.id === "message" && (
              <section className="control-group" aria-labelledby="message-title">
                <div>
                  <h2 id="message-title">Message</h2>
                  <p>Pick a starter wish, then edit it for any card style.</p>
                </div>
                <div className="choice-row" aria-label="Message options">
                  {messagePresets.map((message) => (
                    <button
                      key={message.id}
                      className="choice-button"
                      type="button"
                      aria-pressed={message.id === selectedMessageId}
                      onClick={() => handleMessagePresetSelect(message)}
                    >
                      {message.label}
                    </button>
                  ))}
                </div>
                <div className="message-edit-fields">
                  <label>
                    Headline
                    <input
                      value={messageHeadline}
                      onChange={(event) => setMessageHeadline(event.target.value)}
                      maxLength={70}
                      placeholder="A birthday note just for you."
                    />
                  </label>
                  <label>
                    Message
                    <textarea
                      value={messageBody}
                      onChange={(event) => setMessageBody(event.target.value)}
                      maxLength={180}
                      rows={4}
                      placeholder="Write your birthday wish here..."
                    />
                  </label>
                </div>
              </section>
            )}

            {currentWizardStep.id === "photo" && (
              <section className="control-group" aria-labelledby="photo-title">
                <div>
                  <h2 id="photo-title">Photo</h2>
                  <p>Add a favorite photo to the card.</p>
                </div>
                <div className="photo-actions">
                  <label className="upload-button">
                    Upload photo
                    <input
                      ref={photoInputRef}
                      className="visually-hidden"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </label>
                  {photoPreviewUrl && (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={handleRemovePhoto}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {photoFileName && (
                  <p className="photo-file-name">{photoFileName}</p>
                )}
              </section>
            )}

            {currentWizardStep.id === "customize" && (
              <section className="control-group" aria-labelledby="style-title">
                <div>
                  <h2 id="style-title">Customize</h2>
                  <p>Choose a style, then scroll to the preview for final adjustments.</p>
                </div>
                <div className="template-grid" aria-label="Template options">
                  {cardTemplates.map((template) => (
                    <button
                      key={template.id}
                      className="template-button"
                      type="button"
                      aria-pressed={template.id === selectedTemplateId}
                      onClick={() => setSelectedTemplateId(template.id)}
                    >
                      <span
                        className={`template-swatch template-swatch--${template.id}`}
                        aria-hidden="true"
                      />
                      <span>{template.label}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {currentWizardStep.id === "preview" && (
              <section className="control-group" aria-labelledby="preview-title">
                <div>
                  <h2 id="preview-title">Preview</h2>
                  <p>Scroll to the card for final adjustments, then continue to download.</p>
                </div>
              </section>
            )}

            {currentWizardStep.id === "download" && (
              <section className="control-group" aria-labelledby="download-title">
                <div>
                  <h2 id="download-title">Download</h2>
                  <p>Save the finished card or open the share sheet.</p>
                </div>
                <div className="download-actions">
                  <button
                    className="export-button"
                    type="button"
                    disabled={isExporting}
                    onClick={handleDownloadCard}
                  >
                    Download card
                  </button>
                  <button
                    className="export-button"
                    type="button"
                    disabled={isExporting}
                    onClick={handleShareCard}
                  >
                    Share card
                  </button>
                </div>
                {exportStatus && (
                  <p className="wizard-export-status" role="status">
                    {exportStatus}
                  </p>
                )}
              </section>
            )}
          </div>

          <div className="wizard-navigation">
            <button
              className="secondary-button"
              type="button"
              disabled={isFirstWizardStep}
              onClick={handlePreviousWizardStep}
            >
              Back
            </button>
            <span>
              Step {currentWizardStepIndex + 1} of {wizardSteps.length}
            </span>
            {isLastWizardStep ? (
              <button
                className="secondary-button"
                type="button"
                onClick={() => setCurrentWizardStepId("recipient")}
              >
                Edit again
              </button>
            ) : (
              <button
                className="wizard-next-button"
                type="button"
                onClick={handleNextWizardStep}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </section>

      <aside className="preview-panel" aria-label="Card preview">
        <div className="preview-header">
          <p className="eyebrow">Live Preview</p>
          <div className="preview-header-actions">
            <button
              className="export-button"
              type="button"
              disabled={isExporting}
              onClick={handleDownloadCard}
            >
              Download
            </button>
            <button
              className="export-button"
              type="button"
              disabled={isExporting}
              onClick={handleShareCard}
            >
              Share
            </button>
            <button
              className="reset-layout-button"
              type="button"
              disabled={isExporting}
              onClick={handleResetMovableLayout}
            >
              Reset layout
            </button>
            <span>{selectedTemplate.label} template</span>
          </div>
        </div>
        {exportStatus && (
          <p className="export-status" role="status">
            {exportStatus}
          </p>
        )}
        <p className="preview-guide">
          Drag stickers, the tag, and photo. Select the photo to resize it.
        </p>
        <div
          ref={previewCardRef}
          className={cardPreviewClassName}
          onPointerDown={handlePreviewPointerDown}
        >
          <div className="party-stickers" aria-hidden="true">
            <span className="sticker sticker--one" />
            <span className="sticker sticker--two" />
            <span className="sticker sticker--three" />
            <span className="sticker sticker--four" />
            <span className="sticker sticker--five" />
          </div>
          <div className="card-graphics">
            <svg
              className={getMovableItemClassName(
                "card-graphic card-graphic--cake",
                "cake",
              )}
              style={getMovableItemStyle("cake")}
              viewBox="0 0 140 140"
              role="img"
              aria-label="Birthday cake sticker"
              tabIndex={0}
              onPointerDown={(event) => handleMovablePointerDown(event, "cake")}
              onPointerMove={(event) => handleMovablePointerMove(event, "cake")}
              onPointerUp={(event) => handleMovablePointerEnd(event, "cake")}
              onPointerCancel={(event) => handleMovablePointerEnd(event, "cake")}
            >
              <path
                d="M24 113c12 8 80 8 92 0"
                fill="none"
                stroke="#7a3155"
                strokeLinecap="round"
                strokeWidth="8"
              />
              <rect x="34" y="72" width="72" height="36" rx="8" fill="#ff7aa8" />
              <path
                d="M34 82c8-8 15 8 23 0s15 8 23 0 15 8 26 0v14H34z"
                fill="#fff1f6"
              />
              <rect x="46" y="50" width="48" height="26" rx="7" fill="#ffd15c" />
              <path
                d="M46 60c7-7 12 7 18 0s12 7 18 0 8 5 12 0v12H46z"
                fill="#fff7cf"
              />
              <rect x="66" y="28" width="8" height="22" rx="3" fill="#4db6e8" />
              <path
                d="M70 14c10 12-1 18-1 18s-11-7 1-18z"
                fill="#ffcf3f"
              />
              <circle cx="50" cy="92" r="3" fill="#ffffff" />
              <circle cx="69" cy="94" r="3" fill="#ffffff" />
              <circle cx="88" cy="92" r="3" fill="#ffffff" />
            </svg>
            <svg
              className={getMovableItemClassName(
                "card-graphic card-graphic--flowers",
                "flowers",
              )}
              style={getMovableItemStyle("flowers")}
              viewBox="0 0 150 150"
              role="img"
              aria-label="Flower sticker"
              tabIndex={0}
              onPointerDown={(event) =>
                handleMovablePointerDown(event, "flowers")
              }
              onPointerMove={(event) =>
                handleMovablePointerMove(event, "flowers")
              }
              onPointerUp={(event) => handleMovablePointerEnd(event, "flowers")}
              onPointerCancel={(event) =>
                handleMovablePointerEnd(event, "flowers")
              }
            >
              <path
                d="M71 134c-2-28 3-50 12-72"
                fill="none"
                stroke="#277b73"
                strokeLinecap="round"
                strokeWidth="7"
              />
              <path
                d="M73 104c-20-8-31-22-32-42 22 3 34 16 32 42z"
                fill="#59c6a4"
              />
              <path
                d="M84 92c19-8 31-20 36-38-22 1-36 13-36 38z"
                fill="#74d6bc"
              />
              <circle cx="76" cy="54" r="10" fill="#ffcf3f" />
              <circle cx="76" cy="31" r="17" fill="#ff8fb3" />
              <circle cx="100" cy="54" r="17" fill="#ff8fb3" />
              <circle cx="76" cy="77" r="17" fill="#ff8fb3" />
              <circle cx="52" cy="54" r="17" fill="#ff8fb3" />
              <circle cx="76" cy="54" r="15" fill="#fff7cf" />
            </svg>
            <svg
              className={getMovableItemClassName(
                "card-graphic card-graphic--balloons",
                "balloons",
              )}
              style={getMovableItemStyle("balloons")}
              viewBox="0 0 140 160"
              role="img"
              aria-label="Balloon sticker"
              tabIndex={0}
              onPointerDown={(event) =>
                handleMovablePointerDown(event, "balloons")
              }
              onPointerMove={(event) =>
                handleMovablePointerMove(event, "balloons")
              }
              onPointerUp={(event) => handleMovablePointerEnd(event, "balloons")}
              onPointerCancel={(event) =>
                handleMovablePointerEnd(event, "balloons")
              }
            >
              <path
                d="M50 68c-9 30 14 52 2 84M90 72c4 28-16 48-9 80"
                fill="none"
                stroke="#7a3155"
                strokeLinecap="round"
                strokeWidth="4"
              />
              <ellipse cx="48" cy="46" rx="27" ry="35" fill="#4d9de0" />
              <ellipse cx="91" cy="48" rx="27" ry="35" fill="#ff6b94" />
              <path d="M43 78h12l-6 11z" fill="#4d9de0" />
              <path d="M86 80h12l-6 11z" fill="#ff6b94" />
              <circle cx="39" cy="32" r="7" fill="#ffffff" opacity="0.72" />
              <circle cx="82" cy="34" r="7" fill="#ffffff" opacity="0.72" />
            </svg>
            <svg
              className={getMovableItemClassName(
                "card-graphic card-graphic--gift",
                "gift",
              )}
              style={getMovableItemStyle("gift")}
              viewBox="0 0 140 140"
              role="img"
              aria-label="Gift box sticker"
              tabIndex={0}
              onPointerDown={(event) => handleMovablePointerDown(event, "gift")}
              onPointerMove={(event) => handleMovablePointerMove(event, "gift")}
              onPointerUp={(event) => handleMovablePointerEnd(event, "gift")}
              onPointerCancel={(event) => handleMovablePointerEnd(event, "gift")}
            >
              <rect x="29" y="60" width="82" height="56" rx="8" fill="#31c6b4" />
              <rect x="62" y="60" width="16" height="56" fill="#ffcf3f" />
              <rect x="22" y="48" width="96" height="20" rx="7" fill="#ff6b94" />
              <rect x="63" y="48" width="14" height="20" fill="#ffcf3f" />
              <path
                d="M68 48c-22-2-28-20-16-27 12-7 18 15 18 27"
                fill="none"
                stroke="#ffcf3f"
                strokeLinecap="round"
                strokeWidth="8"
              />
              <path
                d="M73 48c22-2 28-20 16-27-12-7-18 15-18 27"
                fill="none"
                stroke="#ffcf3f"
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>
          </div>
          <div
            className={getMovableItemClassName("card-ribbon", "ribbon")}
            style={getMovableItemStyle("ribbon")}
            role="img"
            aria-label="Happy Birthday tag"
            tabIndex={0}
            onPointerDown={(event) => handleMovablePointerDown(event, "ribbon")}
            onPointerMove={(event) => handleMovablePointerMove(event, "ribbon")}
            onPointerUp={(event) => handleMovablePointerEnd(event, "ribbon")}
            onPointerCancel={(event) =>
              handleMovablePointerEnd(event, "ribbon")
            }
          >
            Happy Birthday
          </div>
          <div
            className={getMovableItemClassName(
              `photo-placeholder ${
              photoPreviewUrl ? "photo-placeholder--filled" : ""
              }`,
              "photo",
            )}
            style={getMovableItemStyle("photo")}
            role="group"
            aria-label="Photo frame. Drag to move, or drag a corner handle to resize."
            tabIndex={0}
            onPointerDown={(event) => handleMovablePointerDown(event, "photo")}
            onPointerMove={(event) => handleMovablePointerMove(event, "photo")}
            onPointerUp={(event) => handleMovablePointerEnd(event, "photo")}
            onPointerCancel={(event) => handleMovablePointerEnd(event, "photo")}
          >
            {photoPreviewUrl ? (
              <img
                src={photoPreviewUrl}
                alt={`Uploaded photo for ${previewName}`}
                draggable={false}
              />
            ) : (
              <span>Photo</span>
            )}
            <div className="photo-resize-handles" aria-hidden="true">
              {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                <button
                  key={corner}
                  className={`photo-resize-handle photo-resize-handle--${corner}`}
                  type="button"
                  tabIndex={-1}
                  aria-label={`Resize photo ${corner}`}
                  onPointerDown={(event) =>
                    handlePhotoResizePointerDown(event, corner)
                  }
                  onPointerMove={handlePhotoResizePointerMove}
                  onPointerUp={handlePhotoResizePointerEnd}
                  onPointerCancel={handlePhotoResizePointerEnd}
                  onMouseDown={(event) =>
                    handlePhotoResizeMouseDown(event, corner)
                  }
                />
              ))}
            </div>
          </div>
          <div className="card-copy">
            <p className="birthday-line">Celebrating {previewBirthday}</p>
            <p>Dear {previewName},</p>
            <h2>{selectedMessage.headline}</h2>
            <p>{selectedMessage.body}</p>
          </div>
        </div>
      </aside>
    </main>
  );
}
