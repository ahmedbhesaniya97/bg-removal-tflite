import React, { useState, useEffect } from "react";
import "./App.css";
import OutputViewer from "./components/OutputViewer";
import useTFLite from "./hooks/useTFLite";
function App() {
  const [mediastream, setMediastream] = useState(null);

  const backgroundConfig = {
    type: "image",
    // url: `${process.env.PUBLIC_URL}/backgrounds/porch-691330_1280.jpg`,
    url: `${process.env.PUBLIC_URL}/backgrounds/saxon-switzerland-539418_1280.jpg`,
    // url: `${process.env.PUBLIC_URL}/backgrounds/shibuyasky-4768679_1280.jpg`,
  };

  const segmentationConfig = {
    model: "meet",
    backend: "wasm",
    inputResolution: "160x96",
    pipeline: "canvas2dCpu",
  };

  const postProcessingConfig = {
    smoothSegmentationMask: true,
  };


  useEffect(async () => {
    const constraint = {
      video: { width: 96, height: 160 },
    };
    setMediastream(await navigator.mediaDevices.getUserMedia(constraint));
  }, []);

  const { tflite } = useTFLite(segmentationConfig);

  console.log("APP TFLITE", tflite);

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      {mediastream && tflite ? (
        <OutputViewer
          mediastream={mediastream}
          backgroundConfig={backgroundConfig}
          segmentationConfig={segmentationConfig}
          postProcessingConfig={postProcessingConfig}
          tflite={tflite}
        />
      ) : (
        <div>
          <h1>Loading..</h1>
        </div>
      )}
    </div>
  );
}

export default App;
