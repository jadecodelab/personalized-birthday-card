import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import CardPreview from "../components/CardPreview";
import EnvelopeReveal from "../components/EnvelopeReveal";
import {
  cardTemplates,
  cloneMovableLayouts,
  defaultMovableLayouts,
  defaultPhotoScales,
  formatBirthdayDate,
  messagePresets,
  months,
  stickerCatalog,
  type CardTemplateId,
  type MovableItemId,
  type MovablePoint,
  type ResizeCorner,
} from "../lib/cardData";
import { buildCardShareUrl, type SharedCardPayload } from "../lib/cardLink";
import { compressPhotoForLink } from "../lib/photoCompression";
import { stickerGraphicContent, stickerGraphicViewBox } from "../lib/stickerGraphics";

const wizardSteps = [
  { id: "recipient", label: "Recipient" },
  { id: "message", label: "Message" },
  { id: "photo", label: "Photo" },
  { id: "customize", label: "Customize" },
  { id: "preview", label: "Preview" },
  { id: "download", label: "Download" },
] as const;

type WizardStepId = (typeof wizardSteps)[number]["id"];

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

export default function CreatePage() {
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
  const [photoUploadError, setPhotoUploadError] = useState("");
  const [movableLayouts, setMovableLayouts] = useState(cloneMovableLayouts);
  const [photoScales, setPhotoScales] = useState({ ...defaultPhotoScales });
  // Stickers are opt-in - a new card starts with none active. This is
  // independent of template, so switching styles doesn't clear selections.
  const [activeStickerIds, setActiveStickerIds] = useState<MovableItemId[]>(
    [],
  );
  const [activeMovableItemId, setActiveMovableItemId] =
    useState<MovableItemId | null>(null);
  const [selectedMovableItemId, setSelectedMovableItemId] =
    useState<MovableItemId | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [cardLink, setCardLink] = useState("");
  const [linkStatus, setLinkStatus] = useState("");
  const [isPreviewingAsRecipient, setIsPreviewingAsRecipient] = useState(false);
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

    if (!file.type.startsWith("image/")) {
      setPhotoUploadError("That file isn't an image. Choose a photo instead.");

      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }

      return;
    }

    setPhotoUploadError("");
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setPhotoFileName(file.name);
  }

  function handleRemovePhoto() {
    setPhotoPreviewUrl(null);
    setPhotoFileName("");
    setPhotoUploadError("");

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
      },
    }));
    setPhotoScales((currentScales) => ({
      ...currentScales,
      [selectedTemplate.id]: defaultPhotoScales[selectedTemplate.id],
    }));
  }

  function handleToggleSticker(itemId: MovableItemId) {
    setActiveStickerIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((id) => id !== itemId)
        : [...currentIds, itemId],
    );
    setSelectedMovableItemId((currentId) =>
      currentId === itemId ? null : currentId,
    );
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

  async function handleCreateCardLink() {
    setIsGeneratingLink(true);
    setLinkStatus("");

    try {
      const photoDataUrl = photoPreviewUrl
        ? await compressPhotoForLink(photoPreviewUrl)
        : null;
      const photoWasDropped = Boolean(photoPreviewUrl) && !photoDataUrl;
      const payload: SharedCardPayload = {
        v: 1,
        name: recipientName,
        month: birthdayMonth,
        day: birthdayDay,
        templateId: selectedTemplate.id,
        headline: selectedMessage.headline,
        body: selectedMessage.body,
        layout: selectedMovableLayout,
        activeStickers: activeStickerIds,
        photoScale: selectedPhotoScale,
        photoDataUrl,
      };
      const shareUrl = buildCardShareUrl(payload);

      setCardLink(shareUrl);

      let copyStatus: string;

      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error("Clipboard API not available.");
        }

        await navigator.clipboard.writeText(shareUrl);
        copyStatus = "Link copied to clipboard.";
      } catch {
        copyStatus = "Link ready below. Copy it manually.";
      }

      setLinkStatus(
        photoWasDropped
          ? `${copyStatus} Your photo was too large to include, so the link doesn't have it.`
          : copyStatus,
      );
    } catch {
      setLinkStatus("Could not create the link. Try again.");
    } finally {
      setIsGeneratingLink(false);
    }
  }

  async function handleCopyCardLink() {
    if (!cardLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(cardLink);
      setLinkStatus("Link copied to clipboard.");
    } catch {
      setLinkStatus("Could not copy automatically. Select the link text to copy it.");
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
                {photoUploadError && (
                  <p className="photo-upload-error" role="alert">
                    {photoUploadError}
                  </p>
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
                <div>
                  <h3>Stickers</h3>
                  <p>
                    Click a sticker to add it to the card, or click it again
                    to remove it. Drag any sticker on the card to move it.
                  </p>
                </div>
                <div className="sticker-picker" aria-label="Sticker options">
                  {stickerCatalog.map((sticker) => {
                    const isActive = activeStickerIds.includes(sticker.id);

                    return (
                      <button
                        key={sticker.id}
                        className="sticker-picker-button"
                        type="button"
                        aria-pressed={isActive}
                        aria-label={`${isActive ? "Remove" : "Add"} ${sticker.label.toLowerCase()} ${isActive ? "from" : "to"} the card`}
                        onClick={() => handleToggleSticker(sticker.id)}
                      >
                        <svg
                          className="sticker-picker-icon"
                          viewBox={stickerGraphicViewBox[sticker.id]}
                          aria-hidden="true"
                        >
                          {stickerGraphicContent[sticker.id]}
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {currentWizardStep.id === "preview" && (
              <section className="control-group" aria-labelledby="preview-title">
                <div>
                  <h2 id="preview-title">Preview</h2>
                  <p>
                    Scroll to the card for final adjustments, or see exactly
                    what the recipient will experience when they open it.
                  </p>
                </div>
                <button
                  className="export-button"
                  type="button"
                  onClick={() => setIsPreviewingAsRecipient(true)}
                >
                  Preview as recipient
                </button>
              </section>
            )}

            {currentWizardStep.id === "download" && (
              <section className="control-group" aria-labelledby="download-title">
                <div>
                  <h2 id="download-title">Download</h2>
                  <p>Save the finished card or create a link to send it.</p>
                </div>
                <div className="download-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={isExporting}
                    onClick={handleDownloadCard}
                  >
                    Download card
                  </button>
                  <button
                    className="export-button"
                    type="button"
                    disabled={isGeneratingLink}
                    onClick={handleCreateCardLink}
                  >
                    {isGeneratingLink ? "Creating link..." : "Create card link"}
                  </button>
                </div>
                {exportStatus && (
                  <p className="wizard-export-status" role="status">
                    {exportStatus}
                  </p>
                )}
                {cardLink && (
                  <div className="share-link-row">
                    <input
                      className="share-link-input"
                      type="text"
                      readOnly
                      value={cardLink}
                      onFocus={(event) => event.currentTarget.select()}
                    />
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={handleCopyCardLink}
                    >
                      Copy
                    </button>
                  </div>
                )}
                {linkStatus && (
                  <p className="wizard-export-status" role="status">
                    {linkStatus}
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
          Drag stickers and the photo. Select the photo to resize it.
        </p>
        <CardPreview
          ref={previewCardRef}
          interactive
          templateId={selectedTemplate.id}
          movableLayout={selectedMovableLayout}
          activeStickerIds={activeStickerIds}
          photoScale={selectedPhotoScale}
          photoPreviewUrl={photoPreviewUrl}
          previewName={previewName}
          previewBirthday={previewBirthday}
          message={selectedMessage}
          selectedMovableItemId={selectedMovableItemId}
          activeMovableItemId={activeMovableItemId}
          onItemPointerDown={handleMovablePointerDown}
          onItemPointerMove={handleMovablePointerMove}
          onItemPointerEnd={handleMovablePointerEnd}
          onBackgroundPointerDown={handlePreviewPointerDown}
          onPhotoResizePointerDown={handlePhotoResizePointerDown}
          onPhotoResizePointerMove={handlePhotoResizePointerMove}
          onPhotoResizePointerEnd={handlePhotoResizePointerEnd}
          onPhotoResizeMouseDown={handlePhotoResizeMouseDown}
        />
        {isPreviewingAsRecipient && (
          <div className="recipient-preview-overlay">
            <button
              type="button"
              className="recipient-preview-close"
              onClick={() => setIsPreviewingAsRecipient(false)}
            >
              Back to editing
            </button>
            <EnvelopeReveal recipientName={previewName}>
              <CardPreview
                interactive={false}
                templateId={selectedTemplate.id}
                movableLayout={selectedMovableLayout}
                activeStickerIds={activeStickerIds}
                photoScale={selectedPhotoScale}
                photoPreviewUrl={photoPreviewUrl}
                previewName={previewName}
                previewBirthday={previewBirthday}
                message={selectedMessage}
              />
            </EnvelopeReveal>
          </div>
        )}
      </aside>
    </main>
  );
}
