#!/usr/bin/env python3
import urllib.request
import base64
import os
import json
from pathlib import Path

HERO_URLS = {
    'monesy': 'https://yt3.googleusercontent.com/KrFnk2IovRgk5dXcUk9qKlkDT1hL063Iq8VeJKkfWjZOMnuineI4YO1Fd5UDZTCkDddN2mgr=s900-c-k-c0x00ffffff-no-rj',
    'wesker': 'https://assets-prd.ignimgs.com/2022/06/06/pjimage-2022-06-06t165441-445-1654548897379.jpg',
    'minos': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ6zYVCmTwp581qsNSFqh-PqPRZdiLhI7hKZ3fYSfOw1G_Vq5vrUZ5T98&s=10',
    'axe': 'https://static.wikia.nocookie.net/dota2_gamepedia/images/2/23/Axe_icon.png/revision/latest?cb=20160411211422',
    'pudge': 'https://static.wikia.nocookie.net/dota2_gamepedia/images/c/c0/Pudge_icon.png/revision/latest?cb=20160411211506',
    'sf': 'https://i.pinimg.com/1200x/a5/f0/2d/a5f02dfb40a59019548250280ca23cc0.jpg',
    'rubick': 'https://static.wikia.nocookie.net/dota2_gamepedia/images/8/8a/Rubick_icon.png/revision/latest?cb=20160411215614',
    'invoker': 'https://static.wikia.nocookie.net/dota2_gamepedia/images/0/00/Invoker_icon.png/revision/latest?cb=20160411220849',
    'gojo': 'https://i1.sndcdn.com/artworks-qZfATk0MDLX9WrA1-ybH2yg-t500x500.jpg',
    'sukuna': 'https://static.kinoafisha.info/k/articles/776/upload/articles/124504663753.jpg',
    'katarina': 'https://i.pinimg.com/736x/e6/ae/db/e6aedbb89c8e7bd1fe7cc7bc56e8d48b.jpg',
    'anderson': 'https://static.wikia.nocookie.net/shellsing/images/f/ff/Hellsing_OVA_01_-BDrip-_%28Alukar%29.avi.%D0%A1%D1%82%D0%B0%D1%82%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B5_001.jpg/revision/latest?cb=20190302210521&path-prefix=ru',
    'schrodinger': 'https://static.wikia.nocookie.net/shellsing/images/2/2c/24790612_ap.jpg/revision/latest?cb=20190302204220&path-prefix=ru',
    'alucard': 'https://static.wikia.nocookie.net/shellsing/images/1/1f/Alucardanddcasull.png/revision/latest?cb=20170909134737&path-prefix=ru',
    'gabriel': 'https://images.steamusercontent.com/ugc/1613933246234626847/AA558BE79621E7F9CFE9D56FEFCE088992124842/?imw=512&imh=512&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true',
    'hunk': 'https://images.steamusercontent.com/ugc/2510275718587102591/768732A1827984D378B5EF61EDA568A179A6F326/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true',
}

def main():
    root = Path(__file__).resolve().parent.parent
    avatars_dir = root / 'public' / 'avatars'
    avatars_dir.mkdir(parents=True, exist_ok=True)
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    hero_portraits = {}
    hero_avatar_files = {}

    for hero_id, url in HERO_URLS.items():
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
                content_type = resp.headers.get_content_type()
                if not content_type or content_type == 'application/octet-stream':
                    content_type = 'image/jpeg'
                
                # File extension
                ext = 'jpg'
                if 'webp' in content_type:
                    ext = 'webp'
                elif 'png' in content_type:
                    ext = 'png'
                elif 'svg' in content_type:
                    ext = 'svg'

                # Save to public/avatars
                file_name = f"{hero_id}_avatar.{ext}"
                file_path = avatars_dir / file_name
                file_path.write_bytes(data)

                # Base64
                b64 = base64.b64encode(data).decode('utf-8')

                # Create SVG wrapper
                # URL-encode SVG content
                svg_xml = (
                    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">'
                    f'<defs><clipPath id="c_{hero_id}"><rect width="120" height="120" rx="16"/></clipPath></defs>'
                    f'<rect width="120" height="120" rx="16" fill="#0b0f19"/>'
                    f'<g clip-path="url(#c_{hero_id})">'
                    f'<image href="data:{content_type};base64,{b64}" width="120" height="120" preserveAspectRatio="xMidYMid slice"/>'
                    f'</g>'
                    f'</svg>'
                )
                from urllib.parse import quote
                data_uri = f'data:image/svg+xml;utf8,{quote(svg_xml)}'

                hero_portraits[hero_id] = data_uri
                hero_avatar_files[hero_id] = f"./avatars/{file_name}"
                print(f"Downloaded {hero_id}: {len(data)} bytes ({content_type}) -> {file_name}")
        except Exception as e:
            print(f"ERROR downloading {hero_id} from {url}: {e}")
            raise

    # Write src/assets/heroPortraits.js
    portraits_file = root / 'src' / 'assets' / 'heroPortraits.js'

    code = [
        "/**",
        " * Hero Portraits Asset Registry:",
        " * High-definition authentic portraits from Google Doc specifications.",
        " * Each hero is packaged in a self-contained SVG Data URI for zero-broken-link reliability.",
        " */",
        "",
        "export const HERO_PORTRAITS = {",
    ]

    for hero_id in HERO_URLS.keys():
        uri = hero_portraits[hero_id]
        code.append(f"  {hero_id}: {json.dumps(uri)},")

    code.append("};")
    code.append("")
    code.append("export const HERO_AVATAR_FILES = {")
    for hero_id in HERO_URLS.keys():
        fpath = hero_avatar_files[hero_id]
        code.append(f"  {hero_id}: {json.dumps(fpath)},")
    code.append("};")
    code.append("")
    code.extend([
        "/**",
        " * Returns portrait URL for a hero id, with safe fallback.",
        " */",
        "export function getHeroPortrait(heroId) {",
        "  return HERO_PORTRAITS[heroId] || HERO_PORTRAITS.wesker;",
        "}",
        "",
        "// Preloaded image cache for smooth Canvas rendering",
        "const heroImageCache = new Map();",
        "",
        "export function getHeroCanvasImage(heroId) {",
        "  if (heroImageCache.has(heroId)) {",
        "    return heroImageCache.get(heroId);",
        "  }",
        "  if (typeof Image === 'undefined') return null;",
        "  const img = new Image();",
        "  img.src = getHeroPortrait(heroId);",
        "  heroImageCache.set(heroId, img);",
        "  return img;",
        "}",
        "",
        "// Preload all character portraits in browser environment",
        "if (typeof window !== 'undefined' && typeof Image !== 'undefined') {",
        "  Object.keys(HERO_PORTRAITS).forEach(id => {",
        "    getHeroCanvasImage(id);",
        "  });",
        "}",
        "",
    ])

    portraits_file.write_text('\n'.join(code), encoding='utf-8')
    print("Successfully wrote src/assets/heroPortraits.js!")

if __name__ == '__main__':
    main()
