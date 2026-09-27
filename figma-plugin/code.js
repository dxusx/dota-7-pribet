// Antigravity Figma Live Bridge - Complete Card Generator

figma.showUI(__html__, { width: 340, height: 320, title: "⚡ Antigravity AI Bridge" });

async function loadFonts() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
}

// Clean up previous overlapping/floating text nodes outside official cards
function cleanupPreviousNodes() {
  const allNodes = figma.currentPage.findAll(n => {
    if (n.type === 'TEXT') {
      const chars = n.characters;
      const isLoose = !n.parent || n.parent.type === 'PAGE';
      const x = n.x || 0;
      const isOldGen = (Math.abs(x - 29000) < 2500 || Math.abs(x - 36000) < 2500) && isLoose;
      const isBadgeNumber = chars === '1' && (Math.abs(x - 26160) < 1000 || Math.abs(x - 33160) < 1000 || Math.abs(x - 12390) < 1000);
      const isOurGen = chars.includes('Satoru Gojo') || chars.includes('Ryomen Sukuna') ||
                       chars.includes('Прокаст QQW') || chars.includes('Прокаст QQE') ||
                       chars.includes('Прокаст WWW') || chars.includes('Прокаст WWQ') ||
                       chars.includes('Прокаст WWE') || chars.includes('Прокаст EEE') ||
                       chars.includes('Прокаст EEQ') || chars.includes('Прокаст EEW') ||
                       chars.includes('Прокаст QWE') || chars.includes('Ульта “Invoke”');
      return (isOurGen && isLoose) || isOldGen || isBadgeNumber;
    }
    if (n.name && (
      n.name.startsWith('Card: Satoru Gojo') || 
      n.name.startsWith('Card: Ryomen Sukuna') || 
      n.name.startsWith('Stats: ') ||
      n.name.includes('Level Badge')
    )) {
      return true;
    }
    return false;
  });

  for (const node of allNodes) {
    try { node.remove(); } catch(e) {}
  }
}

// Helper to create styled text inside a parent container
function addText(parent, text, x, y, width, fontSize = 120, isBold = false, color = { r: 1, g: 1, b: 1 }) {
  const node = figma.createText();
  node.fontName = { family: "Inter", style: isBold ? "Bold" : "Regular" };
  node.fontSize = fontSize;
  node.characters = text;
  node.x = x;
  node.y = y;
  node.resize(width, node.height);
  node.textAutoResize = "HEIGHT";
  node.fills = [{ type: 'SOLID', color }];
  parent.appendChild(node);
  return node;
}

