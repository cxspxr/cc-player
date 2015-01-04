/*
Итак. В колбэк в аргументы идет то, в первый аргумент идет то, 
что ты обозначил в аргументе 'value' функции SOMESHIT:
если 'pxs' - пиксели, а именно их кол-во без обозначения "px",
если 'prcnts' - проценты, а именно их кол-во без обозначения "%";

Во второй аргумент колбэка, ЕСЛИ ЭТО СЛАЙДЕР!, а ты указываешь это 
в аргументе "typeofuse" функции SOMESHIT, идет текущая картинка при
"авторегулировании" при mouseup к ближайшему чекпоинту, так сказать
к ближайшей картинке. Так вот тебе передается номер этого "чекпоинта", 
картинки, к которой идет самвел. Номер от 0 и до countOfImgs-1;

Если это другая хуйня, во второй аргумент колбэк функции не идет нихуя.

Аргументы:
elid = id Самвела;
parelid = id родителя Самвела;
call = твоя функция;
value = вид значения "координат": px/%, нужно для RETURN;
countofimgs = количество картинок (от 1);
typeofuse = чеугодно, но если "slider", то действуют отдельные для него
инструкции, такие как движ к чекпоинту анимированный транзишном и передается
во второй аргумент колбэка номер текущего чекпоинта, там свои переменные нужные
ТОЛЬКО слайдеру создаются.

GOTO METHOD зависит от TYPEOFUSE. Если же TYPEOFUSE, последний аргумент
функции someshit == 'slider', то в аргумент функции goTo писать нужно
 номер "чекпоинта", номер картинки буквально. И thumbEl двигается 
 к определенной "картинке", чекпоинту.

 Если же TYPEOFUSE, последний аргумент функции someshit != 'slider', то
 в первый аргумент следует писать  "px" или "%", а во второй само значение
  в числовом обозначении -  200, 100, 300, 400 - и thumbEl будет двигаться
 относительно своего родителя.


  //POSITION:RELATIVE У САМВЕЛА МАСТХЕВ!
  //DISPLAY:BLOCK У САМВЕЛА МАСТХЕВ!

  //стартовую позицию самвела, если не нужно "нулевой", а,
  //например в громкости изначально стоит 50%, так вот короче
  // ставь 'left', но не 'margin-left'. 'right' и 'margin-right' НЕ ПОДОЙДУТ!
*/


