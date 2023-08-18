async function getWorkbookParams() {
  const mapViz = document.getElementById("mapViz");
  const wb = mapViz.workbook;

  const wbParams = await wb.getParametersAsync();

  return wbParams;
}

async function getParamDisplayNames() {
  wbParams = await getWorkbookParams();
  const paramNamesDiv = document.getElementById("paramNamesDiv");

  var paramNameStr = "";

  wbParams.forEach((e) => {
    paramNameStr += `${e.name}<br>`;
  });

  paramNamesDiv.innerHTML = paramNameStr;
}

async function getParamCurrentValue(paramName) {
  metricDiv = document.getElementById("currentMetricDiv");

  const wbParams = await getWorkbookParams();
  const filterParams = wbParams.filter((e) => e.name == paramName);

  metricDiv.innerHTML = filterParams[0].currentValue.formattedValue;
}

async function getTopOrBottomState(valType, paramName) {
  const mapViz = document.getElementById("mapViz");
  const ws = mapViz.workbook.activeSheet;
  const stateDiv = document.getElementById(`${valType}StateDiv`);

  const wbSummaryData = await ws.getSummaryDataAsync();

  console.log("SUMMARY DATA: ", wbSummaryData);

  const wbParams = await getWorkbookParams();
  console.log("WBPs: ", wbParams);
  const filteredParams = wbParams.filter((e) => e.name == paramName);

  console.log("P: ", filteredParams);

  const currentParamVal = filteredParams[0].currentValue.formattedValue;

  var getVal;
  var i;

  switch (currentParamVal) {
    case "Avg Discount":
      i = 4;
      break;

    case "Avg Sales":
      i = 6;
      break;

    case "Avg Profit":
      i = 5;
      break;

    case "Order Count":
      i = 7;
      break;
  }

  switch (valType) {
    case "top":
      getVal = wbSummaryData.data.reduce((p, c) =>
        p[i].value > c[i].value ? p : c
      );

      break;

    case "bottom":
      getVal = wbSummaryData.data.reduce((p, c) =>
        p[i].value < c[i].value ? p : c
      );

      break;
  }

  stateDiv.innerHTML = `${getVal[0].formattedValue}, ${getVal[2].formattedValue}`;
}

async function getMapMarksCount() {
  const mapViz = document.getElementById("mapViz");
  const marksCountDiv = document.getElementById("mapMarksCountDiv");
  const ws = mapViz.workbook.activeSheet;
  const wsSummaryData = await ws.getSummaryDataAsync();

  marksCountDiv.innerHTML = wsSummaryData.data.length;
}

async function getMapRowsCount() {
  const mapViz = document.getElementById("mapViz");
  const marksCountDiv = document.getElementById("mapRowsCountDiv");
  const ws = mapViz.workbook.activeSheet;
  const wsData = await ws.getUnderlyingDataAsync();

  marksCountDiv.innerHTML = wsData.data.length;
}

async function populateParamSelect(paramName) {
  const wbParams = await getWorkbookParams();
  const filteredParams = wbParams.filter((e) => e.name == paramName);
  const paramSelect = document.getElementById("paramSelect");

  const currentParamVal = filteredParams[0].currentValue.formattedValue;
  const allowableValues = filteredParams[0].allowableValues.allowableValues.map(
    (e) => e.formattedValue
  );

  allowableValues.forEach((e) => {
    var opt = document.createElement("option");
    opt.value = e;
    opt.innerHTML = e;

    if (e == currentParamVal) {
      opt.setAttribute("selected", "");
    }

    paramSelect.appendChild(opt);
  });
}

async function updateParameterFromDropDown(paramName, event) {
  const mapViz = document.getElementById("mapViz");
  const wb = mapViz.workbook;
  const overlay = document.getElementById("overlay");

  overlay.style.display = "flex";

  const updateParam = await wb.changeParameterValueAsync(
    paramName,
    event.value
  );

  await getParamCurrentValue("Dot Size");
  await getTopOrBottomState("top", "Dot Size");
  await getTopOrBottomState("bottom", "Dot Size");
  await getMapMarksCount();
  await getMapRowsCount();

  overlay.style.display = "none";
}

async function prepMapViz() {
  getParamCurrentValue("Dot Size");
  getTopOrBottomState("top", "Dot Size");
  getTopOrBottomState("bottom", "Dot Size");
  getMapMarksCount();
  getMapRowsCount();
  getParamDisplayNames();
  populateParamSelect("Dot Size");
}
