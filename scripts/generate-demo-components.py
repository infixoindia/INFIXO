"""Generate demo-only translations from approved profile source; never edit public components.
Run from repo root. CSS and interaction logic come from the originals. Generated files are committed.
"""
from pathlib import Path
import re,json,hashlib,os
root=Path.cwd();out=root/'app/demo/worker/generated';out.mkdir(parents=True,exist_ok=True)
files=['WorkerIdentityCard/WorkerIdentityCard','HeroSlider/HeroSlider','ImagePreview/ImagePreview','WorkPhotos/WorkPhotos','WorkVideos/WorkVideos','WorkDetails/WorkDetails','WorkDetails/ServiceChips','WorkerDetails/WorkerDetails','NavigationTabs/NavigationTabs']
mapping={str((root/'app/components'/(f+'.js')).resolve()):out/(f.split('/')[-1]+'.js') for f in files}
labels=set();hashes={}
for f in files:
 src=root/'app/components'/(f+'.js');dest=mapping[str(src.resolve())];text=src.read_text();hashes[str(src.relative_to(root))]=hashlib.sha256(src.read_bytes()).hexdigest()
 # Redirect local component imports to their generated counterpart, but reuse the exact original CSS and helpers.
 def rewrite(m):
  raw=m.group(2)
  if not raw.startswith('.'):return m.group(0)
  resolved=(src.parent/raw).resolve();target=mapping.get(str(resolved)+'.js',resolved)
  relative=os.path.relpath(target,dest.parent);relative=relative if relative.startswith('.') else './'+relative
  return m.group(1)+relative+m.group(3)
 text=re.sub(r'((?:from\s*|import\s*\()\s*[\"\'])([^\"\']+)([\"\'])',rewrite,text)
 def translate(m):
  value=m.group(1).strip()
  if not value:return m.group(0)
  labels.add(value);return '>{tr('+json.dumps(value)+')}<'
 text=re.sub(r'(?<!=)>(\s*[A-Za-z][A-Za-z0-9 .?!&,:/’\-]*\s*)<',translate,text)
 for value in ['Show less','Show more','Close','Unmute','Mute','Hide Worker ID','Do you want to call this worker?','Do you want to open WhatsApp chat?']:
  # Only UI expressions and aria attributes; never touch JS control strings.
  for quote in ['"',"'"]:
   text=text.replace('aria-label='+quote+value+quote,'aria-label={tr('+json.dumps(value)+')}')
   text=text.replace('? '+quote+value+quote,'? tr('+json.dumps(value)+')').replace(': '+quote+value+quote,': tr('+json.dumps(value)+')')
  labels.add(value)
 for prefix in ['Go to slide','Show Worker ID','Work','Video Thumbnail']:
  text=text.replace('`'+prefix+' ${','`${tr('+json.dumps(prefix)+')} ${');labels.add(prefix)
 text=text.replace('${workerName} preview ${','${workerName} ${tr("preview")} ${');labels.add('preview')
 text=text.replace('{experience}+ Years','{experience}+ {tr("Years")}')
 text=text.replace('{worker?.experience}+ Years of experience','{worker?.experience}+ {tr("Years of experience")}')
 text=text.replace('in {worker?.primarySkill?.toLowerCase()} work','{tr("in")} {tr(worker?.primarySkill === "painter" ? "Painter" : worker?.primarySkill)} {tr("work")}')
 text=text.replace('{skillCategory?.label}','{tr(skillCategory?.label)}')
 # V4 demo-only content adaptations; retain original markup, CSS and interactions.
 if f.startswith('WorkerIdentityCard/'):
  text=text.replace('{experience}+ {tr("Years")}', '{experience}')
 if f.startswith('WorkDetails/WorkDetails'):
  text=text.replace('resolveSkillCategory(worker?.profession)', '({...resolveSkillCategory(worker?.profession),label:worker?.profession})')
  text=text.replace('{worker?.experience}+ {tr("Years of experience")} <br />\n    {tr("in")} {tr(worker?.primarySkill === "painter" ? "Painter" : worker?.primarySkill)} {tr("work")}', '{worker?.experience}')
  text=text.replace('{tr("Day")}', '{worker?.shiftLabel}')
 if f.startswith('WorkerDetails/'):
  text=text.replace('{worker?.fullName}', '{worker?.demoFullName}')
  start=text.index('      <div className={styles.card}>\n        <div className={styles.verificationHeader}>')
  end=text.index('    </section>',start)
  text=text[:start]+text[end:]
 if f.startswith('NavigationTabs/'):
  start=text.index('// Keeps digits')
  end=text.index('export default function',start)
  text=text[:start]+text[end:]
  text=text.replace('const phone = worker?.phone?.trim();','const phone = true; // Demo controls always available; no destination exists.')
  start=text.index('  const handleConfirm =')
  end=text.index('  return (',start)
  text=text[:start]+text[end:]
  text=text.replace('setConfirmAction("call")','onDemoContact()').replace('setConfirmAction("chat")','onDemoContact()')
  text=text.replace('queryString = ""','queryString = "", onDemoContact')
  text=text.replace('{tr("Contact")}', 'Call').replace('{tr("Chat")}', 'WhatsApp')
  start=text.index('      {confirmAction && (')
  end=text.index('    </div>\n  );',start)
  text=text[:start]+text[end:]
 text=re.sub(r'(export default function \w+\([^)]*\) \{)',r'\1\n  const tr = useDemoText();',text,count=1)
 text=re.sub(r'^[\"\']use client[\"\'];?\s*','',text)
 text="'use client';\n// GENERATED from "+str(src.relative_to(root))+". See scripts/generate-demo-components.py.\nimport {useDemoText} from '../DemoLocale';\n"+text
 dest.write_text(text)
(out/'source-hashes.json').write_text(json.dumps(hashes,indent=2)+'\n')
labels.update(['Years','Years of experience','in','work','Painter'])
(out/'translation-keys.json').write_text(json.dumps(sorted(labels),indent=2)+'\n')
print('Generated',len(files),'demo components; public source files untouched.')
