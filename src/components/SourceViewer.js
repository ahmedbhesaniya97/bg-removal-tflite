import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import { SourceConfig, SourcePlayback } from "../core/helpers/sourceHelper";

// type SourceViewerProps = {
//   sourceConfig: SourceConfig,
//   onLoad: (sourcePlayback: SourcePlayback) => void,
// };

function SourceViewer(props) {
  const [isLoading, setLoading] = useState(false);
  const [isCameraError, setCameraError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setCameraError(false);
  }, []);

  useEffect(() => {
    async function getCameraStream() {
      try {
        const constraint = { video: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          return;
        }
      } catch (error) {
        console.error("Error opening video camera.", error);
      }
      setLoading(false);
      setCameraError(true);
    }

    if (props.sourceConfig.type === "camera") {
      getCameraStream();
    }
  }, []);

  function handleVideoLoad(event: SyntheticEvent) {
    const video = event.target
    console.log("## VIDEO", event.target);
    props.onLoad({
      htmlElement: video,
      width: video.videoWidth,
      height: video.videoHeight,
    });
    setLoading(false);
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "yellow",
      }}
    >
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          width: 300,
          height: 400,
          objectFit: "cover",
        }}
        hidden={isLoading}
        // autoPlay
        playsInline
        muted
        loop
        onLoadedData={handleVideoLoad}
      />
    </div>
  );
}

export default SourceViewer;