function timeline(elid, parelid, call, value, countofimgs, typeofuse){
  var line = document.getElementById(parelid);
  var thumbEl = document.getElementById(elid);
  var shift = thumbEl.offsetWidth/2;
  //GOTO method
  if(!(typeofuse=='slider'))
  {
    this.goTo = function(type, number)
    {
        if(type == 'px')
        {
          if(number > line.offsetWidth - thumbEl.offsetWidth)
            number = line.offsetWidth - thumbEl.offsetWidth;
          if(number < 0)
            number = 0;
          thumbEl.style.left = number + type;
        }
        if(type=='%')
        {
          var difference = line.offsetWidth - thumbEl.offsetWidth;
          if(number>100)
            number = 100;
          if(number<0)
            number = 0;
          thumbEl.style.left = number/100 * difference + 'px';
        }
      }
  }
  //GOTO method
  //typeofuse = slider/player
  if(typeofuse == 'slider')
  {
    var numberOfCurrentImg; // eto variable для того, чтобы показать, какой
    //сейчас кадр, когда оно идет по чекпоинтам. какой сейчас "чекпоинт" в слайдере
    // первый = 0, последний = (countOfImgs - 1)
    var checkpointWidth = line.offsetWidth / (countofimgs-1);
    var checkpointsArray = [];
    for(i=0;i<countofimgs;i++)
    {
      checkpointsArray.push(i*checkpointWidth);
      if(checkpointsArray[i]-thumbEl.offsetWidth > 0)
        checkpointsArray[i] = checkpointsArray[i] - thumbEl.offsetWidth;
    }
    //GOTO method for slider
    if(typeofuse == 'slider')
    {
      this.goTo = function(numberOfCheckimoint)
      {
        thumbEl.style.left = checkpointsArray[+numberOfCheckimoint] + 'px';
      }
    }
    var differenceArray = [];
  } 
  //координаты в пикселях для рэтёрна относительно линии
  var returnPxs;
  //процентные координаты относительно линии для рэтёрна
  var returnPercents;


  //fixEvent function, координаты.
  function fixEvent(e, _this) {
    e = e || window.event;
    if (!e.currentTarget) e.currentTarget = _this;
    if (!e.target) e.target = e.srcElement;
    if (!e.relatedTarget) {
      if (e.type == 'mouseover') e.relatedTarget = e.fromElement;
      if (e.type == 'mouseout') e.relatedTarget = e.toElement;
    }
    if (e.pageX == null && e.clientX != null ) {
      var html = document.documentElement;
      var body = document.body;
      e.pageX = e.clientX + (html.scrollLeft || body && body.scrollLeft || 0);
      e.pageX -= html.clientLeft || 0;
      e.pageY = e.clientY + (html.scrollTop || body && body.scrollTop || 0);
      e.pageY -= html.clientTop || 0;
    }
    if (!e.which && e.button) {
      e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : (e.button & 4 ? 2 : 0) );
    }
    return e;
  }
  //getCoords элемента
  function getCoords(elem) {
      var box = elem.getBoundingClientRect();
      var body = document.body;
      var docEl = document.documentElement;
      var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
      var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
      var clientTop = docEl.clientTop || body.clientTop || 0;
      var clientLeft = docEl.clientLeft || body.clientLeft || 0;
      var top  = box.top +  scrollTop - clientTop;
      var left = box.left + scrollLeft - clientLeft;
      return { top: Math.round(top), left: Math.round(left) };
  }
  //Собственно DRAG & DROP
    thumbEl.ondragstart = function() { return false; };
    if(!(typeofuse=='slider'))
    {
      //Кликанье по "линии", по родителю thumbEl перемещает thumbEl в 
      //указанные координаты мыши при клике.
          line.onclick = function(e)
          {
              e = fixEvent(e);
              var lineCoords = getCoords(line);
              var thumbCoords = getCoords(thumbEl);
              var thumbElOffsetWidth = thumbEl.offsetWidth;
              var lineOffsetWidth = line.offsetWidth;
              var shiftX = e.pageX - lineCoords.left - shift;
              if(shiftX > line.offsetWidth - thumbEl.offsetWidth)
                shiftX = line.offsetWidth - thumbEl.offsetWidth;
              if(shiftX < 0)
                shiftX = 0;
              thumbEl.style.left = shiftX +'px';
              //для рэтёрна
              returnPercents =  +thumbEl.style.left
              .substring(0,thumbEl.style.left.length-2)  / (lineOffsetWidth 
                - thumbElOffsetWidth) * 100;
                if(returnPercents>100)
                  returnPercents = 100;
                if(returnPercents<0)
                  returnPercents = 0;
              if(value == 'px')
                call(returnPxs);
              if(value == 'prcnts')
                call(returnPercents);
          }
    }
    thumbEl.onmousedown = function(e) {
      e = fixEvent(e);
      var thumbCoords = getCoords(thumbEl);
      var lineCoords = getCoords(line);
      var shiftX = e.pageX - thumbCoords.left;
      shift = e.pageX - thumbCoords.left;

      var lineOffsetWidth = line.offsetWidth;
      var thumbElOffsetWidth = thumbEl.offsetWidth;


        thumbEl.style.transition = '';
        thumbEl.style.setProperty('-webkit-transition',
         '');
        thumbEl.style.setProperty('-moz-transition',
         '');
        thumbEl.style.setProperty('-ms-transition',
         '');
        thumbEl.style.setProperty('-o-transition',
         '');
      document.onmousemove = function(e) {
        e = fixEvent(e);
        var newLeft = e.pageX - shiftX - lineCoords.left;
        if(newLeft<0)
          newLeft = 0;
        var rightEdge = lineOffsetWidth - thumbElOffsetWidth;
        if(newLeft > rightEdge)
          newLeft = rightEdge;
        thumbEl.style.left = newLeft + 'px';
        //"return"
        returnPxs = +thumbEl.style.left
        .substring(0,thumbEl.style.left.length-2);
        returnPercents = +thumbEl.style.left
        .substring(0,thumbEl.style.left.length-2)  / (lineOffsetWidth 
          - thumbElOffsetWidth) * 100;
        //returning
        if(value == 'px')
          call(returnPxs);
        if(value == 'prcnts')
          call(returnPercents);
      }
      document.onmouseup = function() {
        document.onmousemove = document.onmouseup = null;
      //automoving to checkpoint, если слайдер.
        if(typeofuse == 'slider')
        {
          for(i=0;i<checkpointsArray.length;i++)
          {
            differenceArray.push(Math.abs(checkpointsArray[i] - returnPxs));
          }
          for(i=0;i<differenceArray.length;i++)
          {
            if(differenceArray[i] == Math.min.apply(Math,differenceArray))
            {
              //TRANSITION при автомувинге к чекпоинту
              thumbEl.style.transition = 'left .6s ease-out';
              thumbEl.style.setProperty('-webkit-transition',
               'left .6s ease-out');
              thumbEl.style.setProperty('-moz-transition',
               'left .6s ease-out');
              thumbEl.style.setProperty('-ms-transition',
               'left .6s ease-out');
              thumbEl.style.setProperty('-o-transition',
               'left .6s ease-out');

              thumbEl.style.left = checkpointsArray[i] + 'px';

              if(typeofuse == 'slider')
                numberOfCurrentImg = i;

              differenceArray = [];  
              //returnings
              returnPxs = +thumbEl.style.left
              .substring(0,thumbEl.style.left.length-2);
              returnPercents = +thumbEl.style.left
              .substring(0,thumbEl.style.left.length-2)  / (lineOffsetWidth 
              - thumbElOffsetWidth) * 100;
            }
          }
        }
            if(typeofuse == 'slider')
            {
                if(value == 'px')
                  call(returnPxs, numberOfCurrentImg);
                if(value == 'prcnts')
                  call(returnPercents, numberOfCurrentImg);
            }
            else 
            {
                if(value == 'px')
                  call(returnPxs);
                if(value == 'prcnts')
                  call(returnPercents);
            }
        return false;
      }
      return false; 
    };
  }