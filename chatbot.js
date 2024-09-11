const scriptName = "봇";

function getTargetDate(offset) {
  var today = new Date();
  today.setDate(today.getDate() + offset);
  return today;
}

function response(
  room,
  msg,
  sender,
  isGroupChat,
  replier,
  imageDB,
  packageName
) {
  var offset = 0;
  var notice =
    "\n-----식사 시간 안내-----\n아침 : 07:30 - 08:55\n점심 : 11:30 - 13:55\n저녁 : 17:30 - 18:55\n\n식당 마지막 입장시간 55분,\n식사 후 퇴실시간 15분까지";

  if (msg.match(/^\/(오늘|내일|모레)$/)) {
    switch (msg) {
      case "/오늘":
        offset = 0;
        break;
      case "/내일":
        offset = 1;
        break;
      case "/모레":
        offset = 2;
        break;
    }
  } else if (msg.startsWith("/")) {
    replier.reply("/오늘, /내일, /모레 중 하나를 입력해주세요.");
    return;
  } else return;

  var targetDate = getTargetDate(offset);
  //replier.reply("날짜 : " + targetDate);
  var targetDay = targetDate.getDate().toString();

  //replier.reply("타겟 날짜: " + targetDay);

  // 웹페이지 파싱
  var data = org.jsoup.Jsoup.connect(
    "https://dorm.knu.ac.kr/newlife/newlife_04.php?get_mode=2"
  ).get();

  // 캘린더 테이블 파싱
  var calenderTable = data.select("table#diary_t");
  //replier.reply("캘린더 테이블 파싱");

  var dayTds = calenderTable.select("td");
  //replier.reply("총 날짜: " + dayTds.size());

  var getMeal = false;
  var result = "";

  // 날짜와 일치하는 td 찾기
  for (var i = 0; i < dayTds.size(); i++) {
    var dayTd = dayTds.get(i);

    // 여기서 날짜 정보를 추출
    var dateFont = dayTd.select("font").first();
    if (dateFont != null) {
      var dateText = dateFont.text().trim();
      //replier.reply("파싱된 날짜: " + dateText); // 날짜 텍스트 출력

      if (dateText === targetDay) {
        //replier.reply("날짜 일치: " + dateText);

        // 메뉴 아이콘이 있는지 확인
        var icon = dayTd.select("i.fa.fa-apple");
        //replier.reply("아이콘 개수: " + icon.size());

        if (icon.size() > 0) {
          // 메뉴 정보 추출
          var menuBox = dayTd.select("div.menu_box");

          if (menuBox.size() > 0) {
            var mealTable = menuBox.select("table");
            //시간대
            var mealTimes = mealTable.select("th");
            //식단
            var dailyMeals = mealTable.select("td");

            //replier.reply("식단 시간대 개수: " + mealTimes.size());
            //replier.reply("식단 정보 개수: " + dailyMeals.size());

            for (var j = 0; j < mealTimes.size(); j++) {
              var mealTime = "-----" + mealTimes.get(j).text() + "-----";
              var dailyMeal = dailyMeals.get(j).text();
              // ▶ 이후 제거
              dailyMeal = dailyMeal.replace(/▶.*/g, "");
              // , 제거
              dailyMeal = dailyMeal.replace(/\s*,\s*/g, "\n");
              //아침 또는 점심 식단 A,B 가독성 높이기
              dailyMeal = dailyMeal.replace(/\s*\/\s*/g, "\n");
              result += mealTime + "\n" + dailyMeal + "\n\n";
            }

            getMeal = true;
            break;
          }
        }
      }
    }
  }

  if (!getMeal) {
    replier.reply("해당 날짜의 식단을 찾을 수 없습니다.");
  } else {
    replier.reply(result + notice);
  }
}