// Build complete card for Satoru Gojo or Ryomen Sukuna
async function buildHeroCard({
  heroName,
  title,
  themeColor,
  borderColor,
  badgeColor,
  avatarBytes,
  startX,
  skills,
  stats
}) {
  const startY = -2956;
  const cardWidth = 5500;

  // 1. Main Card Frame
  const card = figma.createFrame();
  card.name = `Card: ${heroName}`;
  card.x = startX;
  card.y = startY;
  card.resize(cardWidth, 3000);
  card.cornerRadius = 180;
  card.fills = [{ type: 'SOLID', color: themeColor }];
  card.strokes = [{ type: 'SOLID', color: borderColor }];
  card.strokeWeight = 20;
  card.clipsContent = false;
  figma.currentPage.appendChild(card);

  // 2. Avatar Rectangle
  const avatarX = 160;
  const avatarY = 100;
  const avatarW = 880;
  const avatarH = 1200;

  const avatarRect = figma.createRectangle();
  avatarRect.name = `${heroName} Portrait`;
  avatarRect.x = avatarX;
  avatarRect.y = avatarY;
  avatarRect.resize(avatarW, avatarH);
  avatarRect.cornerRadius = 80;
  avatarRect.strokes = [{ type: 'SOLID', color: borderColor }];
  avatarRect.strokeWeight = 10;

  if (avatarBytes && avatarBytes.length > 0) {
    try {
      const img = figma.createImage(new Uint8Array(avatarBytes));
      avatarRect.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: img.hash }];
    } catch (e) {
      avatarRect.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
    }
  } else {
    avatarRect.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
  }
  card.appendChild(avatarRect);

  // 3. Title & Subtitle (Next to Avatar)
  const textLeftX = avatarX + avatarW + 100; // 1140
  const topTextWidth = cardWidth - textLeftX - 160; // ~4200

  addText(card, heroName, textLeftX, avatarY, topTextWidth, 200, true, { r: 1, g: 1, b: 1 });
  addText(card, title, textLeftX, avatarY + 230, topTextWidth, 110, false, borderColor);

  // 4. Skills layout with DYNAMIC positioning (NEVER OVERLAPS)
  let curSideY = avatarY + 390;

  // Skills 1 to 3 are placed on the side of avatar
  for (let i = 0; i < Math.min(3, skills.length); i++) {
    const s = skills[i];
    const sText = `Скилл ${i + 1} “${s.name}”: ${s.desc}`;
    const tNode = addText(card, sText, textLeftX, curSideY, topTextWidth, 115, false);
    curSideY += tNode.height + 60; // dynamic advance with 60px gap
  }

  // Skills 4, 5 (and Ult) are placed FULL WIDTH below avatar
  let curFullY = Math.max(avatarY + avatarH + 100, curSideY + 60);
  const fullWidth = cardWidth - (avatarX * 2); // 5180

  for (let i = 3; i < skills.length; i++) {
    const s = skills[i];
    const prefix = s.isUlt ? `Ульта “${s.name}”` : `Скилл ${i + 1} “${s.name}”`;
    const sText = `${prefix}: ${s.desc}`;
    const isUlt = s.isUlt;
    const tNode = addText(
      card, 
      sText, 
      avatarX, 
      curFullY, 
      fullWidth, 
      120, 
      false, 
      isUlt ? { r: 1, g: 0.9, b: 0.5 } : { r: 1, g: 1, b: 1 }
    );
    curFullY += tNode.height + 70;
  }

  // Final Card Height adjustment with bottom padding
  const finalCardHeight = curFullY + 120;
  card.resize(cardWidth, finalCardHeight);

  // 5. Level Badge ("1") below card
  const badgeY = startY + finalCardHeight + 150;
  const badgeCircle = figma.createEllipse();
  badgeCircle.name = `${heroName} Level Badge`;
  badgeCircle.x = startX + 160;
  badgeCircle.y = badgeY;
  badgeCircle.resize(500, 500);
  badgeCircle.fills = [{ type: 'SOLID', color: badgeColor }];
  badgeCircle.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  badgeCircle.strokeWeight = 12;
  figma.currentPage.appendChild(badgeCircle);

  const badgeText = figma.createText();
  badgeText.fontName = { family: "Inter", style: "Bold" };
  badgeText.fontSize = 240;
  badgeText.characters = "1";
  badgeText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  badgeText.x = badgeCircle.x + 180;
  badgeText.y = badgeCircle.y + 100;
  figma.currentPage.appendChild(badgeText);

  // 6. Stats Rectangle
  const statsBox = figma.createRectangle();
  statsBox.name = `Stats: ${heroName}`;
  statsBox.x = startX + 400;
  statsBox.y = badgeY + 250;
  statsBox.resize(1350, 2350);
  statsBox.cornerRadius = 180;
  statsBox.fills = [{ type: 'SOLID', color: themeColor }];
  statsBox.strokes = [{ type: 'SOLID', color: borderColor }];
  statsBox.strokeWeight = 12;
  figma.currentPage.appendChild(statsBox);

  const statsTextNode = figma.createText();
  statsTextNode.fontName = { family: "Inter", style: "Regular" };
  statsTextNode.fontSize = 110;
  statsTextNode.characters = stats;
  statsTextNode.x = statsBox.x + 150;
  statsTextNode.y = statsBox.y + 150;
  statsTextNode.resize(1050, statsTextNode.height);
  statsTextNode.textAutoResize = "HEIGHT";
  statsTextNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  figma.currentPage.appendChild(statsTextNode);

  return card;
}

