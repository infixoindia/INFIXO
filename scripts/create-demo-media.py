"""Original category-neutral demo placeholders, never real client work."""
from pathlib import Path
import subprocess
p=Path('public/demo-media');p.mkdir(parents=True,exist_ok=True)
for n,bg in enumerate(['#e9effa','#f7eadc'],1):
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960"><rect width="720" height="960" fill="{bg}"/><circle cx="360" cy="365" r="210" fill="#ffffff" opacity=".6"/><circle cx="360" cy="315" r="90" fill="#8194b3"/><path d="M170 620v-55c0-110 85-160 190-160s190 50 190 160v55" fill="#526c98"/><rect x="260" y="715" width="200" height="8" rx="4" fill="#b9c6db"/><rect x="305" y="741" width="110" height="8" rx="4" fill="#ccd5e4"/></svg>'
 (p/f'identity-{n}.svg').write_text(svg)
colors=[('#e5edff','#5676ad'),('#e1f1ed','#4d897a'),('#fff0db','#bc8844'),('#ece8fa','#8170ad'),('#f5e5ea','#ac7085'),('#e4eff5','#5e8da7')]
for n,(bg,ink) in enumerate(colors,1):
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960"><rect width="720" height="960" fill="{bg}"/><circle cx="{120+n*45}" cy="180" r="210" fill="white" opacity=".35"/><rect x="100" y="225" width="520" height="440" rx="36" fill="white" opacity=".8"/><rect x="155" y="285" width="410" height="270" rx="20" fill="none" stroke="{ink}" stroke-width="14"/><circle cx="440" cy="350" r="30" fill="{ink}"/><path d="m166 535 115-125 85 80 57-54 132 104" fill="none" stroke="{ink}" stroke-width="14" stroke-linejoin="round"/><rect x="220" y="595" width="280" height="10" rx="5" fill="{ink}" opacity=".35"/><circle cx="360" cy="765" r="30" fill="white"/><text x="360" y="775" text-anchor="middle" font-family="sans-serif" font-size="28" fill="{ink}">{n:02}</text></svg>'
 (p/f'work-{n}.svg').write_text(svg)
 if n<=2:
  tmp=Path('/tmp')/f'infixo-demo-neutral-{n}.png';subprocess.run(['node','-e',"require('sharp')(process.argv[1]).resize(540,720).png().toFile(process.argv[2])",str(p/f'work-{n}.svg'),str(tmp)],check=True)
  subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-loop','1','-i',str(tmp),'-vf',"zoompan=z='min(zoom+0.0005,1.12)':d=150:s=540x720:fps=25",'-t','6','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart','-an',str(p/f'work-{n}.mp4')],check=True)
(p/'LICENSE.txt').write_text('Original neutral avatar silhouettes, gallery placeholders and animated demonstration clips created for INFIXO. No real worker identity or completed client projects. INFIXO may use and modify these assets.\n')
