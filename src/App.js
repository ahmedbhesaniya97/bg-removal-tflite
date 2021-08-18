import React, { useState, useEffect } from "react";
import "./App.css";
import OutputViewer from "./components/OutputViewer";
function App() {
  const [mediastream, setMediastream] = useState(null);

  const backgroundConfig = {
    type: "image",
    // url: `${process.env.PUBLIC_URL}/backgrounds/porch-691330_1280.jpg`,
    url: `${process.env.PUBLIC_URL}/backgrounds/saxon-switzerland-539418_1280.jpg`,
    // url: `${process.env.PUBLIC_URL}/backgrounds/shibuyasky-4768679_1280.jpg`,
  };

  useEffect(async () => {
    const constraint = {
      video: { width: 200, height: 200 },
    };
    setMediastream(await navigator.mediaDevices.getUserMedia(constraint));
  }, []);

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      {mediastream ? (
        <OutputViewer
          mediastream={mediastream}
          backgroundConfig={backgroundConfig}
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
