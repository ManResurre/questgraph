import React from "react";
import styles from "./SciFiScene.module.scss";

interface SciFiSceneProps {
  children: React.ReactNode;
}

const SciFiScene = ({ children }: SciFiSceneProps) => {
  return <div className={styles["sci-fi-scene"]}>{children}</div>;
};

export default SciFiScene;