// Build / Complete Invoker in Column 7
async function completeInvoker(invokerBytes) {
  const startX = 12390;
  const cardWidth = 5500;

  // Find or create Invoker's card frame
  let card = figma.currentPage.findOne(n => n.type === 'RECTANGLE' && n.name === 'Rectangle 13');
  
  const spells = [
    { name: 'QQW “Ghost Walk”', desc: 'Невидимость на 16-32 секунды. Все противники вокруг замедляются на 20/30/40%. Применение: 0 сек. 100 маны. КД 24 сек. Активное.' },
    { name: 'QQE “Ice Wall”', desc: 'Воздвигает стену вечного льда шириной 5 клеток. Враги замедляются на 40/60/80% и получают 20/30/40 урона/сек. Каст 1 сек. 125 маны. КД 16 сек. Активное.' },
    { name: 'WWW “EMP”', desc: 'Взрывает область радиусом 4 клетки: сжигает 50/100/150/200 маны и наносит чистый урон, равный сожженной мане. Каст 2 сек. 125 маны. КД 24 сек. Активное.' },
    { name: 'WWQ “Tornado”', desc: 'Запускает стремительный вихрь на 12/16/20/24 клетки. Поднимает врагов в воздух на 2/3/4 сек (неуязвимы и оглушены), наносит 80/140/200 урона. Каст 1 сек. 125 маны. КД 20 сек. Активное.' },
    { name: 'WWE “Alacrity”', desc: 'Наполняет тело электрическим зарядом: +20/40/60/80 к базовому урону и +50% к скорости атак на 8 секунд (1 ход). Каст 0 сек. 60 маны. КД 12 сек. Активное.' },
    { name: 'EEE “Sun Strike”', desc: 'Сфокусированный луч солнца в любую клетку всей 2D карты! Наносит 120/240/360/480 ЧИСТОГО урона (игнорирует всю броню). Каст 2 сек. 150 маны. КД 20 сек. Активное.' },
    { name: 'EEQ “Forge Spirit”', desc: 'Призывает духа огня (ХП 100/150/200, урон 30/45/60). Каждая атака духа снижает броню врага на 1. Каст 1 сек. 75 маны. КД 24 сек. Активное.' },
    { name: 'EEW “Chaos Meteor”', desc: 'Обрушивает метеорит, катящийся вперед на 8 клеток: 150/250/350 урона + периодическое горение 50/сек на 4 сек. Каст 1.5 сек. 175 маны. КД 40 сек. Активное.' },
    { name: 'QWE “Deafening Blast”', desc: 'Звуковая волна отталкивает всех врагов на 4 клетки, наносит 80/160/240/320 урона и ПОЛНОСТЬЮ ОБЕЗОРУЖИВАЕТ на 4/6/8 сек! Каст 1 сек. 150 маны. КД 32 сек. Активное.' },
    { name: 'Invoke', desc: 'Синтезирует 3 активные сферы в сокрушительное заклинание. Перезарядка: 8/4/1 секунда. Каст 0 сек. 20/10/0 маны. Активное.', isUlt: true }
  ];

  let curY = -1750; // Below Cold Snap
  const textX = startX + 160;
  const fullWidth = cardWidth - 320; // 5180

  for (const s of spells) {
    const prefix = s.isUlt ? `Ульта “${s.name}”` : `Прокаст ${s.name}`;
    const textNode = figma.createText();
    textNode.fontName = { family: "Inter", style: "Regular" };
    textNode.fontSize = 120;
    textNode.characters = `${prefix}: ${s.desc}`;
    textNode.x = textX;
    textNode.y = curY;
    textNode.resize(fullWidth, textNode.height);
    textNode.textAutoResize = "HEIGHT";
    textNode.fills = [{ type: 'SOLID', color: s.isUlt ? { r: 1, g: 0.9, b: 0.4 } : { r: 1, g: 1, b: 1 } }];
    figma.currentPage.appendChild(textNode);
    curY += textNode.height + 70; // dynamic spacing
  }

  // Resize Rectangle 13 if it exists
  if (card) {
    card.resize(5500, curY - (-2956) + 120);
  }

  // Level Badge
  const badgeY = curY + 120;
  const badgeCircle = figma.createEllipse();
  badgeCircle.name = "Invoker Level Badge";
  badgeCircle.x = startX + 160;
  badgeCircle.y = badgeY;
  badgeCircle.resize(500, 500);
  badgeCircle.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.75, b: 0.2 } }];
  badgeCircle.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  badgeCircle.strokeWeight = 12;
  figma.currentPage.appendChild(badgeCircle);

  const badgeText = figma.createText();
  badgeText.fontName = { family: "Inter", style: "Bold" };
  badgeText.fontSize = 240;
  badgeText.characters = "1";
  badgeText.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  badgeText.x = badgeCircle.x + 180;
  badgeText.y = badgeCircle.y + 100;
  figma.currentPage.appendChild(badgeText);

  // Stats Box
  const statsBox = figma.createRectangle();
  statsBox.name = "Stats: Invoker";
  statsBox.x = startX + 400;
  statsBox.y = badgeY + 250;
  statsBox.resize(1350, 2350);
  statsBox.cornerRadius = 180;
  statsBox.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.18, b: 0.1 } }];
  statsBox.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.75, b: 0.2 } }];
  statsBox.strokeWeight = 12;
  figma.currentPage.appendChild(statsBox);

  const statsTextNode = figma.createText();
  statsTextNode.fontName = { family: "Inter", style: "Regular" };
  statsTextNode.fontSize = 110;
  statsTextNode.characters = "хп: 100\nрег: +2/х\nмана: 150\nвос: +15/х\nУрон: 45\nПериод: 4\nКрит: 75\nДальность: 15\nПробитие: 10\nПопадание: 40\nСкорость: 6\nБроня: 2\nЛовкость: 2";
  statsTextNode.x = statsBox.x + 150;
  statsTextNode.y = statsBox.y + 150;
  statsTextNode.resize(1050, statsTextNode.height);
  statsTextNode.textAutoResize = "HEIGHT";
  statsTextNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  figma.currentPage.appendChild(statsTextNode);
}

