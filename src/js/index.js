// constant
const BASE_URL = "http://localhost:9000";
const BASE_API_URL = "http://localhost:8080/api/v1";
const ADMIN_ACCOUNT = "admin";
const ADMIN_PASSWORD = "admin123";
const STORAGE_KEY = "account";

const requestOptions = {
  method: "GET",
  redirect: "follow",
};

const userStorage = localStorage.getItem(STORAGE_KEY);

let weeklyList = [];

const weeklyHeader = document.getElementById("weekly-header");
const weeklyTitleTable = document.getElementById("weekly-title-table");
const loading = document.getElementById("loading");

const cyrb53 = function (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

// if user not logged then redirect them to login page
if (userStorage !== cyrb53(ADMIN_ACCOUNT).toString()) {
  window.location.href = `${BASE_URL}/login.html`;
}

function appendHtml(el, str) {
  var div = document.createElement("div");
  div.innerHTML = str;
  while (div.children.length > 0) {
    el.appendChild(div.children[0]);
  }
}

function injectHtml({
  index,
  id,
  traineeAccount,
  traineeName,
  processCompliance,
  timeliness,
  workQuality,
  professionalSkills,
  teamWork,
  attitudeDiscipline,
  academicMark,
  disciplinaryPoint,
  bonus,
  penalty,
  finalGrade,
  comment,
  status,
  weekly,
}) {
  return `<tr>
    <th scope="row">${index}</th>
    <td>${traineeAccount}</td>
    <td>${traineeName}</td>
    <td>${processCompliance}</td>
    <td>${timeliness}</td>
    <td>${workQuality}</td>
    <td>${professionalSkills}</td>
    <td>${teamWork}</td>
    <td>${attitudeDiscipline}</td>
    <td>${academicMark}</td>
    <td>${disciplinaryPoint}</td>
    <td>${bonus}</td>
    <td>${penalty}</td>
    <td>${finalGrade}</td>
    <td>${comment}</td>
    <td>${status}</td>
    <td><button onclick="deleteEvaluationById(${id}, ${weekly})">
      Delete
    </button><button>Edit</button></td>
  </tr>`;
}

function fnExcelReport() {
  var tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
  var j = 0;
  tab = document.getElementById("table-data"); // id of table

  for (j = 0; j < tab.rows.length; j++) {
    tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
  }

  tab_text = tab_text + "</table>";
  tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, ""); //remove if u want links in your table
  tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
  tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");

  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
    // If Internet Explorer
    txtArea1.document.open("txt/html", "replace");
    txtArea1.document.write(tab_text);
    txtArea1.document.close();
    txtArea1.focus();
    sa = txtArea1.document.execCommand(
      "SaveAs",
      true,
      "Say Thanks to Sumit.xls"
    );
  } //other browser not tested on IE 11
  else
    sa = window.open(
      "data:application/vnd.ms-excel," + encodeURIComponent(tab_text)
    );

  return sa;
}

function injectWeeklyHeaderHtml({ weekly }) {
  return `
    <div>
      <h3 id="weekly-heading">Tuan ${weekly}</h3>
      <button onclick="handleShowTable(${weekly})">show</button>
    </div>
  `;
}

function addPercent(point) {
  return point ? `${point}%` : ``;
}

function renderAllWeeklyTitle() {
  let htmlWeeklyHeader = ``;
  let htmlTableContentFinal = ``;
  fetch(`${BASE_API_URL}/evaluations`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      weeklyList = result
        .filter((v, i, a) => a.findIndex((t) => t.weekly === v.weekly) === i)
        .map(({ weekly }) => ({
          weekly,
        }))
        .sort((a, b) => a.weekly - b.weekly);

      weeklyList.forEach(({ weekly }) => {
        htmlWeeklyHeader += injectWeeklyHeaderHtml({ weekly });
      });

      const data = mergeDuplicateArrayOfObject(result);
      data.forEach((item, i) => {
        htmlTableContentFinal += injectHtml({
          index: i + 1,
          id: item.id,
          traineeAccount: item.traineeAccount,
          academicMark: addPercent(item.academicMark),
          attitudeDiscipline: addPercent(item.attitudeDiscipline),
          bonus: addPercent(item.bonus),
          comment: item.comment,
          disciplinaryPoint: addPercent(item.disciplinaryPoint),
          finalGrade: addPercent(item.finalGrade),
          penalty: addPercent(item.penalty),
          processCompliance: addPercent(item.processCompliance),
          professionalSkills: addPercent(item.professionalSkill),
          status: item.status,
          teamWork: addPercent(item.teamWork),
          timeliness: addPercent(item.timeliness),
          traineeName: item.traineeName,
          workQuality: addPercent(item.workQuality),
          weekly: item.weekly,
        });
      });
    })
    .then(() => {
      weeklyHeader.innerHTML = htmlWeeklyHeader;
      const tableContentFinal = document.getElementById("table-content-final");
      tableContentFinal.innerHTML = htmlTableContentFinal;
    })
    .catch((error) => console.log("error", error));
}

