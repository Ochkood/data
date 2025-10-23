import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale"; // ✅ энэ plugin заавал хэрэгтэй
import "dayjs/locale/mn"; // суурь монгол хэлний орчуулга

dayjs.extend(relativeTime);
dayjs.extend(updateLocale); // ✅ updateLocale-г идэвхжүүлнэ

// 🧩 "mn" locale-г шинэчилж байна
dayjs.updateLocale("mn", {
  relativeTime: {
    future: "%s дараа",
    past: "%s өмнө",
    s: "хэдхэн секундийн",
    m: "1 минутын",
    mm: "%d минутын",
    h: "1 цагийн",
    hh: "%d цагийн",
    d: "1 өдрийн",
    dd: "%d өдрийн",
    M: "1 сарын",
    MM: "%d сарын",
    y: "1 жилийн",
    yy: "%d жилийн",
  },
});