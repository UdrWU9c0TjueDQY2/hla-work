"""Compose captioned calculator screenshots. Input frames come from capture.cjs. Requires Pillow and ffmpeg."""
import pathlib,sys,subprocess
from PIL import Image,ImageDraw,ImageFont
root=pathlib.Path(sys.argv[1]).resolve()
font=pathlib.Path('/usr/share/fonts/truetype/dejavu')
def face(bold,px):
    return ImageFont.truetype(str(font/('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')),px)
cues=[
(0,3,"A 9–12 shift fits six 30-minute visits\nwhen there’s no cleanup gap."),
(3,7.5,"Keep the same shift. Set the buffer to\n10 minutes between visits."),
(7.5,12.25,"Calculate again. Four visits fit, and\nthe last one ends at 11:30."),
(12.25,18,"Thirty minutes remain. A fifth visit\nwould need 40: 10 to clean, 30 to work.")
]
def clock(sec):
    return f'00:00:{int(sec):02}.{round((sec-int(sec))*1000):03}'
(root/'cleanup-buffer.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(f'{clock(start)} --> {clock(end)}\n{caption}' for start,end,caption in cues)+'\n')
proc=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','512x744','-r','8','-i','-','-an','-c:v','libx264','-profile:v','baseline','-level','3.0','-preset','medium','-crf','30','-pix_fmt','yuv420p','-movflags','+faststart',str(root/'cleanup-buffer.mp4')],stdin=subprocess.PIPE)
for index,fp in enumerate(sorted((root/'frames').glob('*.png'))):
    im=Image.new('RGB',(512,744),'#173e47'); d=ImageDraw.Draw(im)
    d.text((32,17),'BOOKINGSOLVED  /  WEB CALCULATOR',font=face(True,15),fill='#c0e3cd')
    d.text((30,48),'Room for cleanup?',font=face(True,35),fill='#fff9e9')
    d.rectangle((30,108,481,573),outline='#bce5d0',width=2)
    state=0 if index<24 else 36 if index<38 else 47 if index<60 else 89 if index<98 else 129
    shot=root/'frames'/f'{state:03}.png'
    im.paste(Image.open(shot).convert('RGB'),(32,110))
    cue=next(c for c in cues if c[0]<=index/8<c[1])
    for line in cue[2].split('\n'): assert d.textlength(line,font=face(False,22))<448,line
    d.multiline_text((32,597),cue[2],font=face(False,22),fill='#fff9e9',spacing=6)
    d.line((32,690,480,690),fill='#507079',width=2)
    d.line((32,690,32+int(448*(index+1)/144),690),fill='#eaba81',width=3)
    d.text((32,705),'HONEST LITTLE APPS',font=face(True,13),fill='#c0e3cd')
    if index in (0,45,88,129): im.save(root/f'preview-{index}.jpg',quality=90)
    if index==0: im.save(root/'cleanup-buffer-poster.webp',quality=78,method=6)
    proc.stdin.write(im.tobytes())
proc.stdin.close()
if proc.wait(): raise RuntimeError('ffmpeg failed')