// Master Generator
async function runFullGeneration(data) {
  figma.notify("Генерация карточек с рамками и портретами...");
  await loadFonts();

  // 1. Clean previous messy nodes
  cleanupPreviousNodes();

  // 2. Complete Invoker
  await completeInvoker(data.invokerBytes);

  // 3. Satoru Gojo (Column 9 at X = 26000)
  const gojoCard = await buildHeroCard({
    heroName: "Satoru Gojo",
    title: "The Honored One | Сильнейший Маг Современности",
    themeColor: { r: 13/255, g: 20/255, b: 36/255 }, // Dark Navy
    borderColor: { r: 56/255, g: 189/255, b: 248/255 }, // Glowing Cyan
    badgeColor: { r: 2/255, g: 132/255, b: 199/255 },
    avatarBytes: data.gojoBytes,
    startX: 26000,
    skills: [
      { name: "Infinity", desc: "Пространство вокруг Годжо бесконечно делится: тратит 15 маны за удар, поглощая 25/35/45/55% урона. Если мана на 0, барьер спадает! Встроенное. Пассивное." },
      { name: "Lapse: Blue", desc: "Точка отрицательного пространства на расстоянии до 10 клеток. Стягивает врагов в радиусе 2 клеток к центру и наносит 30/60/90/120 урона сжатия. Применение 1 сек. 35/50/65/80 ПЭ (маны). Перезарядка 16/12/8/4 сек. Активное." },
      { name: "Reversal: Red", desc: "Вливает обратную проклятую энергию: отталкивает цель на 3 клетки назад, нанося 40/75/110/145 урона (+30 урона при ударе об стену/препятствие). Применение 1 сек. 40/55/70/85 ПЭ. Перезарядка 16/12/8/4 сек. Активное." },
      { name: "Hollow Purple", desc: "Слияние Синего и Красного: мнимая масса летит через 12 клеток по прямой и наносит 80/140/200/260 ЧИСТОГО урона сквозь любые укрытия! Каст 2 сек. 80/100/120/140 ПЭ. КД 32/24/16/12 сек. Активное." },
      { name: "Domain: Unlimited Void", desc: "Расширение Территории на область 3x3 клетки. Перегружает мозг всех врагов внутри бесконечной информацией: оглушение на 8/12/16 сек (1/1.5/2 хода)! Каст 0 сек. 120 ПЭ. КД 120/90/60 сек. Активное.", isUlt: true }
    ],
    stats: "хп: 100\nрег: +2/х\nмана: 120\nвос: +12/х\nУрон: 40 (Black Flash)\nПериод: 4\nКрит: 80\nДальность: 1\nПробитие: 10\nПопадание: 85\nСкорость: 6\nБроня: 2\nЛовкость: 3"
  });

  // 4. Ryomen Sukuna (Column 10 at X = 33000)
  const sukunaCard = await buildHeroCard({
    heroName: "Ryomen Sukuna",
    title: "King of Curses | Король Проклятий",
    themeColor: { r: 35/255, g: 10/255, b: 12/255 }, // Dark Blood Crimson
    borderColor: { r: 239/255, g: 68/255, b: 68/255 }, // Blood Red
    badgeColor: { r: 185/255, g: 28/255, b: 28/255 },
    avatarBytes: data.sukunaBytes,
    startX: 33000,
    skills: [
      { name: "King of Curses", desc: "Тело Сукуны — смертоносный яд: ПОЛНЫЙ ИММУНИТЕТ к ядам, кровотечениям и гниению (Rot Пуджа не наносит урона). За убийство героя поглощает палец: +5 к макс. ХП и +3 к базовому урону (макс. +50 ХП / +30 урона). Встроенное. Пассивное." },
      { name: "Dismantle", desc: "Невидимый летящий разрез на расстояние до 12 клеток. Наносит 35/70/105/140 физического урона с бронепробитием 15. Каст 0 сек (мгновенно). 30/40/50/60 ПЭ (маны). КД 8/6/4/2 сек. Активное." },
      { name: "Cleave", desc: "Разрез вблизи (дальность 2 клетки), подстраивающийся под плотность цели: ПОЛНОСТЬЮ ИГНОРИРУЕТ 100% БРОНИ цели и наносит 40/75/110/145 чистого урона! Каст 1 сек. 45/60/75/90 ПЭ. КД 12/10/8/6 сек. Активное." },
      { name: "Furnace: «Open»", desc: "Сукуна произносит «Откройся» (Fuuga) и выпускает пылающую стрелу, взрывающую область 3x3 клетки: 60/110/160/210 урона по площади на дальность до 10 клеток. Каст 2 сек. 70/90/110/130 ПЭ. КД 24/20/16/12 сек. Активное." },
      { name: "Domain: Malevolent Shrine", desc: "Призывает открытый домен без барьера радиусом 4 клетки. Каждый ход наносит бурю непрерывных разрезов: 30/60/90 периодического урона по всем врагам в течение 8 сек (1 ход). Каст 0 сек. 100/125/150 ПЭ. КД 100/80/60 сек. Активное.", isUlt: true }
    ],
    stats: "хп: 110\nрег: +3/х\nмана: 100\nвос: +10/х\nУрон: 45\nПериод: 4\nКрит: 85\nДальность: 12\nПробитие: 15\nПопадание: 55\nСкорость: 6\nБроня: 4\nЛовкость: 2"
  });

  figma.viewport.scrollAndZoomIntoView([gojoCard, sukunaCard]);
  figma.notify("Готово! Карточки Годжо и Сукуны с портретами созданы без наслоений!");
}

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.action === 'GENERATE_FULL_CARDS' || msg.action === 'CREATE_HEROES') {
      await runFullGeneration(msg.data || {});
      figma.ui.postMessage({
        type: 'RESULT',
        commandId: msg.id,
        success: true,
        message: "Карточки успешно пересозданы с рамками, картинками и динамической версткой!"
      });
      return;
    }

    if (msg.action === 'EVAL' && msg.code) {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction('figma', msg.code);
      const res = await fn(figma);
      figma.ui.postMessage({
        type: 'RESULT',
        commandId: msg.id,
        success: true,
        result: res
      });
      return;
    }
  } catch (err) {
    figma.notify(`Ошибка: ${err.message}`, { error: true });
    figma.ui.postMessage({
      type: 'RESULT',
      commandId: msg.id,
      success: false,
      message: err.message
    });
  }
};
