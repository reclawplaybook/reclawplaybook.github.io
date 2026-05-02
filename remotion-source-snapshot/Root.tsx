import React from "react";
import { Composition } from "remotion";
import { InstructionalVideo } from "./InstructionalVideo";
import { PromoVideo } from "./PromoVideo";
import { Thumbnail } from "./Thumbnail";
import { WIDTH, HEIGHT, FPS } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="InstructionalVideo"
        component={InstructionalVideo}
        durationInFrames={390 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="PromoVideo"
        component={PromoVideo}
        durationInFrames={98 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="PromoVertical"
        component={PromoVideo}
        durationInFrames={98 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="Thumbnail"
        component={Thumbnail}
        durationInFrames={1}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
