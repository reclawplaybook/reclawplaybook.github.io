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

// ~98s total — retro game structure, tightened pacing
const S = {
  gameOver: 0,           // GAME OVER screen (0-4s)
  problem: sec(4),       // No lives, no save file (4-14s)
  level1Title: sec(13),  // "WORLD 1-1" flash
  level1: sec(14),       // Install (14-28s)
  level2Title: sec(27),  // "WORLD 1-2" flash
  level2: sec(28),       // Doctor + Identity power-ups (28-44s)
  level3Title: sec(43),  // "WORLD 1-3" flash
  level3: sec(44),       // Heartbeat / Star power (44-58s)
  bossTitle: sec(57),    // "WORLD 1-4" flash
  boss: sec(58),         // The Team / Boss level (58-73s)
  highScore: sec(73),    // Price + proof (73-90s)
  insertCoin: sec(90),   // CTA (90-98s)
};

// Running score state (rendered in HUD)
const SCORES: Array<{ frame: number; value: number }> = [
  { frame: sec(20), value: 1000 },   // Install complete
  { frame: sec(32), value: 2000 },   // Doctor passes
  { frame: sec(36), value: 500 },    // SOUL.md
  { frame: sec(38), value: 500 },    // USER.md
  { frame: sec(40), value: 500 },    // DIRECTIVE.md
  { frame: sec(50), value: 3000 },   // Heartbeat active
  { frame: sec(62), value: 1000 },   // Each agent x6
  { frame: sec(63.5), value: 1000 },
  { frame: sec(65), value: 1000 },
  { frame: sec(66.5), value: 1000 },
  { frame: sec(68), value: 1000 },
  { frame: sec(69.5), value: 1000 },
];

