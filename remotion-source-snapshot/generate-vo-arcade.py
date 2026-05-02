#!/usr/bin/env python3
import asyncio, os, edge_tts
VOICE='en-US-RogerNeural'
RATE='+24%'
PITCH='+6Hz'
OUT_DIR=os.path.join(os.path.dirname(__file__),'public','vo')
os.makedirs(OUT_DIR, exist_ok=True)
SEGMENTS=[
('arcade-01','Game over for forgetful chatbots.'),
('arcade-02','ReClaw remembers. ReClaw runs. ReClaw comes back tomorrow.'),
('arcade-03','One command installs your agent on your own machine.'),
('arcade-04','Power up with identity files. Soul. User. Directive.'),
('arcade-05','Heartbeats keep it alive. Quiet when fine. Loud when it matters.'),
('arcade-06','Unlock the squad. Research. Finance. Fitness. Home. Code. Ops.'),
('arcade-07','Two hundred fifteen tests. Twenty four seven operation. Sixty seven dollars. No subscription.'),
('arcade-08','Press start. Download ReClaw now.'),
]
async def gen(i,t):
    path=os.path.join(OUT_DIR,i+'.mp3')
    if os.path.exists(path): os.remove(path)
    c=edge_tts.Communicate(t,VOICE,rate=RATE,pitch=PITCH)
    await c.save(path)
    print(i, os.path.getsize(path)//1024, 'KB')
async def main():
    for i,t in SEGMENTS:
        await gen(i,t)
asyncio.run(main())
