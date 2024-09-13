const scriptName = "봇";

function getTargetDate(offset) {
  var today = new Date();
  today.setDate(today.getDate() + offset);
  return today;
}

function getDormitoryUrl(dormitory) {
  switch (dormitory) {
    case "보람관":
      return "https://dorm.knu.ac.kr/newlife/newlife_04.php?get_mode=2";
    case "첨성관":
      return "https://dorm.knu.ac.kr/newlife/newlife_04.php?get_mode=3";
    case "누리관":
      return "https://dorm.knu.ac.kr/newlife/newlife_04.php?get_mode=4";
    default:
      return null;
  }
}

function getMealData(url) {
  return org.jsoup.Jsoup.connect(url).get();
}

function parseMealData(data, targetDay) {
  var calenderTable = data.select("table#diary_t");
  var dayTds = calenderTable.select("td");

  for (var i = 0; i < dayTds.size(); i++) {
    var dayTd = dayTds.get(i);
    var dateFont = dayTd.select("font").first();

    if (dateFont != null) {
      var dateText = dateFont.text().trim();

      if (dateText === targetDay) {
        var icon = dayTd.select("i.fa.fa-apple");

        if (icon.size() > 0) {
          var menuBox = dayTd.select("div.menu_box");

          if (menuBox.size() > 0) {
            var mealTable = menuBox.select("table");
            var mealTimes = mealTable.select("th");
            var dailyMeals = mealTable.select("td");
            var result = "";

            for (var j = 0; j < mealTimes.size(); j++) {
              var mealTime = "-----" + mealTimes.get(j).text() + "-----";
              var dailyMeal = dailyMeals.get(j).text();
              dailyMeal = dailyMeal
                .replace(/▶.*/g, "")
                .replace(/\s*,\s*/g, "\n")
                .replace(/\s*\/\s*/g, "\n");
              result += mealTime + "\n" + dailyMeal + "\n\n";
            }

            return result;
          }
        }
      }
    }
  }
  return null;
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
  var dormitory = "";
  var notice =
    "\n-----식사 시간 안내-----\n아침 : 07:30 - 08:55\n점심 : 11:30 - 13:55\n저녁 : 17:30 - 18:55\n\n식당 마지막 입장시간 55분,\n식사 후 퇴실시간 15분까지";

  var match = msg.match(/^\/(보람관|누리관|첨성관)\s*(오늘|내일|모레)$/);

  if (match) {
    dormitory = match[1]; // 보람관, 누리관, 첨성관
    switch (match[2]) {
      case "오늘":
        offset = 0;
        break;
      case "내일":
        offset = 1;
        break;
      case "모레":
        offset = 2;
        break;
    }
  } else if (msg.startsWith("/")) {
    replier.reply(
      "/사용법." //다시 만들기..
    );
    return;
  } else {
    return;
  }

  var targetDate = getTargetDate(offset);
  var targetDay = targetDate.getDate().toString();
  var dormitoryUrl = getDormitoryUrl(dormitory);

  if (dormitoryUrl === null) {
    replier.reply("기숙사 정보를 찾을 수 없습니다.");
    return;
  }

  var data = getMealData(dormitoryUrl);
  var mealData = parseMealData(data, targetDay);

  if (!mealData) {
    replier.reply(`${dormitory}의 해당 날짜 식단을 찾을 수 없습니다.`); //메신저 봇 R에서 지원하는가?
  } else {
    replier.reply(mealData + notice);
  }
}
