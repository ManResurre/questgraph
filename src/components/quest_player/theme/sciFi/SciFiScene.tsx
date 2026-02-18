import React from "react";

interface SciFiSceneProps {
  children: React.ReactNode;
}

const SciFiScene = ({ children }: SciFiSceneProps) => {
  return <div className="sci-fi-scene">{children}</div>;
};

export default SciFiScene;
