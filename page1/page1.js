const filterField = document.querySelector("#filter-field");
const filterType = document.querySelector("#filter-type");
const filterValue = document.querySelector("#filter-value");
const filterClear = document.querySelector("#filter-clear");

class TableMaker {
  config = {
    height: "auto", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
    layout: "fitColumns", //fit columns to width of table (optional)
    responsiveLayout: "hide", //hide columns that dont fit on the table
    addRowPos: "top", //when adding a new row, add it to the top of the table
    history: true, //allow undo and redo actions on the table
    pagination: "local", //paginate the data
    paginationSize: 5, //allow 7 rows per page of data
    movableColumns: true, //allow column order to be changed
    resizableRows: true
  };

  columns = [
    {
      title: "manufacturer name",
      field: "manufacturer name",
      width: 150
    },
    {
      title: "sensor type",
      field: "sensor type",
      width: 150
    },
    {
      title: "version",
      field: "version",
      width: 150
    },
    {
      title: "size",
      field: "Sensor Attributes_Physical_Size"
    },
    {
      title: "Power Supply Battery",
      field: "Sensor Attributes_Power Supply_Battery"
    },
    {
      title: "Frequency Band",
      field: "Sensor Attributes_Data acquisition (Vibration)_Frequency Band"
    }
  ];

  constructor(el) {
    this.tableElement = el;
  }

  flattenData(data) {
    var output = [];
    function flattenRow(row) {
      var outputRow = {};
      for (var prop in row) {
        if (typeof row[prop] !== "object") {
          outputRow[prop] = row[prop];
        } else {
          var flat = flattenRow(row[prop]);
          for (var flatProp in flat) {
            outputRow[prop + "_" + flatProp] = flat[flatProp];
          }
        }
      }
      return outputRow;
    }
    data.forEach(row => output.push(flattenRow(row)));
    return output;
  }

  async fetchAll(json) {
    const promises = [];

    for (var i = json.length - 1; i >= 0; i--) {
      promises.push(
        fetch(`./data/${json[i]}`).then(response => {
          return response.json();
        })
      );
    }
    return await Promise.all(promises);
  }

  async fetchData() {
    const manifest = await fetch("./data/manifest.json");
    const manifest_json = await manifest.json();
    const json = await this.fetchAll(manifest_json);
    return json;
  }

  download() {
    this.table.download("csv", "data.csv");
  }

  filter() {
    this.table.setFilter(
      filterField.value,
      filterType.value,
      filterValue.value
    );
  }

  clearFilter() {
    filterField.value = "";
    filterType.value = "=";
    filterValue.value = "";
    this.table.clearFilter();
  }

  async init() {
    const data = await this.fetchData();
    const flattenedData = this.flattenData(data);
    this.table = new Tabulator(this.tableElement, {
      ...this.config,
      data: flattenedData, //assign data to table
      columns: this.columns
    });
  }
}
