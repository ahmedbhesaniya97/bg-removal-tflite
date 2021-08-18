import { useEffect, useRef, useState } from "react";
import { buildCanvas2dPipeline } from "../pipelines/canvas2d/canvas2dPipline";
import useTFLite from "./useTFLite";

function useRenderingPipeline(mediastream, backgroundConfig) {

  const [segmentationConfig] = useState({
    model: "meet",
    backend: "wasm",
    inputResolution: "256x144",
    pipeline: "canvas2dCpu",
  });

  const { tflite } = useTFLite(segmentationConfig);

  const [pipeline, setPipeline] = useState(null);
  const backgroundImageRef = useRef(null);
  const canvasRef = useRef(null);
  const [fps, setFps] = useState(0);
  const [durations, setDurations] = useState([]);
  const [sourcePlayback, setSourcePlayback] = useState({
    htmlElement: null,
    height: 0,
    width: 0,
  });

  useEffect(() => {
    const videoElement = document.createElement("video");
    videoElement.srcObject = mediastream;
    videoElement.autoplay = true;
    videoElement.play();
    videoElement.onloadeddata = function () {
      setSourcePlayback({
        htmlElement: videoElement,
        height: videoElement.videoHeight,
        width: videoElement.videoWidth,
      });
    };
  }, [mediastream]);

  useEffect(() => {
    let shouldRender = true;
    let previousTime = 0;
    let beginTime = 0;
    let eventCount = 0;
    let frameCount = 0;
    const frameDurations = [];
    let renderRequestId;
    const newPipeline =
      tflite &&
      buildCanvas2dPipeline(
        sourcePlayback,
        backgroundConfig,
        segmentationConfig,
        tflite,
        addFrameEvent
      );

    canvasRef.current = newPipeline && newPipeline.mainCanvas;

    async function render() {
      if (!shouldRender) {
        return;
      }
      beginFrame();
      (await newPipeline) && newPipeline.render();
      endFrame();
      renderRequestId = requestAnimationFrame(render);
    }
    function beginFrame() {
      beginTime = Date.now();
    }
    function addFrameEvent() {
      const time = Date.now();
      frameDurations[eventCount] = time - beginTime;
      beginTime = time;
      eventCount++;
    }
    function endFrame() {
      const time = Date.now();
      frameDurations[eventCount] = time - beginTime;
      frameCount++;
      if (time >= previousTime + 1000) {
        setFps((frameCount * 1000) / (time - previousTime));
        setDurations(frameDurations);
        previousTime = time;
        frameCount = 0;
      }
      eventCount = 0;
    }
    render();

    setPipeline(newPipeline);
    return () => {
      shouldRender = false;
      cancelAnimationFrame(renderRequestId);
      newPipeline && newPipeline.cleanUp();

      setPipeline(null);
    };
  }, [
    sourcePlayback,
    backgroundConfig,
    segmentationConfig,
    tflite,
    mediastream,
  ]);
  return {
    pipeline,
    backgroundImageRef,
    outputStream:
      canvasRef && canvasRef.current && canvasRef.current.captureStream(),
    fps,
    durations,
  };
}
export default useRenderingPipeline;
