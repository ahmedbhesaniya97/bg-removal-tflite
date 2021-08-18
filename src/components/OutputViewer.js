import React, { useEffect, useRef } from "react";
import useRenderingPipeline from "../hooks/useRenderingPipeline";

function OutputViewer(props) {
  const videoRef = useRef(null);
  const { pipeline, outputStream } = useRenderingPipeline(
    props.mediastream,
    props.backgroundConfig
  );

  useEffect(() => {
    if (pipeline && outputStream) {
      videoRef.current.srcObject = outputStream;
      videoRef.current.play();
    }
  }, [pipeline]);

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
