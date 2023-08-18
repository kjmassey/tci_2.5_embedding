async function getFilters() {
  const lineViz = document.getElementById("lineViz");
  const ws = lineViz.workbook.activeSheet;
  const sheetFilters = await ws.getFiltersAsync();
  console.log("--- SHEET FILTERS: ", sheetFilters);

  const filterNames = sheetFilters.map((e) => e.fieldName);

  console.log("This worksheet has the following filters:");
  console.log(filterNames.join(", "));

  var filterValString = "";
  const valsDiv = document.getElementById("filtersBodyDiv");

  sheetFilters.forEach((e) => {
    filterValString += `${e.fieldName}<br>`;
  });

  valsDiv.innerHTML = filterValString;
}

async function getData() {
  const ws = viz.workbook.activeSheet;

  const wsData = await ws.getUnderlyingDataAsync();
  console.log("ROWS FROM UNDERLYING DATA: ", wsData.data.length);

  const wsSummaryData = await ws.getSummaryDataAsync();
  console.log("MARKS FROM SUMMARY DATA: ", wsSummaryData.data.length);

  var allRegionVals = wsData.data.map((e) => e[1].value);
  var uniqueRegions = [...new Set(allRegionVals)];

  console.log(uniqueRegions);
}

async function clearRegionFilter(filterName) {
  const ws = viz.workbook.activeSheet;

  const clearFilter = await ws.clearFilterAsync(filterName);
}

async function getAllUniqueFilterValues(filterName, divId) {
  const lineViz = document.getElementById("lineViz");
  const filterControlDiv = document.getElementById(divId);
  const ws = lineViz.workbook.activeSheet;

  const sheetFilters = await ws.getFiltersAsync();

  var existingFilterVals;

  sheetFilters.forEach((e) => {
    if (e.fieldName == filterName) {
      existingFilterVals = e.appliedValues.map((x) => x.value);
    }
  });

  console.log("EXISTING FILTER VALS: ", existingFilterVals);
  const clearFilter = await ws.clearFilterAsync(filterName);

  const wsSummaryData = await ws.getSummaryDataAsync();
  console.log("SUMMARY DATA:");
  console.log(wsSummaryData);

  var i = filterName == "Region" ? 1 : 0;

  var allVals = wsSummaryData.data.map((e) => e[i].value.split("-")[0]);
  var uniqueVals = [...new Set(allVals)];

  console.log("ALL UNIQUE REGIONS: ", uniqueVals);

  var allOpt = document.createElement("option");

  allOpt.value = "(All)";
  allOpt.innerHTML = "(All)";
  filterControlDiv.appendChild(allOpt);

  uniqueVals.forEach((e) => {
    var opt = document.createElement("option");
    opt.value = e;
    opt.innerHTML = e;
    filterControlDiv.appendChild(opt);
  });

  const reapplyFilters = ws.applyFilterAsync(
    filterName,
    existingFilterVals,
    "replace"
  );
}

async function applyFilterFromDropdown(filterName, event) {
  const lineViz = document.getElementById("lineViz");
  const ws = lineViz.workbook.activeSheet;

  var applyFilter;

  if (event.value == "(All)") {
    applyFilter = ws.clearFilterAsync(filterName);
  } else {
    applyFilter = ws.applyFilterAsync(filterName, [event.value], "replace");
  }
}

async function getMarksCount() {
  const lineViz = document.getElementById("lineViz");
  const marksCountDiv = document.getElementById("marksCountDiv");
  const ws = lineViz.workbook.activeSheet;
  const wsSummaryData = await ws.getSummaryDataAsync();

  marksCountDiv.innerHTML = wsSummaryData.data.length;
}

async function getRowsCount() {
  const lineViz = document.getElementById("lineViz");
  const marksCountDiv = document.getElementById("rowsCountDiv");
  const ws = lineViz.workbook.activeSheet;
  const wsData = await ws.getUnderlyingDataAsync();

  marksCountDiv.innerHTML = wsData.data.length;
}

async function getDateRange() {
  const lineViz = document.getElementById("lineViz");
  const dateRangeDiv = document.getElementById("dateRangeDiv");
  const ws = lineViz.workbook.activeSheet;
  const wsSummaryData = await ws.getSummaryDataAsync();

  var maxDate = wsSummaryData.data.reduce((p, c) =>
    p[0].value > c[0].value ? p : c
  );
  var minDate = wsSummaryData.data.reduce((p, c) =>
    p[0].value < c[0].value ? p : c
  );

  console.log(maxDate);

  dateRangeDiv.innerHTML = `${minDate[0].formattedValue} - ${maxDate[0].formattedValue}`;
}

async function getMaxOrMinValue(valType) {
  const lineViz = document.getElementById("lineViz");
  const cardBodyDiv = document.getElementById(`${valType}CardBody`);
  const ws = lineViz.workbook.activeSheet;
  const wsSummaryData = await ws.getSummaryDataAsync();

  console.log("SUMMARY DATA: ");
  console.log(wsSummaryData);

  var getVal;

  switch (valType) {
    case "max":
      getVal = wsSummaryData.data.reduce((p, c) =>
        p[2].value > c[2].value ? p : c
      );

      break;

    case "min":
      getVal = wsSummaryData.data.reduce((p, c) =>
        p[2].value < c[2].value ? p : c
      );

      break;
  }

  cardBodyDiv.innerHTML = getVal[2].value;
}

async function prepLineViz() {
  await getMaxOrMinValue("max");
  await getMaxOrMinValue("min");
  await getDateRange();
  await getMarksCount();
  await getRowsCount();
  await getFilters();
  await getAllUniqueFilterValues("Region", "regionFilterSelect");
  await getAllUniqueFilterValues("YEAR(Order Date)", "yearFilterSelect");

  const overlay = document.getElementById("overlay");
  overlay.style.display = "none";
}
