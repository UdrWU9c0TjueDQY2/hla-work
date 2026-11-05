"""Make the reusable BookingSolved move decision worksheet. Run with reportlab."""
from pathlib import Path
import sys
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor,white
out=Path(sys.argv[1] if len(sys.argv)>1 else 'appointment-move-sheet.pdf')
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
fonts=Path('/usr/share/fonts/truetype/dejavu')
for name,file in [('PrintBody','DejaVuSans.ttf'),('PrintBold','DejaVuSans-Bold.ttf'),('PrintTitle','DejaVuSerif-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(fonts/file)))
c=canvas.Canvas(str(out),pagesize=letter,pageCompression=1)
c.setTitle('Can this appointment move?');c.setAuthor('Honest Little Apps')
ink=HexColor('#153E45');shade=HexColor('#EDF4EE');line=HexColor('#8DA6A3');accent=HexColor('#276750')
def txt(x,y,s,size=10,font='Helvetica',color=ink):
    f={'Helvetica':'PrintBody','Helvetica-Bold':'PrintBold','Times-Bold':'PrintTitle'}[font]
    size=min(size,(570-x)/max(1,pdfmetrics.stringWidth(s,f,1)))
    c.setFillColor(color);c.setFont(f,size);c.drawString(x,y,s)
def rule(y):
    c.setStrokeColor(line);c.setLineWidth(.6);c.line(42,y,570,y)
def field(name,x,y,w,tip):
    c.acroForm.textfield(name=name,tooltip=tip,x=x,y=y,width=w,height=23,fontSize=10,fontName='Helvetica',borderWidth=.65,borderStyle='underlined',borderColor=line,fillColor=white,textColor=ink,maxlen=100,forceBorder=True)
txt(42,752,'HONEST LITTLE APPS     /     BOOKINGSOLVED',9,'Helvetica-Bold',accent)
txt(42,712,'Can this appointment move?',31,'Times-Bold')
txt(42,685,'Keep the original time visible while you test a replacement. Use local times',12)
txt(42,668,'and a booking reference instead of a client name. No calendar changes happen here.',12)
rule(649)
txt(42,622,'1   Keep the original on record',16,'Times-Bold')
txt(42,602,'Existing date, start and finish');txt(345,602,'Booking reference (optional)')
field('original',42,572,280,'Existing date, start and finish');field('reference',345,572,225,'Optional booking reference')
txt(42,548,'Requested date');txt(203,548,'Service minutes');txt(350,548,'Cleanup minutes')
field('requested',42,517,142,'Requested date');field('service',203,517,126,'Service minutes');field('cleanup',350,517,220,'Cleanup minutes')
rule(502)
txt(42,476,'2   Test two proposed starts',16,'Times-Bold')
txt(42,457,'Earliest start is when the previous booking and its cleanup finish. Finish the new',10)
txt(42,442,'service and its cleanup by the next commitment. Equality fits; overlap does not.',10)
txt(42,420,'Earliest available start');txt(314,420,'Next fixed commitment')
field('earliest',42,390,246,'Earliest available start');field('next',314,390,256,'Next fixed commitment')
for j,(x,w,label) in enumerate([(42,122,'Proposed start'),(179,109,'Service ends'),(303,137,'Cleanup ends'),(455,115,'Fits?')]):
    txt(x,370,label,10,'Helvetica-Bold')
    field('a'+str(j),x,338,w,'Option A: '+label);field('b'+str(j),x,309,w,'Option B: '+label)
c.setFillColor(shade);c.roundRect(42,199,528,91,9,fill=1,stroke=0)
txt(55,266,'Worked example',12,'Helvetica-Bold',accent)
txt(55,249,'A Tuesday 09:00 booking is being moved to Thursday. Thursday opens at 14:15.',10)
txt(55,233,'Next booking starts 15:15. Service: 40 min. Cleanup: 10 min.',10)
txt(55,217,'14:20 + 40 + 10 = 15:10 (fits). 14:30 + 40 + 10 = 15:20 (5 min too late).',10)
txt(42,171,'3   Close the loop',16,'Times-Bold')
txt(42,153,'Record the state: offered / accepted / declined / still checking. Check the live calendar',10)
txt(42,138,'again before changing anything. If the move is accepted, record when the old slot closes.',10)
txt(42,116,'Decision, agreed replacement, and what happens to the original')
field('decision',42,83,528,'Decision, agreed replacement and what happens to original')
rule(66)
txt(42,47,'Printable planning sheet  |  No messages are sent.',9)
txt(42,30,'Open the online example',9,'Helvetica-Bold',accent)
txt(398,30,'BookingSolved on the App Store',9,'Helvetica-Bold',accent)
c.linkURL('https://udrwu9c0tjuedqy2.github.io/hla-work/bookingsolved/booking-request-checklist/#move-sheet',(42,26,176,42),relative=0,thickness=0)
c.linkURL('https://apps.apple.com/us/app/bookingsolved-client-booking/id6800187784',(397,26,570,42),relative=0,thickness=0)
c.showPage();c.save()
