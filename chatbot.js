/* 추가할 사항
 * 1.정센 2.복지관 3.카페테리아 첨성(1000원의 아침밥) 4.GP감꽃식당 5.공식당(교직원-학생)
 *  모두 구조는 같다. 한 번만 짜면 재사용이 가능
 *  역시 모레까지만 지원할 것인가?
 * -> 취소 너무 길어 카톡으로 보여주기 가독성 저하 -> 쉽고,간편하게 보여주자는 본질을 잃어버리는 듯. 코너별?? 이건 추후..
 * -> 천 원의 아침밥 정도는 할만할듯
 */
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
    case "천원":
      return "https://coop.knu.ac.kr/sub03/sub01_01.html?shop_sqno=37";
    default:
      return null;
  }
}

// function getCafeteriaUrl(cafeteria) {
//   switch(cafeteria) {
//     case "정센":
//       return "https://coop.knu.ac.kr/sub03/sub01_01.html?shop_sqno=35";
//     case "복지관":
//       return "https://coop.knu.ac.kr/sub03/sub01_01.html?shop_sqno=36";
//     case "첨성":
//       return "https://coop.knu.ac.kr/sub03/sub01_01.html?shop_sqno=37";
//     case "감꽃":
//       return "https://coop.knu.ac.kr/sub03/sub01_01.html?shop_sqno=46";
//     case "공식당1":
//       return "https://coop.knu.ac.kr/sub03/sub01_01.html?shop_sqno=85";
//     case "공식당2":
//       return "https://coop.knu.ac.kr/sub03/sub01_01.html?shop_sqno=86";
//   }
// }

function getMeal(url) {
  //GET method
  return org.jsoup.Jsoup.connect(url).get();
}

function parseDormMeal(data, targetDay) {
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

// function parseCafeteriaMeal(data, targetDay) {
//   var table = data.select("table#tstyle_me tac")
//   var dayTds =
// }

function parseCheonwonMeal(data, targetDay) {
  var dayColumns = data.select("table.tstyle_me thead tr th");

  for (var i = 0; i < dayColumns.size(); i++) {
    var dayColumn = dayColumns.get(i);
    var dateText = dayColumn.text().trim();

    if (dateText.includes(targetDay)) {
      var menuColumn = data.select("table.tstyle_me tbody tr td").get(i);
      var menuItems = menuColumn.select("ul.menu_im li");

      if (menuItems.size() > 0) {
        var firstMenu = menuItems.get(0).text();
        if (firstMenu.includes("천원의밥상")) {
          var fullMenu = firstMenu
            .replace(/\*/g, "")
            .replace(/<br\s*\/?>/g, "\n")
            .replace(/<\/?p>/g, "")
            .trim();
          return fullMenu;
        }
      }
    }
  }
  return "천원의 아침밥 오류.";
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

  var match = msg.match(/^\/(보람관|누리관|첨성관|천원)\s*(오늘|내일|모레)$/);

  if (match) {
    //보,누,첨,천원의아침밥 중에 고르기
    dormitory = match[1];
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
      "-----사용법-----\n /(기숙사명) (오늘/내일/모레)\n ex)/보람관 오늘\n 또는 /천원 (오늘/내일/모레)." //다시 만들기..
    );
    return;
  } else {
    return;
  }

  var targetDate = getTargetDate(offset);
  //toString()
  var targetDay = targetDate.getDate().toString();
  var dormitoryUrl = getDormitoryUrl(dormitory);

  // if (dormitoryUrl === null) {
  //   replier.reply("기숙사 정보를 찾을 수 없습니다.");
  //   return;
  // }

  var data = getMeal(dormitoryUrl);
  if (dormitory === "천원") {
    var mealData = parseCheonwonMeal(data, targetDay);
  } else {
    var mealData = parseDormMeal(data, targetDay);
  }
  if (!mealData) {
    replier.reply("해당 기숙사의 해당 날짜 식단을 찾을 수 없습니다."); // template literal 지원 x
  } else {
    replier.reply(mealData + notice);
  }
}
