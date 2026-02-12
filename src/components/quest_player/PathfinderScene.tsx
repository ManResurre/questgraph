import React from "react";
import "./pathfinderScene.scss";

interface PathfinderSceneProps {
    children: React.ReactNode;
}

const PathfinderScene = ({children}: PathfinderSceneProps) => {
    return <div className="text-lg font-['Alegreya'] pathfinder-scene pathfinder-scene-text">
        {children}
    </div>
}
export default React.memo(PathfinderScene);