function init() {
  renderAllWeeklyTitle();
  // default show week 1
  handleShowTable(1);
  // weeklyTitleTable.style.display = "none";
}

function handleShowTable(weekly) {
  // weeklyTitleTable.style.display = "contents";
  let html = ``;
  loading.innerHTML = `<div style="color: red; margin-top: 30px;">Dang loading....</div>`;
  fetch(`${BASE_API_URL}/evaluationsByWeekly/${weekly}`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      loading.innerHTML = ``;

      for (let i = 0; i < result.length; i++) {
        html += injectHtml({
          index: i + 1,
          id: result[i].id,
          traineeAccount: result[i].traineeAccount,
          academicMark: result[i].academicMark,
          attitudeDiscipline: result[i].attitudeDiscipline,
          bonus: result[i].bonus,
          comment: result[i].comment,
          disciplinaryPoint: result[i].disciplinaryPoint,
          finalGrade: result[i].finalGrade,
          penalty: result[i].penalty,
          processCompliance: result[i].processCompliance,
          professionalSkills: result[i].professionalSkill,
          status: result[i].status,
          teamWork: result[i].teamWork,
          timeliness: result[i].timeliness,
          traineeName: result[i].traineeName,
          workQuality: result[i].workQuality,
          weekly: result[i].weekly,
        });
      }
    })
    .then(() => {
      const tableContent = document.getElementById("table-content");
      tableContent.innerHTML = html;
    })
    .catch((error) => console.log("error", error));
}

function deleteEvaluationById(id, weekly) {
  const requestOptions = {
    method: "DELETE",
    redirect: "follow",
  };

  fetch(`${BASE_API_URL}/deleteEvaluation/${id}`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      if (result === "OK") {
        handleShowTable(weekly);
        renderAllWeeklyTitle();
        alert(`Xoa evaluation thanh cong voi id = ${id}`);
      }
    })
    .catch((error) => console.log("error", error));
}

function filterAndMapArr(data, field, traineeAccount) {
  return data
    .filter((s) => s.traineeAccount === traineeAccount)
    .map((item) => item[field]);
}

function filterPercent(point) {
  return Number(point.split("%").join(""));
}

function averagePoint(pointArr) {
  let result = 0;
  pointArr.forEach((point) => {
    result += filterPercent(point);
  });
  return result / pointArr.length;
}

function mergeDuplicateArrayOfObject(data) {
  return Array.from(new Set(data.map((s) => s.traineeAccount))).map(
    (traineeAccount) => {
      return {
        traineeAccount,
        id: filterAndMapArr(data, "id", traineeAccount),
        weekly: filterAndMapArr(data, "weekly", traineeAccount),
        timeliness: averagePoint(
          filterAndMapArr(data, "timeliness", traineeAccount)
        ),
        traineeName: data[0].traineeName,
        processCompliance: averagePoint(
          filterAndMapArr(data, "processCompliance", traineeAccount)
        ),
        workQuality: averagePoint(
          filterAndMapArr(data, "workQuality", traineeAccount)
        ),
        professionalSkill: averagePoint(
          filterAndMapArr(data, "professionalSkill", traineeAccount)
        ),
        teamWork: averagePoint(
          filterAndMapArr(data, "teamWork", traineeAccount)
        ),
        attitudeDiscipline: averagePoint(
          filterAndMapArr(data, "attitudeDiscipline", traineeAccount)
        ),
        academicMark: averagePoint(
          filterAndMapArr(data, "academicMark", traineeAccount)
        ),
        disciplinaryPoint: averagePoint(
          filterAndMapArr(data, "disciplinaryPoint", traineeAccount)
        ),
        bonusPenaltyReason: filterAndMapArr(
          data,
          "bonusPenaltyReason",
          traineeAccount
        ),
        finalGrade: averagePoint(
          filterAndMapArr(data, "finalGrade", traineeAccount)
        ),
      };
    }
  );
}

init();
