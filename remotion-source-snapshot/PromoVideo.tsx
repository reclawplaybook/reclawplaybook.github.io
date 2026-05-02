import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  staticFile,
} from "remotion";
import { theme, FPS } from "./theme";
import { Terminal } from "./components/Terminal";
import { DoctorCheck } from "./components/DoctorCheck";
import { ScreenShake } from "./components/ScreenShake";
import { GlowText } from "./components/GlowText";
import { RetroFontLoader } from "./components/RetroFontLoader";
import {
  retro,
  PixelText,
  GameHUD,
  QuestionBlock,
  CoinBurst,
  PipeTransition,
  Ground,
  StarParticles,
  GameOverScreen,
  LevelTitle,
  ScorePop,
  CRTScreen,
  Scanlines,
  ScreenFlash,
  ParallaxBG,
} from "./components/RetroGame";

const sec = (s: number) => Math.round(s * FPS);
const TOTAL = sec(58);

const S = {
  gameOver: 0,
  boot: sec(4),
  install: sec(10),
  power: sec(18),
  heartbeat: sec(27),
  squad: sec(36),
  score: sec(47),
  cta: sec(53),
};

const SCORES = [
  { frame: sec(10.5), value: 1000 },
  { frame: sec(14), value: 1500 },
  { frame: sec(18.5), value: 500 },
  { frame: sec(20.5), value: 500 },
  { frame: sec(22.5), value: 500 },
  { frame: sec(28.5), value: 3000 },
  { frame: sec(37.5), value: 1000 },
  { frame: sec(38.6), value: 1000 },
  { frame: sec(39.7), value: 1000 },
  { frame: sec(40.8), value: 1000 },
  { frame: sec(41.9), value: 1000 },
  { frame: sec(43), value: 1000 },
  { frame: sec(48), value: 6700 },
];

function useScore(frame: number): number {
  return SCORES.reduce((sum, s) => frame >= s.frame ? sum + s.value : sum, 0);
}
function useCoins(frame: number): number {
  return SCORES.filter((s) => frame >= s.frame).length;
}
function useWorld(frame: number): string {
  if (frame < S.install) return "0-1";
  if (frame < S.power) return "1-1";
  if (frame < S.heartbeat) return "1-2";
  if (frame < S.squad) return "1-3";
  if (frame < S.score) return "1-4";
  return "MAX";
}

