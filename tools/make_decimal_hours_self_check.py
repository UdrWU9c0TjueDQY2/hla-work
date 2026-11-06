from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from fractions import Fraction
from pathlib import Path
C=canvas.Canvas('decimal-hours-self-check.pdf',pagesize=letter)
C.setTitle('Decimal Hours Self-Check - Beyond Quarter Hours')
C.setAuthor('Honest Little Apps')
ink=HexColor('#173e35'); gray=HexColor('#52615a')
rows=[(4,6),(2,12),(5,18),(6,24),(3,36),(7,42),(1,48),(8,54)]
answers=[f'{h+m/60:.2f}' for h,m in rows]
assert answers==['4.10','2.20','5.30','6.40','3.60','7.70','1.80','8.90']
def text(x,y,s,size=11,bold=False,color=ink):
 C.setFillColor(color); C.setFont('Helvetica-Bold' if bold else 'Helvetica',size);C.drawString(x,y,s)
def line(y):
 C.setStrokeColor(HexColor('#c2cec5'));C.line(45,y,567,y)
def top(page,title,subtitle):
 text(45,750,'HONEST LITTLE APPS  /  TIMECARD PRACTICE',9,True)
 line(735); text(45,704,title,25,True);text(45,681,subtitle,11)
 text(45,42,'Original arithmetic practice. Fictional durations. No personal records needed.',9,color=gray)
 text(544,42,str(page),9,color=gray)
def rule(y):
 C.setFillColor(HexColor('#edf1e7'));C.roundRect(45,y-65,522,65,8,fill=1,stroke=0)
 text(60,y-22,'Whole hours + (minutes / 60) = decimal hours',14,True)
 text(60,y-44,'Every 6 minutes is 0.10 hour. Keep the two formats labelled.',11)
top(1,'Beyond quarter hours','A printable self-check for reading hours and minutes as decimal hours.')
rule(653)
text(45,562,'1. Convert each duration',16,True)
text(45,542,'Write the decimal hours. All eight examples convert exactly.',11)
for i,((h,m),a) in enumerate(zip(rows,answers)):
 col=i//4;row=i%4;x=45+col*270;y=506-row*41
 text(x,y,f'{chr(65+i)}.  {h} h {m:02d} min',12)
 C.line(x+132,y-3,x+240,y-3)
text(45,333,'2. Read the decimal backwards',16,True)
text(45,313,'Multiply the decimal part by 60 to find the minutes.',11)
for i,dec in enumerate(['6.10','2.40','1.70','5.90']):
 x=45+(i%2)*270;y=280-(i//2)*39
 text(x,y,f'{chr(73+i)}.  {dec} hours',12);C.line(x+116,y-3,x+240,y-3)
text(45,205,'3. Total three fictional durations',16,True)
text(45,183,'4 h 06 min + 6 h 24 min + 8 h 54 min',13,True)
text(45,160,'M. Total minutes __________   N. Hours and minutes __________',11)
text(45,137,'O. Decimal hours __________   Show the conversion below.',11)
line(113);line(88)
C.showPage()
top(2,'Check the reasoning','Use the answers to spot which step needs another look.')
rule(653)
text(45,562,'Forward conversions',16,True)
for i,((h,m),a) in enumerate(zip(rows,answers)):
 col=i//4;row=i%4;x=45+col*270;y=533-row*29
 text(x,y,f'{chr(65+i)}.  {h} + {m}/60 = {a} hours',12)
text(45,402,'Reverse conversions',16,True)
for i,(d,h,m) in enumerate([(6.10,6,6),(2.40,2,24),(1.70,1,42),(5.90,5,54)]):
 x=45+(i%2)*270;y=374-(i//2)*29
 text(x,y,f'{chr(73+i)}.  {d:.2f} hours = {h} h {m:02d} min',12)
text(45,303,'The three-duration total',16,True)
text(45,278,'246 + 384 + 534 = 1,164 minutes (M)',12)
text(45,254,'1,164 minutes = 19 hours 24 minutes (N)',12)
text(45,230,'19 + 24/60 = 19.40 decimal hours (O)',12,True)
text(45,206,'Cross-check: 4.10 + 6.40 + 8.90 = 19.40 hours.',12)
text(45,166,'Keep the source format',14,True)
text(45,145,'Read the column label before using a number. Retain the original minutes',11)
text(45,129,'when a conversion repeats, and follow the documented rounding convention.',11)
text(45,97,'Keep your own shift records with EarnCheck on iPhone.',11,True)
C.linkURL('https://apps.apple.com/ca/app/earncheck-shift-pay-tracker/id6798048163',(45,92,400,110),relative=0)
text(45,79,'Free tier and optional Pro subscription. Check current limits in the App Store.',9)
assert 246+384+534==1164 and Fraction(1164,60)==Fraction(194,10)
C.save()
