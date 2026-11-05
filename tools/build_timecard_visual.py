from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from fractions import Fraction
import html, math, base64, json
from reportlab.graphics.barcode import qrencoder

ROOT=Path(__file__).parent
REPO=ROOT/'hla-work' if (ROOT/'hla-work').is_dir() else ROOT.parent
FOLDER=REPO/'src/earncheck/timecard-format-practice'
FOLDER.mkdir(parents=True,exist_ok=True)
W,H=1200,1510
CREAM='#f6f3ea'; INK='#172c3c'; GREEN='#285e50'; PALE='#e4ead7'; ORANGE='#963e20'; RULE='#b7c4ba'
im=Image.new('RGB',(W,H),CREAM); draw=ImageDraw.Draw(im)
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc"><title id="title">7:45 is not 7.45 hours</title><desc id="desc">A 45-minute quarter-hour dial, two minute tracks and four fictional entries explain the difference between hours:minutes and decimal hours. Full equivalent text accompanies this visual.</desc>']
fontdir=Path('/usr/share/fonts/truetype/dejavu')
def font(size,bold=False):return ImageFont.truetype(str(fontdir/('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')),size)
def rect(x,y,w,h,fill,radius=0):
 draw.rounded_rectangle((x,y,x+w,y+h),radius=radius,fill=fill)
 svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"/>')
def line(x,y,x2,y2,fill=RULE,width=2):
 draw.line((x,y,x2,y2),fill=fill,width=width)
 svg.append(f'<path d="M{x} {y}L{x2} {y2}" stroke="{fill}" stroke-width="{width}"/>')
def text(x,y,s,size=24,bold=False,fill=INK):
 draw.text((x,y),s,font=font(size,bold),fill=fill,anchor='lt')
 # The SVG baseline uses the same measured font ascent as the raster.
 asc=font(size,bold).getmetrics()[0]
 svg.append(f'<text x="{x}" y="{y+asc-3}" font-family="DejaVu Sans,Arial,sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" fill="{fill}">{html.escape(s)}</text>')
def wrap(x,y,s,width=1030,size=24,leading=35,bold=False,fill=INK):
 words=s.split(); buf=''
 for word in words:
  trial=(buf+' '+word).strip()
  if draw.textlength(trial,font=font(size,bold))>width and buf:
   text(x,y,buf,size,bold,fill);y+=leading;buf=word
  else:buf=trial
 if buf:text(x,y,buf,size,bold,fill);y+=leading
 return y
rect(0,0,W,25,GREEN)
text(70,62,'HONEST LITTLE APPS / TIMECARD FIELD GUIDE',20,True,GREEN)
text(70,117,'7:45 is not 7.45 hours.',58,True)
wrap(70,196,'Same digits. Different duration. Read the column label before comparing a timecard.',size=25,leading=35)
rect(60,286,1080,280,PALE,18)
text(90,316,'HOURS : MINUTES',20,True,GREEN)
text(90,359,'7 hours + 45 minutes',40,True)
text(90,421,'45 ÷ 60 = 3/4 = 0.75 hour',32)
text(90,483,'7:45 = 7.75 decimal hours',35,True,GREEN)
cx,cy,r=978,423,99
draw.ellipse((cx-r,cy-r,cx+r,cy+r),fill=CREAM)
draw.pieslice((cx-r,cy-r,cx+r,cy+r),start=-90,end=180,fill=GREEN)
svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{CREAM}"/><path d="M{cx} {cy}L{cx} {cy-r}A{r} {r} 0 1 1 {cx-r} {cy}Z" fill="{GREEN}"/>')
for a in [0,90,180,270]:
 rad=math.radians(a-90);line(round(cx+82*math.cos(rad)),round(cy+82*math.sin(rad)),round(cx+99*math.cos(rad)),round(cy+99*math.sin(rad)),CREAM,3)
rect(cx-53,cy-36,106,72,CREAM,36);text(cx-45,cy-17,'45/60',25,True)
text(70,608,'COMPARE THE LAST PART OF THE HOUR',20,True,GREEN)
barx,barw=265,790
text(70,679,'7:45',33,True,GREEN);text(70,719,'45 minutes',20)
text(70,794,'7.45',33,True,ORANGE);text(70,834,'27 minutes',20)
for y,v,color in [(680,45,GREEN),(795,27,ORANGE)]:
 rect(barx,y,barw,48,'#e1e3da',4);rect(barx,y,barw*v/60,48,color,4)
for v in [0,15,30,45,60]:
 x=barx+barw*v/60;line(x,853,x,868,INK,2);text(x-13,876,str(v),20)
text(580,914,'Minutes within this hour',21)
text(70,964,'0.45 × 60 = 27 minutes',30,True,ORANGE)
wrap(70,1016,'So 7.45 decimal hours = 7 hours 27 minutes, or 447 minutes. 7 hours 45 minutes = 465 minutes. The difference is 18 minutes.',size=24,leading=34)
rect(60,1127,1080,147,PALE,14)
text(90,1153,'FOUR FICTIONAL ENTRIES',20,True,GREEN)
text(90,1192,'4 × (465 − 447) = 72 minutes',34,True)
text(90,1240,'A representation difference — not evidence of a payroll error.',22)
wrap(70,1301,'Ask which number format is used. Keep the original minutes and follow the documented rounding convention. These examples convert exactly.',size=21,leading=29,width=940)
line(70,1390,1130,1390)
text(70,1415,'Honest Little Apps publishes EarnCheck and this free companion.',19,True,GREEN)
text(70,1450,'Optional iPhone app: apps.apple.com/app/id6798048163',19)
text(70,1480,'Arithmetic education; no wage or payroll-accuracy determination.',16)
apple='https://apps.apple.com/us/app/earncheck-shift-pay-tracker/id6798048163'
code=qrencoder.QRCode(None,qrencoder.QRErrorCorrectLevel.M)
code.addData(apple);code.make();n=code.getModuleCount();module=3;extent=(n+8)*module
qx,qy=1135-extent,1500-extent
svg.append(f'<a xlink:href="{html.escape(apple,quote=True)}"><title>Open EarnCheck on the App Store</title>')
rect(qx,qy,extent,extent,'#ffffff')
qrpaths=[]
for row in range(n):
 for col in range(n):
  if code.isDark(row,col):
   x,y=qx+(col+4)*module,qy+(row+4)*module
   draw.rectangle((x,y,x+module-1,y+module-1),fill=INK)
   qrpaths.append(f'M{x},{y}h{module}v{module}h-{module}Z')
svg.append(f'<path d="{"".join(qrpaths)}" fill="{INK}"/>')
svg.append('</a>')
svg.append('</svg>')
(FOLDER/'timecard-quarter-hour-comparison.svg').write_text(''.join(svg))
im.save(FOLDER/'timecard-quarter-hour-comparison.png',optimize=True)
checks={
 '45minutes_is_three_quarters':Fraction(45,60)==Fraction(3,4),
 '7h45_to_decimal':Fraction(7)+Fraction(45,60)==Fraction(775,100),
 'decimal_7_45_is_447minutes':Fraction(745,100)*60==447,
 'duration_7_45_is_465minutes':7*60+45==465,
 'single_difference':465-447==18,
 'four_entries_difference':4*(465-447)==72,
 'quarters_sum_to_hour':sum([Fraction(1,4)]*4)==1
}
assert all(checks.values())
(ROOT/'timecard-visual-checks.json').write_text(json.dumps(checks,indent=2)+'\n')
print('7 exact arithmetic checks passed; SVG and PNG written.')
