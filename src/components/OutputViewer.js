import React, { useEffect, useRef } from "react";
import useRenderingPipeline from "../hooks/useRenderingPipeline";

function OutputViewer(props) {
  const videoRef = useRef(null);
  console.log("O/P VIEWER ", props.tflite);
  const { pipeline, canvasRef } = useRenderingPipeline(
    props.mediastream,
    props.backgroundConfig,
    props.segmentationConfig,
    props.tflite
  );

  useEffect(() => {
    if (pipeline) {
      const stream = canvasRef.current.captureStream();
      console.log("STREAM", stream);
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, [pipeline, props.postProcessingConfig]);

  return (
    <div
      style={{
        height: "100vh",
        position: "relative",
      }}
    >
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        autoPlay
      />
    </div>
  );
}

export default OutputViewer;
