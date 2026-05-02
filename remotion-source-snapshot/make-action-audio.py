#!/usr/bin/env python3
import math, wave, struct, os, random
SR=44100
OUT='public/sounds/bg-action.wav'
os.makedirs('public/sounds', exist_ok=True)

def sq(freq,t,duty=0.5):
    if freq<=0: return 0
    return 1.0 if (t*freq)%1 < duty else -1.0

def tri(freq,t):
    if freq<=0: return 0
    x=(t*freq)%1
    return 4*abs(x-0.5)-1

def env(local,dur,attack=0.005,release=0.035):
    if local<attack: return local/attack
    if local>dur-release: return max(0,(dur-local)/release)
    return 1

def note_freq(n):
    # midi
    return 440*2**((n-69)/12)

# 170 BPM 16th-note arpeggio, action-platformer vibe
bpm=170
beat=60/bpm
step=beat/4
length=60.0
# chord progression in E minor-ish: E, C, D, B
chords=[[52,55,59,64],[48,52,55,60],[50,54,57,62],[47,50,54,59]]
lead=[76,79,83,86,83,79,76,74, 76,79,84,88,84,79,76,72]

samples=[]
for i in range(int(SR*length)):
    t=i/SR
    bar=int(t/(beat*4))
    step_i=int(t/step)
    chord=chords[bar%len(chords)]
    local=t-step_i*step
    # bass eighths
    bass_note=chord[0]-12 if int(t/(beat/2))%2==0 else chord[0]-5
    bass=0.22*sq(note_freq(bass_note),t,0.48)*env((t%(beat/2)), beat/2, 0.004,0.045)
    # fast arpeggio
    arp_note=chord[step_i%len(chord)]+12
    arp=0.18*sq(note_freq(arp_note),t,0.35)*env(local,step,0.002,0.025)
    # lead hook every other 2 bars
    lead_step=int(t/(step*2))
    lead_note=lead[lead_step%len(lead)]
    lead_amp=0.12 if (bar%4 in [1,3]) else 0.06
    leadv=lead_amp*tri(note_freq(lead_note),t)*env(t%(step*2),step*2,0.004,0.04)
    # kick/snare/noise percussion
    beat_pos=t%beat
    kick=0
    if beat_pos<0.055 and int(t/beat)%2==0:
        f=90-55*(beat_pos/0.055)
        kick=0.35*math.sin(2*math.pi*f*t)*(1-beat_pos/0.055)
    snare=0
    if beat_pos<0.035 and int(t/beat)%4==2:
        snare=0.18*(random.random()*2-1)*(1-beat_pos/0.035)
    hat=0
    hpos=t%(step*2)
    if hpos<0.012:
        hat=0.05*(random.random()*2-1)*(1-hpos/0.012)
    v=bass+arp+leadv+kick+snare+hat
    # soft clip
    v=math.tanh(v*1.4)*0.7
    samples.append(v)

with wave.open(OUT,'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    for v in samples:
        w.writeframes(struct.pack('<h', int(max(-1,min(1,v))*32767)))
print(OUT)