const PunchText: React.FC<{
  children: React.ReactNode;
  startFrame?: number;
  fontSize?: number;
  color?: string;
  delay?: number;
}> = ({ children, startFrame = 0, fontSize = 56, color = theme.textPrimary, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relFrame = frame - startFrame - delay;
  const scale = spring({
    frame: Math.max(0, relFrame),
    fps,
    config: { damping: 8, stiffness: 180, mass: 0.6 },
  });
  const opacity = interpolate(relFrame, [-2, 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{
      opacity, transform: `scale(${scale})`, fontSize,
      fontFamily: theme.fontHeading, color, fontWeight: 700,
      textAlign: "center", lineHeight: 1.3, padding: "0 80px",
    }}>
      {children}
    </div>
  );
};

// Dynamic score calculator
function useScore(frame: number): number {
  let total = 0;
  for (const s of SCORES) {
    if (frame >= s.frame) total += s.value;
  }
  return total;
}

// Dynamic coin counter
function useCoins(frame: number): number {
  let coins = 0;
  for (const s of SCORES) {
    if (frame >= s.frame) coins++;
  }
  return coins;
}

// Which world are we in?
function useWorld(frame: number): string {
  if (frame < S.level2) return "1-1";
  if (frame < S.level3) return "1-2";
  if (frame < S.boss) return "1-3";
  if (frame < S.highScore) return "1-4";
  return "1-4";
}

export const PromoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const score = useScore(frame);
  const coins = useCoins(frame);
  const world = useWorld(frame);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <CRTScreen>
        <RetroFontLoader />

        {/* ─── PARALLAX BACKGROUND (runs entire video) ─── */}
        <ParallaxBG />

        {/* ─── BG CHIPTUNE (loops) ─── */}
        <Audio src={staticFile("sounds/bg-retro.wav")} volume={0.10} loop />

        {/* ─── HUD (visible after game over) ─── */}
        {frame >= S.problem && (
          <GameHUD
            score={score}
            coins={coins}
            world={world}
            lives={frame >= S.level3 ? Infinity : 3}
          />
        )}

        {/* ─── VOICEOVER TRACK ─── */}
        <Sequence from={sec(0.15)} durationInFrames={sec(4.2)}>
          <Audio src={staticFile("vo/retro-01-gameover.mp3")} volume={0.9} />
        </Sequence>
        <Sequence from={S.problem + sec(0.15)} durationInFrames={sec(10)}>
          <Audio src={staticFile("vo/retro-02-problem.mp3")} volume={0.9} />
        </Sequence>
        <Sequence from={S.level1 + sec(0.15)} durationInFrames={sec(13)}>
          <Audio src={staticFile("vo/retro-03-install.mp3")} volume={0.9} />
        </Sequence>
        <Sequence from={S.level2 + sec(0.15)} durationInFrames={sec(15.5)}>
          <Audio src={staticFile("vo/retro-04-powerups.mp3")} volume={0.9} />
        </Sequence>
        <Sequence from={S.level3 + sec(0.15)} durationInFrames={sec(13.5)}>
          <Audio src={staticFile("vo/retro-05-heartbeat.mp3")} volume={0.9} />
        </Sequence>
        <Sequence from={S.boss + sec(0.15)} durationInFrames={sec(14.5)}>
          <Audio src={staticFile("vo/retro-06-boss.mp3")} volume={0.9} />
        </Sequence>
        <Sequence from={S.highScore + sec(0.15)} durationInFrames={sec(16.5)}>
          <Audio src={staticFile("vo/retro-07-highscore.mp3")} volume={0.9} />
        </Sequence>
        <Sequence from={S.insertCoin + sec(0.15)} durationInFrames={sec(7.5)}>
          <Audio src={staticFile("vo/retro-08-cta.mp3")} volume={0.95} />
        </Sequence>

        {/* ══════════════════════════════════════════
            GAME OVER (0-6s)
           ══════════════════════════════════════════ */}
        <Sequence from={S.gameOver} durationInFrames={sec(4)}>
          <GameOverScreen />
          <Sequence from={sec(0)} durationInFrames={sec(1.5)}>
            <Audio src={staticFile("sounds/game-over.wav")} volume={0.5} />
          </Sequence>
        </Sequence>

        {/* Pipe transition to problem */}
        <PipeTransition startFrame={sec(3.7)} duration={12} />
        <ScreenFlash triggerFrame={sec(3.7) + 5} />
        <Sequence from={sec(3.7)} durationInFrames={sec(0.5)}>
          <Audio src={staticFile("sounds/pipe.wav")} volume={0.5} />
        </Sequence>

        {/* ══════════════════════════════════════════
            PROBLEM (6-17s) — No lives, no save file
           ══════════════════════════════════════════ */}
        <Sequence from={S.problem} durationInFrames={sec(10)}>
          <AbsoluteFill style={{
            background: "#000",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", gap: 20,
          }}>
            <Ground scrollSpeed={0} />
            <PixelText size={36} color={retro.textRed} delay={sec(0.5)}>
              NO MEMORY
            </PixelText>
            <PixelText size={36} color={retro.textRed} delay={sec(2)}>
              NO FOLLOW-THROUGH
            </PixelText>
            <PixelText size={36} color={retro.textRed} delay={sec(4)}>
              NO PERSISTENCE
            </PixelText>
            <div style={{ marginTop: 20 }} />
            <PixelText size={20} color="#888" delay={sec(6.5)}>
              Playing on 1 life with no save file.
            </PixelText>
          </AbsoluteFill>
        </Sequence>

        {/* ══════════════════════════════════════════
            LEVEL 1 TITLE (16-17s)
           ══════════════════════════════════════════ */}
        <Sequence from={S.level1Title} durationInFrames={sec(1.5)}>
          <AbsoluteFill style={{ background: "#000" }}>
            <LevelTitle world="1-1" name="THE INSTALL" />
          </AbsoluteFill>
          <Audio src={staticFile("sounds/coin.wav")} volume={0.4} />
        </Sequence>

        {/* ══════════════════════════════════════════
            LEVEL 1 (17-31s) — One Command Install
           ══════════════════════════════════════════ */}
        <Sequence from={S.level1} durationInFrames={sec(14)}>
          <AbsoluteFill style={{
            background: "#000",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", padding: 80,
          }}>
            <Ground scrollSpeed={3} />
            <Terminal title="WORLD 1-1" startFrame={0} lines={[
              { text: "curl -fsSL https://...install.sh | bash", delay: 0, prefix: "$", color: theme.green },
              { text: "Detecting OS... Linux (WSL2)", delay: sec(1.5), color: theme.textSecondary },
              { text: "Installing scaffold...", delay: sec(2.5), color: theme.textSecondary },
              { text: "Writing identity files...", delay: sec(3.5), color: theme.textSecondary },
              { text: "", delay: sec(5) },
              { text: "LEVEL CLEAR!", delay: sec(6), color: theme.green },
            ]} />
            {/* Score pop on install complete */}
            <ScorePop value={1000} x={960} y={300} startFrame={sec(6)} />
            <CoinBurst x={960} y={350} startFrame={sec(6)} count={7} />
          </AbsoluteFill>
          <Sequence from={sec(6)} durationInFrames={sec(1.2)}>
            <Audio src={staticFile("sounds/level-clear.wav")} volume={0.4} />
          </Sequence>
          <Sequence from={sec(6)} durationInFrames={sec(0.3)}>
            <Audio src={staticFile("sounds/coin.wav")} volume={0.35} />
          </Sequence>
        </Sequence>

        {/* Pipe to Level 2 */}
        <PipeTransition startFrame={sec(27)} duration={12} />
        <ScreenFlash triggerFrame={sec(27) + 5} />
        <Sequence from={sec(27)} durationInFrames={sec(0.5)}>
          <Audio src={staticFile("sounds/pipe.wav")} volume={0.5} />
        </Sequence>

        {/* ══════════════════════════════════════════
            LEVEL 2 TITLE (30-31s)
           ══════════════════════════════════════════ */}
        <Sequence from={S.level2Title} durationInFrames={sec(1.5)}>
          <AbsoluteFill style={{ background: "#000" }}>
            <LevelTitle world="1-2" name="POWER UP" />
          </AbsoluteFill>
          <Audio src={staticFile("sounds/coin.wav")} volume={0.4} />
        </Sequence>

        {/* ══════════════════════════════════════════
            LEVEL 2 (31-49s) — Doctor + Identity Files
           ══════════════════════════════════════════ */}
        <Sequence from={S.level2} durationInFrames={sec(16)}>
          <AbsoluteFill style={{
            background: "#000",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", padding: 60,
          }}>
            <Ground scrollSpeed={2} />

            {/* Doctor checks (first 6s) */}
            <Sequence from={0} durationInFrames={sec(8)}>
              <AbsoluteFill style={{
                display: "flex", flexDirection: "column",
                justifyContent: "center", alignItems: "center", padding: 80,
              }}>
                <PixelText size={28} color={theme.green}>reclaw doctor</PixelText>
                <div style={{ marginTop: 20 }} />
                <DoctorCheck startFrame={sec(1)} items={[
                  { label: "Node.js", passed: true, delay: 0 },
                  { label: "Claude CLI", passed: true, delay: sec(0.3) },
                  { label: "Auth", passed: true, delay: sec(0.6) },
                  { label: "Templates", passed: true, delay: sec(0.9) },
                  { label: "Memory", passed: true, delay: sec(1.2) },
                  { label: "Agent", passed: true, delay: sec(1.5) },
                  { label: "Persist", passed: true, delay: sec(1.8) },
                  { label: "Claude test", passed: true, delay: sec(2.1) },
                  { label: "Discord", passed: true, delay: sec(2.4) },
                ]} />
              </AbsoluteFill>
            </Sequence>
            {/* Pop SFX for each check */}
            {[0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4].map((t, i) => (
              <Sequence key={`doc-${i}`} from={sec(1 + t)} durationInFrames={sec(0.3)}>
                <Audio src={staticFile("sounds/coin.wav")} volume={0.2 + i * 0.02} />
              </Sequence>
            ))}
            <Sequence from={sec(3.5)} durationInFrames={sec(1)}>
              <Audio src={staticFile("sounds/level-clear.wav")} volume={0.3} />
            </Sequence>
            <ScorePop value={2000} x={960} y={200} startFrame={sec(4)} />

            {/* Question Blocks for identity files (8-18s) */}
            <Sequence from={sec(8)} durationInFrames={sec(10)}>
              <AbsoluteFill style={{
                display: "flex", justifyContent: "center", alignItems: "center",
              }}>
                <QuestionBlock x={660} y={420} hitFrame={sec(0.5)} size={80}
                  itemLabel="SOUL.md" itemColor={theme.accent} />
                <QuestionBlock x={920} y={420} hitFrame={sec(2.5)} size={80}
                  itemLabel="USER.md" itemColor={theme.accent} />
                <QuestionBlock x={1180} y={420} hitFrame={sec(4.5)} size={80}
                  itemLabel="DIRECTIVE.md" itemColor={theme.accent} />

                {/* Labels below */}
                <PixelText size={18} color={theme.textSecondary} delay={sec(1)}>
                  <div style={{ position: "absolute", left: 640, top: 550, width: 120, textAlign: "center" }}>
                    Who it is
                  </div>
                </PixelText>
                <PixelText size={18} color={theme.textSecondary} delay={sec(3)}>
                  <div style={{ position: "absolute", left: 900, top: 550, width: 120, textAlign: "center" }}>
                    Who you are
                  </div>
                </PixelText>
                <PixelText size={18} color={theme.textSecondary} delay={sec(5)}>
                  <div style={{ position: "absolute", left: 1150, top: 550, width: 140, textAlign: "center" }}>
                    What to do
                  </div>
                </PixelText>

                {/* "No code required" at bottom */}
                <PixelText size={16} color={theme.green} delay={sec(7)}>
                  <div style={{ position: "absolute", bottom: 140, left: 0, right: 0, textAlign: "center" }}>
                    PLAIN TEXT. NO CODE REQUIRED.
                  </div>
                </PixelText>
              </AbsoluteFill>
            </Sequence>
            {/* Block hit SFX */}
            {[0.5, 2.5, 4.5].map((t, i) => (
              <Sequence key={`block-${i}`} from={sec(8 + t)} durationInFrames={sec(0.3)}>
                <Audio src={staticFile("sounds/block-hit.wav")} volume={0.5} />
              </Sequence>
            ))}
            {[0.5, 2.5, 4.5].map((t, i) => (
              <Sequence key={`pup-${i}`} from={sec(8 + t + 0.2)} durationInFrames={sec(0.7)}>
                <Audio src={staticFile("sounds/power-up.wav")} volume={0.3} />
              </Sequence>
            ))}
            <ScorePop value={500} x={700} y={400} startFrame={sec(8.5)} />
            <ScorePop value={500} x={960} y={400} startFrame={sec(10.5)} />
            <ScorePop value={500} x={1220} y={400} startFrame={sec(12.5)} />
          </AbsoluteFill>
        </Sequence>

        {/* Pipe to Level 3 */}
        <PipeTransition startFrame={sec(43)} duration={12} />
        <ScreenFlash triggerFrame={sec(43) + 5} />
        <Sequence from={sec(43)} durationInFrames={sec(0.5)}>
          <Audio src={staticFile("sounds/pipe.wav")} volume={0.5} />
        </Sequence>

        {/* ══════════════════════════════════════════
            LEVEL 3 TITLE (48-49s)
           ══════════════════════════════════════════ */}
        <Sequence from={S.level3Title} durationInFrames={sec(1.5)}>
          <AbsoluteFill style={{ background: "#000" }}>
            <LevelTitle world="1-3" name="STAR POWER" />
          </AbsoluteFill>
          <Audio src={staticFile("sounds/coin.wav")} volume={0.4} />
        </Sequence>

        {/* ══════════════════════════════════════════
            LEVEL 3 (49-66s) — Heartbeat / Star Power
           ══════════════════════════════════════════ */}
        <Sequence from={S.level3} durationInFrames={sec(14)}>
          <AbsoluteFill style={{ background: "#000" }}>
            <StarParticles startFrame={0} count={40} />
            <Ground scrollSpeed={4} />

            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center", padding: 80,
            }}>
              <PixelText size={32} color={retro.starYellow}>
                INVINCIBILITY MODE
              </PixelText>
              <div style={{ marginTop: 30 }} />
              <Terminal title="Heartbeat Loop" startFrame={sec(1.5)} lines={[
                { text: "[06:00] Checking memory...", delay: 0, color: theme.textSecondary },
                { text: "[06:00] HEARTBEAT_OK", delay: sec(2), color: theme.green },
                { text: "", delay: sec(3) },
                { text: "[06:30] Checking memory...", delay: sec(4), color: theme.textSecondary },
                { text: '[06:30] Found: "Client proposal due"', delay: sec(5.5), color: theme.accent },
                { text: "[06:30] Reminder sent.", delay: sec(7), color: theme.green },
                { text: "", delay: sec(8) },
                { text: "Silence = everything is fine.", delay: sec(9.5), color: retro.starYellow },
              ]} />
            </div>

            <ScorePop value={3000} x={960} y={250} startFrame={sec(6)} />
          </AbsoluteFill>

          <Sequence from={0} durationInFrames={sec(0.6)}>
            <Audio src={staticFile("sounds/power-up.wav")} volume={0.45} />
          </Sequence>
          <Sequence from={sec(2)} durationInFrames={sec(0.3)}>
            <Audio src={staticFile("sounds/coin.wav")} volume={0.3} />
          </Sequence>
          <Sequence from={sec(7)} durationInFrames={sec(0.3)}>
            <Audio src={staticFile("sounds/coin.wav")} volume={0.3} />
          </Sequence>
        </Sequence>

        {/* Pipe to Boss */}
        <PipeTransition startFrame={sec(57)} duration={12} />
        <ScreenFlash triggerFrame={sec(57) + 5} />
        <Sequence from={sec(57)} durationInFrames={sec(0.5)}>
          <Audio src={staticFile("sounds/pipe.wav")} volume={0.5} />
        </Sequence>

        {/* ══════════════════════════════════════════
            BOSS TITLE (65-66s)
           ══════════════════════════════════════════ */}
        <Sequence from={S.bossTitle} durationInFrames={sec(1.5)}>
          <AbsoluteFill style={{ background: "#000" }}>
            <LevelTitle world="1-4" name="BOSS LEVEL" />
          </AbsoluteFill>
          <Sequence from={0} durationInFrames={sec(0.5)}>
            <Audio src={staticFile("sounds/impact.wav")} volume={0.6} />
          </Sequence>
        </Sequence>

        {/* ══════════════════════════════════════════
            BOSS (66-89s) — The Team
           ══════════════════════════════════════════ */}
        <Sequence from={S.boss} durationInFrames={sec(15)}>
          <ScreenShake startFrame={0} intensity={8} duration={12}>
            <AbsoluteFill style={{
              background: "#000",
              display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center", gap: 16,
            }}>
              <Ground scrollSpeed={1} height={60} />

              <PixelText size={36} color={retro.starYellow}>
                DEPLOY YOUR SQUAD
              </PixelText>

              <div style={{ marginTop: 20 }} />

              {/* Agent roster — staggered entrance */}
              {[
                { name: "OPS", role: "COMMANDER", color: theme.accent, delay: sec(1.5) },
                { name: "SCOUT", role: "RESEARCH", color: "#00BFFF", delay: sec(3) },
                { name: "ROY", role: "FINANCE", color: "#32CD32", delay: sec(4.5) },
                { name: "DUKE", role: "FITNESS", color: "#FF6347", delay: sec(6) },
                { name: "DARLENE", role: "HOME", color: "#DA70D6", delay: sec(7.5) },
                { name: "TANK", role: "ENGINEER", color: "#87CEEB", delay: sec(9) },
              ].map((agent, i) => {
                const relAgent = frame - S.boss - agent.delay;
                if (relAgent < 0) return null;
                const agentScale = spring({
                  frame: Math.max(0, relAgent),
                  fps,
                  config: { damping: 8, stiffness: 200, mass: 0.5 },
                });
                const agentOpacity = interpolate(relAgent, [-1, 3], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      opacity: agentOpacity,
                      transform: `scale(${agentScale})`,
                    }}
                  >
                    <div style={{
                      fontFamily: retro.pixel,
                      fontSize: 22,
                      color: agent.color,
                      textShadow: `0 0 10px ${agent.color}, 2px 2px 0 rgba(0,0,0,0.8)`,
                      minWidth: 200,
                      textAlign: "right",
                    }}>
                      {agent.name}
                    </div>
                    <div style={{
                      fontFamily: retro.pixel,
                      fontSize: 14,
                      color: "#888",
                      textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
                    }}>
                      {agent.role}
                    </div>
                  </div>
                );
              })}

              {/* "x6 AGENTS READY" at bottom */}
              {frame - S.boss >= sec(10.5) && (
                <div style={{ marginTop: 20 }}>
                  <PixelText size={20} color={retro.heartGreen}>
                    x6 AGENTS READY
                  </PixelText>
                </div>
              )}
            </AbsoluteFill>
          </ScreenShake>

          {/* 1-UP sound on each agent */}
          {[1.5, 3, 4.5, 6, 7.5, 9].map((t, i) => (
            <Sequence key={`agent-sfx-${i}`} from={sec(t)} durationInFrames={sec(0.5)}>
              <Audio src={staticFile("sounds/1-up.wav")} volume={0.3} />
            </Sequence>
          ))}
          {/* Score pops */}
          {[1.5, 3, 4.5, 6, 7.5, 9].map((t, i) => (
            <ScorePop key={`agent-score-${i}`} value={1000} x={1100 + (i % 2) * 60} y={300 + i * 45} startFrame={sec(t)} />
          ))}

          <Sequence from={sec(10.5)} durationInFrames={sec(1.2)}>
            <Audio src={staticFile("sounds/level-clear.wav")} volume={0.5} />
          </Sequence>
        </Sequence>

        {/* Pipe to High Score */}
        <PipeTransition startFrame={sec(72)} duration={12} />
        <ScreenFlash triggerFrame={sec(72) + 5} />
        <Sequence from={sec(72)} durationInFrames={sec(0.5)}>
          <Audio src={staticFile("sounds/pipe.wav")} volume={0.5} />
        </Sequence>

        {/* ══════════════════════════════════════════
            HIGH SCORE (89-106s) — Price + Proof
           ══════════════════════════════════════════ */}
        <Sequence from={S.highScore} durationInFrames={sec(14)}>
          <ScreenShake startFrame={0} intensity={10} duration={15}>
            <AbsoluteFill style={{
              background: "#000",
              display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center",
            }}>
              <PixelText size={24} color={retro.starYellow} delay={0} rainbow>
                NEW HIGH SCORE
              </PixelText>

              <div style={{ marginTop: 30 }}>
                <GlowText startFrame={sec(1)} fontSize={120} color={theme.accent}>
                  $67
                </GlowText>
              </div>

              <div style={{ marginTop: 20 }}>
                <PixelText size={16} color="#888" delay={sec(3)}>
                  ONE TIME. NO SUBSCRIPTION.
                </PixelText>
              </div>

              {/* Stats as "achievements" */}
              <div style={{
                marginTop: 40,
                display: "flex",
                gap: 60,
              }}>
                {[
                  { label: "TESTS", value: "215+", delay: sec(4) },
                  { label: "UPTIME", value: "24/7", delay: sec(5.5) },
                  { label: "AGENTS", value: "x6", delay: sec(7) },
                ].map((stat, i) => {
                  const relStat = frame - S.highScore - stat.delay;
                  if (relStat < 0) return <div key={i} style={{ width: 120 }} />;
                  const statScale = spring({
                    frame: Math.max(0, relStat),
                    fps,
                    config: { damping: 10, stiffness: 180, mass: 0.6 },
                  });
                  return (
                    <div key={i} style={{
                      textAlign: "center",
                      transform: `scale(${statScale})`,
                    }}>
                      <div style={{
                        fontFamily: retro.pixel,
                        fontSize: 36,
                        color: retro.starYellow,
                        textShadow: `0 0 20px ${retro.starYellow}`,
                      }}>
                        {stat.value}
                      </div>
                      <div style={{
                        fontFamily: retro.pixel,
                        fontSize: 12,
                        color: "#888",
                        marginTop: 8,
                      }}>
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AbsoluteFill>
          </ScreenShake>

          <Sequence from={0} durationInFrames={sec(0.5)}>
            <Audio src={staticFile("sounds/impact.wav")} volume={0.6} />
          </Sequence>
          <Sequence from={sec(1)} durationInFrames={sec(0.3)}>
            <Audio src={staticFile("sounds/coin.wav")} volume={0.4} />
          </Sequence>
          {[4, 5.5, 7].map((t, i) => (
            <Sequence key={`stat-sfx-${i}`} from={sec(t)} durationInFrames={sec(0.3)}>
              <Audio src={staticFile("sounds/power-up.wav")} volume={0.3} />
            </Sequence>
          ))}

          <CoinBurst x={960} y={300} startFrame={sec(1)} count={12} />
        </Sequence>

        {/* ══════════════════════════════════════════
            INSERT COIN (106-115s) — CTA
           ══════════════════════════════════════════ */}
        <Sequence from={S.insertCoin} durationInFrames={sec(8)}>
          <AbsoluteFill style={{
            background: "#000",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center",
          }}>
            <StarParticles startFrame={0} count={50} />

            <PixelText size={20} color={retro.starYellow} blink delay={0} typewriter>
              INSERT COIN TO CONTINUE
            </PixelText>

            <div style={{ marginTop: 40 }}>
              <GlowText startFrame={sec(1)} fontSize={64} color={theme.accent} pulseSpeed={0.15}>
                reclawplaybook.com
              </GlowText>
            </div>

            <div style={{ marginTop: 30 }}>
              <PunchText fontSize={32} delay={sec(2.5)}>
                Build it once. Run it forever.
              </PunchText>
            </div>

            <div style={{ marginTop: 20 }}>
              <PixelText size={14} color="#666" delay={sec(4)}>
                PRESS START
              </PixelText>
            </div>
          </AbsoluteFill>

          <Sequence from={0} durationInFrames={sec(0.5)}>
            <Audio src={staticFile("sounds/1-up.wav")} volume={0.5} />
          </Sequence>
        </Sequence>

        {/* ─── SCANLINES (on top of everything) ─── */}
        <Scanlines />
      </CRTScreen>
    </AbsoluteFill>
  );
};
