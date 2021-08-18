import { inputResolutions } from "../../core/helpers/segmentationHelper";
export function buildCanvas2dPipeline(
  sourcePlayback,
  backgroundConfig,
  segmentationConfig,
  tflite,
  addFrameEvent
) {
  const mainCanvas = document.createElement("canvas");
  const ctx = mainCanvas.getContext("2d");

  const [segmentationWidth, segmentationHeight] = inputResolutions[
    segmentationConfig.inputResolution
  ];
  const segmentationPixelCount = segmentationWidth * segmentationHeight;
  const segmentationMask = new ImageData(segmentationWidth, segmentationHeight);
  const segmentationMaskCanvas = document.createElement("canvas");

  const TempCanvas = document.createElement("canvas");
  const TempCanvasctx = TempCanvas.getContext("2d");
  segmentationMaskCanvas.width = segmentationWidth;
  segmentationMaskCanvas.height = segmentationHeight;
  TempCanvas.width = sourcePlayback.width;
  TempCanvas.height = sourcePlayback.height;
  const segmentationMaskCtx = segmentationMaskCanvas.getContext("2d");
  const inputMemoryOffset = tflite._getInputMemoryOffset() / 4;
  const outputMemoryOffset = tflite._getOutputMemoryOffset() / 4;
  let postProcessingConfig;
  async function render() {
    if (backgroundConfig.type !== "none") {
      resizeSource();
      setTimeout(() => {}, 3000);
    }
    addFrameEvent();
    if (backgroundConfig.type !== "none") {
      runTFLiteInference();
    }

    addFrameEvent();

    runPostProcessing();
    setTimeout(() => {}, 6000);
  }

  function updatePostProcessingConfig(newPostProcessingConfig) {
    postProcessingConfig = newPostProcessingConfig;
  }

  function cleanUp() {
    // Nothing to clean up in this rendering pipeline
  }
  function resizeSource() {
    if (sourcePlayback?.htmlElement != null) {
      segmentationMaskCtx.drawImage(
        sourcePlayback.htmlElement,
        0,
        0,
        sourcePlayback.width,
        sourcePlayback.height,
        0,
        0,
        segmentationWidth,
        segmentationHeight
      );
      if (segmentationConfig.model === "meet") {
        const imageData = segmentationMaskCtx.getImageData(
          0,
          0,
          segmentationWidth,
          segmentationHeight
        );
        for (let i = 0; i < segmentationPixelCount; i++) {
          tflite.HEAPF32[inputMemoryOffset + i * 3] =
            imageData.data[i * 4] / 255;
          tflite.HEAPF32[inputMemoryOffset + i * 3 + 1] =
            imageData.data[i * 4 + 1] / 255;
          tflite.HEAPF32[inputMemoryOffset + i * 3 + 2] =
            imageData.data[i * 4 + 2] / 255;
        }
      }
    }
  }
  function runTFLiteInference() {
    tflite._runInference();
    for (let i = 0; i < segmentationPixelCount; i++) {
      if (segmentationConfig.model === "meet") {
        const background = tflite.HEAPF32[outputMemoryOffset + i * 2];
        const person = tflite.HEAPF32[outputMemoryOffset + i * 2 + 1];
        const shift = Math.max(background, person);
        const backgroundExp = Math.exp(background - shift);
        const personExp = Math.exp(person - shift);
        // Sets only the alpha component of each pixel
        segmentationMask.data[i * 4 + 3] =
          (255 * personExp) / (backgroundExp + personExp); // softmax
      }
    }
    segmentationMaskCtx.putImageData(segmentationMask, 0, 0);
  }
  function runPostProcessing() {
    if (sourcePlayback?.htmlElement != null) {
      var image = new Image();
      const url = backgroundConfig.url;
      image.src = url;
      ctx.drawImage(image, 0, 0, sourcePlayback.width, sourcePlayback.height);
      TempCanvasctx.globalCompositeOperation = "copy";
      TempCanvasctx.filter = "none";
      if (
        postProcessingConfig === null || postProcessingConfig === void 0
          ? void 0
          : postProcessingConfig.smoothSegmentationMask
      ) {
        if (backgroundConfig.type === "blur") {
          TempCanvasctx.filter = "blur(8px)"; // FIXME Does not work on Safari
        } else if (backgroundConfig.type === "image") {
          TempCanvasctx.filter = "blur(4px)"; // FIXME Does not work on Safari
        }
      }
      if (backgroundConfig.type !== "none") {
        drawSegmentationMask();
        TempCanvasctx.globalCompositeOperation = "source-in";
        TempCanvasctx.filter = "none";
      }

      TempCanvasctx.drawImage(sourcePlayback.htmlElement, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
      ctx.drawImage(TempCanvas, 0, 0);
      if (backgroundConfig.type === "blur") {
        blurBackground();
      }
    }
  }
  function drawSegmentationMask() {
    TempCanvasctx.drawImage(
      segmentationMaskCanvas,
      0,
      0,
      segmentationWidth,
      segmentationHeight,
      0,
      0,
      sourcePlayback.width,
      sourcePlayback.height
    );
  }
  function blurBackground() {
    ctx.globalCompositeOperation = "destination-over";
    ctx.filter = "blur(8px)"; // FIXME Does not work on Safari
    ctx.drawImage(sourcePlayback.htmlElement, 0, 0);
  }
  return { render, updatePostProcessingConfig, cleanUp, mainCanvas };
}
