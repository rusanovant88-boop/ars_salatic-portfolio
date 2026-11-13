// Site language always starts in English. No localStorage, cookies or URL params.
// Visual asset names and Vimeo films remain language-independent.
(function initSalaticLanguages(){
  'use strict';
  const russianProjects={
  "setka": {
    "title": "setka. карьерные джунгли",
    "paragraphs": [
      "В карьерных джунглях легко потеряться и остаться незамеченным. Для Setka, профессиональной сети от hh.ru, мы придумали кампанию о том, как находить полезные знакомства и двигаться вперёд. Нужно было заинтересовать айтишников, цифровых специалистов и креативную индустрию при ограниченном бюджете.",
      "Визуальная идея превратила привычные офисы в настоящие джунгли: кофейные водопады, стены из клавиатур, HR-леопард и рабочие пространства, заросшие растительностью. Через этот мир мы показали три возможности Setka: знакомиться, делиться опытом и открывать новое."
    ]
  },
  "litres": {
    "title": "литрес. открывайте новинки первыми",
    "paragraphs": [
      "В каталоге Литрес больше миллиона книг. Но вместо того чтобы говорить о количестве, мы решили показать другое преимущество: книжные новинки часто появляются на Литрес раньше, чем где-либо ещё.",
      "Так читатели превратились в литературных первооткрывателей, а каждая новая книга стала неизведанной территорией. В кампании Виктория Исакова сыграла трёх исследовательниц, каждая из которых отправляется навстречу новым историям.",
      "Я отвечал за арт-дирекшн проекта на всех этапах: от разработки визуальной концепции до финальной реализации."
    ]
  },
  "kion": {
    "title": "kion. топ",
    "paragraphs": [
      "Нас окружает столько информации и контента, что посмотреть всё уже невозможно. Мы довели эту мысль до абсурда: а что, если бы у человека было три головы?",
      "В ролике для KION три головы стали наглядной метафорой нашей тяги смотреть всё и сразу. Иногда, чтобы увидеть больше, приходится буквально расширять возможности восприятия."
    ]
  },
  "triazavirin": {
    "title": "триазавирин. что такое забота?",
    "paragraphs": [
      "Когда Триазавирин стал продаваться без рецепта, бренду впервые понадобилось обратиться к широкой аудитории. Мы решили отказаться от привычных штампов фармацевтической рекламы и рассказать человеческую историю о заботе друг о друге.",
      "Так появился ролик «Забота — лучшее лекарство». Один день из жизни обычной семьи мы показываем глазами того, кому больше всего нужны любовь и поддержка. Главная мысль проста: забота о близких начинается с маленьких поступков."
    ]
  },
  "dodoMath": {
    "title": "додо пицца. простая математика",
    "paragraphs": [
      "С началом учебного года за парты мысленно возвращаются и родители: им снова приходится разбираться в непростых домашних заданиях. На этом контрасте мы построили ролик Додо Пиццы: школьная математика бывает сложной, а выгода должна быть простой.",
      "Сын приносит родителям задачник по геометрии и окончательно ставит их в тупик. Но когда привозят три пиццы, всё становится понятно. Формулы оживают прямо в кадре, а семейный ужин превращается в урок простой математики: три пиццы за 900 рублей."
    ]
  },
  "dixy": {
    "title": "дикси. треснутые",
    "paragraphs": [
      "Для промо коллекционных игрушек «Треснутые» мы сделали анимационный ролик в эстетике аниме. На весь проект было всего три недели, поэтому мы быстро собрали художников и аниматоров из разных точек мира: Казахстана, Дубая, Бали, Ханты-Мансийска и Аргентины.",
      "Работали параллельно в нескольких часовых поясах, чтобы успеть к старту кампании."
    ]
  },
  "kazakhstan": {
    "title": "шоколад «Казахстан»",
    "tag": "спек-ролик · неофициальный концепт",
    "paragraphs": [
      "Шоколад «Казахстан» давно стал одним из узнаваемых символов страны. Знакомую сине-золотую обёртку и вкус знают далеко за её пределами. Его привозят из поездок и дарят друзьям и близким как маленькую частичку родины.",
      "Название «Казахстан» можно трактовать как «земля свободных людей». Отсюда родилась идея нашего неофициального ролика: шоколад «Казахстан» — вкус свободной земли. Вкус свободы."
    ]
  },
  "akademichesky": {
    "title": "академический. наших рук дело",
    "paragraphs": [
      "Уже 20 лет «КОРТРОС» строит Академический в Екатеринбурге. Это не отдельные жилые дома, а целый район со школами, детскими садами, парками и даже собственной трамвайной линией.",
      "Мы решили показать это буквально: гигантская рука обустраивает район на глазах у жителей. Открывает новую школу, прокладывает трамвайные пути, устанавливает баскетбольное кольцо и даже помогает двум незнакомцам встретиться.",
      "Мы снимали на настоящих улицах Академического, а огромную руку создали с помощью CGI. Так показали, сколько труда стоит за превращением набора зданий в район, который люди называют домом."
    ]
  },
  "dodo": {
    "title": "додо пицца. 15 лет мечтаем вслух",
    "paragraphs": [
      "Говорят, что о желаниях лучше молчать, иначе они не сбудутся. Но Додо Пицца привыкла делать всё по-своему. К пятнадцатилетию бренда мы придумали кампанию «15 лет мечтаем вслух» и предложили людям перестать скрывать свои мечты.",
      "Эту идею мы перенесли и в рекламный ролик большого розыгрыша. Бренд загадывает желание: чтобы зрители увидели рекламу и узнали о возможности выиграть квартиру, автомобиль, запас пиццы на год и миллионы других призов. И желание сбывается прямо в момент просмотра."
    ]
  },
  "avionero": {
    "title": "avionero. лучше один раз увидеть",
    "paragraphs": [
      "Для Avionero мы сделали минималистичный ролик, в котором главным становится звук. Вместо привычных кадров путешествий зритель слышит людей, наблюдающих, как кит выныривает из воды. Шум природы, дыхание кита и восторженные голоса создают ощущение присутствия.",
      "Мы построили ролик на ASMR и воображении зрителя, оставив самый зрелищный момент за кадром. Ведь некоторые вещи лучше увидеть собственными глазами. Финальная строка собирает идею: «Лучше один раз увидеть. Путешествуй с Avionero»."
    ]
  },
  "mikenco": {
    "title": "mikenco. forever love",
    "paragraphs": [
      "Для вьетнамского бренда MIKENCO мы сняли фэшн-фильм в Казахстане, вдохновляясь кампаниями восьмидесятых и девяностых: их атмосферой, цветами и стилизацией.",
      "Забавно, что многие решили, будто падающие листья сделаны на компьютере. Но никакой графики не было. Просто человек стоял над площадкой и тряс ветку, чтобы листья красиво падали в кадр."
    ]
  },
  "mitchme": {
    "title": "mitch&me. рождество легко испортить",
    "paragraphs": [
      "Бренд собачьих шампуней Mitch&Me хотел поздравить владельцев собак с Рождеством и Новым годом. Но обычное праздничное поздравление совсем не в характере бренда.",
      "Поэтому мы придумали новогоднее поздравление с юмором и простым напоминанием: убирайте за своими собаками. Ведь испортить Рождество легче, чем кажется."
    ]
  },
  "mitchmeHalloween": {
    "title": "mitch&me. нестрашный хэллоуин",
    "paragraphs": [
      "Крупных чёрных собак и представителей так называемых бойцовских пород часто боятся. Из-за этих стереотипов им особенно трудно найти новый дом. Вместе с брендом шампуней Mitch&Me мы решили разрушить предубеждения с помощью самого страшного праздника года — Хэллоуина.",
      "Вместо привычных страшилок мы показали, как большая, на вид грозная собака может подарить чувство безопасности даже в жуткой ситуации. Кампанию заметили СМИ и соцсети. Но главное — благодаря ей 12 собак из приюта нашли новых хозяев."
    ]
  },
  "donorsearch": {
    "title": "donorsearch. 10% ради жизни",
    "paragraphs": [
      "Донор отдаёт около 10% своей крови, чтобы спасти чью-то жизнь. Мы предложили брендам поступить так же: выделить 10% своих рекламных площадей и контента, чтобы привлечь внимание к донорству крови.",
      "Вместе с DonorSearch мы превратили эту идею во всероссийский челлендж. К нему присоединились крупные бренды, а охват превысил 40 миллионов человек."
    ]
  },
  "taezhnyDar": {
    "title": "таёжный дар. существует в природе",
    "paragraphs": [
      "«Таёжный дар» — напиток из настоящих ягод и трав. Но слово «натуральный» настолько затаскали в рекламе, что мы решили вообще его не использовать. Вместо этого захотели показать продукт таким, какой он есть, без рекламного глянца.",
      "Мы вдохновились знакомой всем в России картиной: вдоль трассы люди продают свежесобранные лесные ягоды в обрезанных пластиковых бутылках. Так же поступили с бутылками «Таёжного дара»: наполнили их настоящими ягодами, а в ролики пригласили реальных придорожных продавцов. Так родилась кампания «Существует в природе»."
    ]
  },
  "shortShotFest": {
    "title": "short shot fest. жизнь слишком коротка",
    "paragraphs": [
      "Для московского фестиваля Short Shot Fest мы придумали кампанию, в которой весь фильм происходит в воображении зрителя. Вместо кадров из кино мы показывали короткие истории с неожиданными поворотами и концовками, оставляя каждому возможность самому представить происходящее.",
      "Идея так понравилась людям, что они стали придумывать собственные финалы. В Китае даже появился челлендж в соцсетях: пользователи публиковали альтернативные концовки наших историй. Кампания получила две бронзы Epica Awards за копирайтинг и сторителлинг."
    ]
  },
  "mitchmeDogsFirst": {
    "title": "mitch&me. собаки были первыми",
    "paragraphs": [
      "В День космонавтики принято вспоминать людей, покоривших космос. Но до того, как туда отправился человек, дорогу прокладывали собаки. Многие из них так и не вернулись на Землю.",
      "Вместе с Mitch&Me мы решили отдать должное этим забытым героям. Сделали принт с отпечатком собачьей лапы на Луне и фильм из архивных кадров первых космических экспериментов. Так появилась кампания «Собаки были первыми» — в память о животных, отдавших жизнь ради научного прогресса."
    ]
  }
};
  let language='en';
  // The switch is available on Home and within an open Case, never in Works.
  // Both controls show the same locale; switching doesn't reload Vimeo media.
  const toggles=[document.getElementById('localeToggle'),document.getElementById('caseLocaleToggle')].filter(Boolean);
  if(!toggles.length)return;
  const englishBio=Array.from(document.querySelectorAll('.bio > span')).map(s=>s.firstChild?.nodeType===Node.TEXT_NODE?s.firstChild.nodeValue:'');
  const russianBio=[
    'привет! я старший арт-директор. больше десяти лет работаю с рекламой, брендингом и визуальными',
    'историями. придумываю идеи и собираю их визуальный мир от первых эскизов до финального результата.',
    'моя работа объединяет креатив, арт-дирекшн и новые технологии. в 2026 году я начал заниматься',
    'режиссурой и включил ИИ в свой рабочий процесс. мои проекты получали награды epica awards,',
    'red apple, adcr, mix russia, silver mercury и\u00a0других фестивалей. о них писали зарубежные',
    'издания the drum, branding news и другие профессиональные площадки. а мой настоящий босс',
    'это шарпей по имени '
  ];
  const get=(selector)=>document.querySelector(selector);
  const setText=(selector,value)=>{const node=get(selector);if(node)node.textContent=value;};
  const en={role:get('.role')?.textContent||'',folder:get('.folder-name')?.textContent||'works',contact:get('.contact-entry')?.firstChild?.nodeValue||'contact me ',archive:get('.works-bar-name')?.textContent||'',back:get('#mobileWorksBack')?.textContent||'',backCase:get('#mobileCaseBack')?.textContent||'',caseBack:get('#caseBack')?.textContent||'',column:[...document.querySelectorAll('.works-columns span')].map(node=>node.textContent),footer:[...document.querySelectorAll('.works-footer span')].map(node=>node.textContent),openCase:get('.mobile-case-open')?.textContent||'open case ↗'};
  function getProject(key){
    if(language==='en')return projects[key];
    const original=projects[key],translation=russianProjects[key];
    // Case names are titles of works, not interface copy: never translate them.
    return translation?{...original,...translation,title:original.title,role:'роль: старший арт-директор'}:original;
  }
  window.salaticLocale={project:getProject,language:()=>language};
  function translateCurrentCase(){
    if(typeof scene==='undefined'||scene!=='case')return;
    const project=getProject(activeProject);
    if(!project)return;
    caseTitle.textContent=project.title;
    caseTag.textContent=project.tag||'';
    caseTag.hidden=!project.tag;
    caseRole.textContent=project.role;
    caseIntro.textContent=project.paragraphs[0]||'';
    caseConcept.textContent=project.paragraphs[1]||'';
    caseContribution.textContent=project.paragraphs[2]||'';
    caseContribution.hidden=!project.paragraphs[2];
    setkaCase.setAttribute('aria-label',project.title.replace(/\n/g,' ')+' '+(language==='ru'?'кейс':'case'));
  }
  function updateLanguage(){
    const ru=language==='ru';
    document.documentElement.lang=language;
    for(const toggle of toggles){
      toggle.textContent=ru?'en':'ru';
      toggle.setAttribute('aria-label',ru?'Переключить сайт на английский':'Switch website to Russian');
      toggle.title=ru?'English':'Русский';
    }
    artboard.dataset.lang=language;
    setText('.role-label',ru?'старший арт-директор / креатив / режиссёр':en.role);
    setText('.folder-name',ru?'кейсы':en.folder);
    folder.setAttribute('aria-label',ru?'Открыть кейсы':'Open works transition');
    const contact=get('.contact-entry');
    if(contact?.firstChild)contact.firstChild.nodeValue=ru?'написать мне ':en.contact;
    const bioLines=ru?russianBio:englishBio;
    document.querySelectorAll('.bio > span').forEach((span,index)=>{
      const name=span.querySelector(':scope > .bonya-name-anchor');
      const textNode=document.createTextNode(bioLines[index]||'');
      span.replaceChildren(...(name?[textNode,name]:[textNode]));
    });
    window.salaticBonya?.refreshText();
    setText('#bonyaTrigger',ru?'боня.':'bonya.');
    setText('.works-bar-name',ru?'избранные_работы':en.archive);
    const columns=document.querySelectorAll('.works-columns span');
    columns.forEach((node,i)=>node.textContent=ru?['имя файла','роль'][i]:en.column[i]);
    document.querySelectorAll('.works-file > span:nth-child(2)').forEach(el=>{
      el.textContent=ru?'ст. арт-директор':'sr. art director';
    });
    const footer=document.querySelectorAll('.works-footer span');
    footer.forEach((el,i)=>el.textContent=ru?['17 файлов','выбери файл ↗'][i]:en.footer[i]);
    setText('#mobileWorksBack',ru?'← назад':en.back);
    setText('#mobileCaseBack',ru?'← к работам':en.backCase);
    setText('#caseBack',ru?'← к работам':en.caseBack);
    document.querySelectorAll('.mobile-case-open').forEach(el=>el.textContent=ru?'открыть кейс ↗':en.openCase);
    const uiStrings=ru?{
      works:'Выбранные работы',close:'Закрыть окно работ',home:'На главную',
      case:'Вернуться к работам',previous:'Предыдущая работа',next:'Следующая работа',
      fileCount:'Открыть кейс'
    }:{
      works:'Selected works',close:'Close the works window',home:'Back to home',
      case:'Back to works',previous:'Previous video or KV',next:'Next video or KV',
      fileCount:'Open case'
    };
    const attrs=[
      ['#worksWindow','aria-label','works'],['#worksClose','aria-label','close'],
      ['#mobileWorksBack','aria-label','home'],['#mobileCaseBack','aria-label','case'],
      ['#caseClose','aria-label','case'],['#caseLeft','aria-label','previous'],
      ['#caseRight','aria-label','next']
    ];
    for(const [sel,attr,key] of attrs){const el=get(sel);if(el)el.setAttribute(attr,uiStrings[key]);}
    const rowMap={
      openLitres:'litres',openSetka:'setka',openKion:'kion',
      openTriazavirin:'triazavirin',openDodoMath:'dodoMath',openDixy:'dixy',
      openKazakhstan:'kazakhstan',openAkademichesky:'akademichesky',openDodo:'dodo',
      openAvionero:'avionero',openMikenco:'mikenco',openMitchme:'mitchme',
      openMitchmeHalloween:'mitchmeHalloween',openDonorsearch:'donorsearch',
      openTaezhnyDar:'taezhnyDar',openShortShotFest:'shortShotFest',
      openMitchmeDogsFirst:'mitchmeDogsFirst'
    };
    for(const [id,key] of Object.entries(rowMap)){
      const title=getProject(key)?.title?.replace(/\s+/g,' ')||key;
      const row=document.getElementById(id);
      if(row)row.setAttribute('aria-label',(ru?'Открыть ':'Open ')+title);
      const preview=document.getElementById('mobile-preview-'+key);
      if(preview)preview.setAttribute('aria-label',(ru?'Открыть кейс ':'Open case ')+title);
    }
    translateCurrentCase();
  }
  for(const toggle of toggles){
    toggle.addEventListener('click',()=>{
      // Avoid changing text under a currently running falling-letter animation.
      if(typeof scene!=='undefined'&&!['home','empty','case'].includes(scene))return;
      language=language==='en'?'ru':'en';
      updateLanguage();
    });
  }
  updateLanguage();
})();