const HitText: React.FC<{children: React.ReactNode; size?: number; color?: string; delay?: number; y?: number}> = ({ children, size = 54, color = retro.textWhite, delay = 0, y = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame - delay;
  const pop = spring({ frame: Math.max(0, rel), fps, config: { damping: 5, stiffness: 260, mass: 0.45 } });
  const opacity = interpolate(rel, [-2, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{opacity, transform:`translateY(${y}px) scale(${pop})`, fontFamily: retro.pixel, fontSize:size, color, textAlign:"center", lineHeight:1.45, textShadow:"4px 4px 0 #000, 0 0 22px rgba(255,215,0,.45)"}}>{children}</div>;
};

const SpeedLines: React.FC<{opacity?: number}> = ({ opacity = 0.25 }) => {
  const frame = useCurrentFrame();
  const lines = Array.from({length: 28});
  return <AbsoluteFill style={{overflow:"hidden", pointerEvents:"none", zIndex:20, opacity}}>
    {lines.map((_, i) => {
      const y = (i * 43 + frame * 14) % 1150 - 40;
      const w = 160 + (i % 5) * 80;
      return <div key={i} style={{position:"absolute", left: (i*197)%1920, top:y, width:w, height:4, background: i%3===0 ? retro.starYellow : "#fff", opacity:0.35, boxShadow:"0 0 16px currentColor"}} />;
    })}
  </AbsoluteFill>;
};

const ComboBadge: React.FC<{text: string; from: number; x: number; y: number; color?: string}> = ({ text, from, x, y, color = retro.starYellow }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame - from;
  if (rel < 0 || rel > sec(1.4)) return null;
  const scale = spring({frame: Math.max(0, rel), fps, config:{damping:7, stiffness:220}});
  const opacity = interpolate(rel, [0, sec(1.1), sec(1.4)], [1, 1, 0], {extrapolateLeft:"clamp", extrapolateRight:"clamp"});
  return <div style={{position:"absolute", left:x, top:y - rel*1.4, opacity, transform:`scale(${scale}) rotate(${Math.sin(rel*.5)*5}deg)`, fontFamily:retro.pixel, fontSize:22, color, textShadow:"3px 3px 0 #000, 0 0 18px currentColor", zIndex:100}}>{text}</div>;
};

export const PromoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const score = useScore(frame);
  const coins = useCoins(frame);
  const world = useWorld(frame);

  const shakeEveryBeat = frame % 11 === 0;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <CRTScreen>
        <RetroFontLoader />
        <ParallaxBG />
        <Audio src={staticFile("sounds/bg-action.wav")} volume={0.36} loop />

        {frame >= S.boot && <GameHUD score={score} coins={coins} world={world} lives={frame >= S.heartbeat ? Infinity : 3} />}
        {frame >= S.install && frame < S.score && <SpeedLines opacity={0.18} />}

        {/* Fast voiceover hits */}
        <Sequence from={sec(0.2)} durationInFrames={sec(3)}><Audio src={staticFile("vo/arcade-01.mp3")} volume={1} /></Sequence>
        <Sequence from={sec(4.2)} durationInFrames={sec(5)}><Audio src={staticFile("vo/arcade-02.mp3")} volume={1} /></Sequence>
        <Sequence from={sec(10.2)} durationInFrames={sec(5)}><Audio src={staticFile("vo/arcade-03.mp3")} volume={1} /></Sequence>
        <Sequence from={sec(18.2)} durationInFrames={sec(6)}><Audio src={staticFile("vo/arcade-04.mp3")} volume={1} /></Sequence>
        <Sequence from={sec(27.2)} durationInFrames={sec(6)}><Audio src={staticFile("vo/arcade-05.mp3")} volume={1} /></Sequence>
        <Sequence from={sec(36.2)} durationInFrames={sec(8)}><Audio src={staticFile("vo/arcade-06.mp3")} volume={1} /></Sequence>
        <Sequence from={sec(47.2)} durationInFrames={sec(6)}><Audio src={staticFile("vo/arcade-07.mp3")} volume={1} /></Sequence>
        <Sequence from={sec(53.4)} durationInFrames={sec(4)}><Audio src={staticFile("vo/arcade-08.mp3")} volume={1} /></Sequence>

        {/* 0-4: brutal hook */}
        <Sequence from={S.gameOver} durationInFrames={sec(4)}>
          <ScreenShake startFrame={0} intensity={18} duration={sec(4)}>
            <GameOverScreen />
            <AbsoluteFill style={{display:"flex", alignItems:"center", justifyContent:"flex-end", paddingBottom:110}}>
              <PixelText size={22} color={retro.textRed} blink>FOR FORGETFUL CHATBOTS</PixelText>
            </AbsoluteFill>
          </ScreenShake>
          <Audio src={staticFile("sounds/game-over.wav")} volume={0.65} />
          <ScreenFlash triggerFrame={sec(0.2)} duration={8} color="#ff0000" />
        </Sequence>

        {/* 4-10: ReClaw enters */}
        <Sequence from={S.boot} durationInFrames={sec(6)}>
          <AbsoluteFill style={{display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:26}}>
            <Ground scrollSpeed={7} />
            <HitText size={68} color={retro.heartGreen}>RECLAW ENTERS</HitText>
            <HitText size={28} color={retro.starYellow} delay={sec(1.1)}>REMEMBERS</HitText>
            <HitText size={28} color="#fff" delay={sec(2.0)} y={8}>RUNS 24/7</HitText>
            <HitText size={28} color={theme.accent} delay={sec(2.9)} y={16}>COMES BACK TOMORROW</HitText>
            <CoinBurst x={960} y={350} startFrame={sec(1)} count={18} />
          </AbsoluteFill>
          {[0.4,1.1,2,2.9,4.2].map((t,i)=><Sequence key={i} from={sec(t)} durationInFrames={sec(.25)}><Audio src={staticFile(i===0?"sounds/1-up.wav":"sounds/coin.wav")} volume={0.45}/></Sequence>)}
        </Sequence>
        <PipeTransition startFrame={sec(9.3)} duration={9} />
        <ScreenFlash triggerFrame={sec(9.5)} duration={7} />

        {/* 10-18: install speedrun */}
        <Sequence from={S.install} durationInFrames={sec(8)}>
          <AbsoluteFill style={{display:"flex", justifyContent:"center", alignItems:"center", padding:70}}>
            <Ground scrollSpeed={10} />
            <div style={{width:1180}}>
              <LevelTitle world="1-1" name="INSTALL SPEEDRUN" />
              <div style={{marginTop:28}}>
                <Terminal title="1 command" startFrame={sec(1)} lines={[
                  {text:"curl -sSL reclawplaybook.com/install | bash", delay:0, color:theme.accent},
                  {text:"✓ installed on YOUR machine", delay:sec(1.2), color:theme.green},
                  {text:"✓ identity files created", delay:sec(2.1), color:theme.green},
                  {text:"✓ agent online", delay:sec(3.0), color:theme.green},
                  {text:"LEVEL CLEAR!", delay:sec(4.0), color:retro.starYellow},
                ]}/>
              </div>
            </div>
            <ScorePop value={1000} x={1230} y={300} startFrame={sec(4)} />
            <CoinBurst x={1210} y={350} startFrame={sec(4)} count={16} />
          </AbsoluteFill>
          {[1.2,2.1,3,4].map((t,i)=><Sequence key={i} from={sec(t)} durationInFrames={sec(.25)}><Audio src={staticFile(i===3?"sounds/level-clear.wav":"sounds/coin.wav")} volume={0.5}/></Sequence>)}
        </Sequence>
        <PipeTransition startFrame={sec(17.3)} duration={9} />
        <ScreenFlash triggerFrame={sec(17.5)} duration={7} />

        {/* 18-27: powerups */}
        <Sequence from={S.power} durationInFrames={sec(9)}>
          <AbsoluteFill style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
            <Ground scrollSpeed={9} />
            <HitText size={42} color={retro.starYellow} delay={0}>POWER UP</HitText>
            <QuestionBlock x={580} y={440} hitFrame={sec(1.0)} size={86} itemLabel="SOUL" itemColor={theme.accent} />
            <QuestionBlock x={915} y={440} hitFrame={sec(2.5)} size={86} itemLabel="USER" itemColor={theme.accent} />
            <QuestionBlock x={1250} y={440} hitFrame={sec(4.0)} size={86} itemLabel="DIRECTIVE" itemColor={theme.accent} />
            <HitText size={24} color={theme.green} delay={sec(5.3)} y={230}>PLAIN TEXT. NO CODE.</HitText>
            <ComboBadge text="+MEMORY" from={S.power+sec(1.2)} x={520} y={350}/>
            <ComboBadge text="+CONTEXT" from={S.power+sec(2.7)} x={850} y={350}/>
            <ComboBadge text="+MISSION" from={S.power+sec(4.2)} x={1180} y={350}/>
          </AbsoluteFill>
          {[1,2.5,4].map((t,i)=><React.Fragment key={i}><Sequence from={sec(t)} durationInFrames={sec(.25)}><Audio src={staticFile("sounds/block-hit.wav")} volume={0.65}/></Sequence><Sequence from={sec(t+.15)} durationInFrames={sec(.5)}><Audio src={staticFile("sounds/power-up.wav")} volume={0.45}/></Sequence></React.Fragment>)}
        </Sequence>
        <PipeTransition startFrame={sec(26.3)} duration={9} />
        <ScreenFlash triggerFrame={sec(26.5)} duration={7} />

        {/* 27-36: heartbeat */}
        <Sequence from={S.heartbeat} durationInFrames={sec(9)}>
          <AbsoluteFill style={{background:"#000"}}>
            <StarParticles startFrame={0} count={80} />
            <Ground scrollSpeed={13} />
            <ScreenShake startFrame={sec(1.5)} intensity={shakeEveryBeat ? 12 : 4} duration={sec(7)}>
              <AbsoluteFill style={{display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column", gap:30}}>
                <HitText size={54} color={retro.starYellow}>STAR POWER</HitText>
                <Terminal title="heartbeat" startFrame={sec(1)} lines={[
                  {text:"[06:00] scan memory", delay:0, color:theme.textSecondary},
                  {text:"[06:00] HEARTBEAT_OK", delay:sec(1), color:theme.green},
                  {text:"[06:30] found: proposal due", delay:sec(2.2), color:theme.accent},
                  {text:"[06:30] reminder sent", delay:sec(3.2), color:theme.green},
                  {text:"SILENCE = ALL CLEAR", delay:sec(4.4), color:retro.starYellow},
                ]}/>
              </AbsoluteFill>
            </ScreenShake>
            <ScorePop value={3000} x={1220} y={260} startFrame={sec(2.2)} />
          </AbsoluteFill>
          {[.2,1.2,2.2,3.2,4.4].map((t,i)=><Sequence key={i} from={sec(t)} durationInFrames={sec(.3)}><Audio src={staticFile(i===0?"sounds/power-up.wav":"sounds/coin.wav")} volume={0.42}/></Sequence>)}
        </Sequence>
        <PipeTransition startFrame={sec(35.3)} duration={9} />
        <ScreenFlash triggerFrame={sec(35.5)} duration={7} />

        {/* 36-47: squad unlock */}
        <Sequence from={S.squad} durationInFrames={sec(11)}>
          <AbsoluteFill style={{display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column"}}>
            <Ground scrollSpeed={11} />
            <HitText size={42} color={retro.textRed}>BOSS LEVEL</HitText>
            <div style={{height:26}} />
            <div style={{display:"grid", gridTemplateColumns:"repeat(3, 250px)", gap:22}}>
              {[
                ["OPS","COMMAND"], ["SCOUT","RESEARCH"], ["ROY","FINANCE"],
                ["DUKE","FITNESS"], ["DARLENE","HOME"], ["TANK","CODE"],
              ].map(([name, role], i) => {
                const delay = sec(1.1 + i*0.8);
                const rel = frame - S.squad - delay;
                const scale = spring({frame:Math.max(0,rel), fps, config:{damping:6, stiffness:250}});
                return <div key={name} style={{opacity: rel>=0 ? 1 : 0, transform:`scale(${scale})`, border:`4px solid ${theme.accent}`, background:"rgba(0,0,0,.82)", padding:"20px 14px", boxShadow:`0 0 28px ${theme.accent}`}}>
                  <div style={{fontFamily:retro.pixel, color:retro.starYellow, fontSize:24, textAlign:"center"}}>{name}</div>
                  <div style={{fontFamily:retro.pixel, color:"#fff", fontSize:12, textAlign:"center", marginTop:12}}>{role}</div>
                </div>
              })}
            </div>
            <HitText size={26} color={retro.heartGreen} delay={sec(7)} y={25}>SQUAD UNLOCKED</HitText>
          </AbsoluteFill>
          {[1.1,1.9,2.7,3.5,4.3,5.1].map((t,i)=><Sequence key={i} from={sec(t)} durationInFrames={sec(.35)}><Audio src={staticFile("sounds/1-up.wav")} volume={0.38}/></Sequence>)}
          {[1.1,1.9,2.7,3.5,4.3,5.1].map((t,i)=><ScorePop key={i} value={1000} x={1160} y={220+i*70} startFrame={sec(t)} />)}
        </Sequence>
        <ScreenFlash triggerFrame={sec(46.6)} duration={10} color={retro.starYellow}/>

        {/* 47-53: high score */}
        <Sequence from={S.score} durationInFrames={sec(6)}>
          <ScreenShake startFrame={0} intensity={18} duration={sec(6)}>
            <AbsoluteFill style={{display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column", background:"#000"}}>
              <PixelText size={30} color={retro.starYellow} rainbow>NEW HIGH SCORE</PixelText>
              <GlowText startFrame={sec(.5)} fontSize={140} color={theme.accent}>$67</GlowText>
              <div style={{display:"flex", gap:50, marginTop:22}}>
                {["215+ TESTS","24/7 OPS","NO SUB"].map((x,i)=><HitText key={x} size={18} color={i===1?theme.green:retro.starYellow} delay={sec(1.2+i*.55)}>{x}</HitText>)}
              </div>
              <HitText size={20} color="#fff" delay={sec(3.2)} y={25}>YOUR MACHINE. YOUR SERVER. YOUR RULES.</HitText>
              <CoinBurst x={960} y={300} startFrame={sec(.7)} count={30}/>
            </AbsoluteFill>
          </ScreenShake>
          <Audio src={staticFile("sounds/impact.wav")} volume={0.7}/>
          {[.5,1.2,1.75,2.3,3.2].map((t,i)=><Sequence key={i} from={sec(t)} durationInFrames={sec(.25)}><Audio src={staticFile(i===0?"sounds/level-clear.wav":"sounds/coin.wav")} volume={0.48}/></Sequence>)}
        </Sequence>

        {/* 53-58: CTA */}
        <Sequence from={S.cta} durationInFrames={sec(5)}>
          <AbsoluteFill style={{display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column", background:"#000"}}>
            <StarParticles startFrame={0} count={110}/>
            <PixelText size={24} color={retro.starYellow} blink typewriter>PRESS START</PixelText>
            <div style={{height:30}}/>
            <GlowText startFrame={sec(.4)} fontSize={70} color={theme.accent} pulseSpeed={0.09}>reclawplaybook.com</GlowText>
            <HitText size={28} color="#fff" delay={sec(2.1)} y={18}>DOWNLOAD RECLAW NOW</HitText>
          </AbsoluteFill>
          <Audio src={staticFile("sounds/1-up.wav")} volume={0.65}/>
        </Sequence>

        {[4,10,18,27,36,47,53].map((t,i)=><ScreenFlash key={i} triggerFrame={sec(t)} duration={6} color={i%2?retro.starYellow:"#ffffff"}/>) }
        <Scanlines />
      </CRTScreen>
    </AbsoluteFill>
  );
};
