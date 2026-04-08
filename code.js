/**
 * Google Apps Script for Employee Data Management
 * Deploy this as a Web App with "Execute as: Me" and "Who has access: Anyone"
 */

const SHEET_NAME = "Data";

function doGet(e) {
  const ehrmsCode = e.parameter.ehrmsCode;
  if (!ehrmsCode) {
    return createResponse({ status: "error", message: "EHRMS Code is required" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return createResponse({ status: "error", message: "Sheet 'Data' not found" });
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().trim());
  const ehrmsIndex = headers.indexOf("EHRMS CODE");

  if (ehrmsIndex === -1) {
    return createResponse({ status: "error", message: "Column 'EHRMS CODE' not found" });
  }

  for (let i = 1; i < data.length; i++) {
    if (data[i][ehrmsIndex].toString() === ehrmsCode.toString()) {
      const employeeData = {};
      headers.forEach((header, index) => {
        let value = data[i][index];
        if (value instanceof Date) {
          value = Utilities.formatDate(value, ss.getSpreadsheetTimeZone(), "dd/MM/yyyy");
        } else if (value && (header.includes("Date") || header.includes("Birth"))) {
          // If it's a string that should be a date, try to normalize it
          let dateObj = null;
          if (typeof value === 'string' && value.includes('/')) {
            const parts = value.split('/');
            if (parts.length === 3) {
              // Try to handle DD/MM/YYYY
              if (parts[2].length === 4) {
                dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
              }
            }
          }
          
          if (!dateObj || isNaN(dateObj.getTime())) {
            dateObj = new Date(value);
          }

          if (dateObj && !isNaN(dateObj.getTime())) {
            value = Utilities.formatDate(dateObj, ss.getSpreadsheetTimeZone(), "dd/MM/yyyy");
          }
        }
        employeeData[header] = value;
      });
      return createResponse({ status: "success", data: employeeData, exists: true });
    }
  }

  return createResponse({ status: "success", exists: false, message: "Employee not found" });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = [
        "EHRMS CODE", "EMPLOYEE NAME", "GENDER", "FATHER NAME", "DESIGNATION", 
        "UDISE CODE", "SCHOOL NAME", "NYAY PANCHAYAT", "PAN NUMBER", "AADHAR NUMBER", 
        "MOBILE NUMBER", "EMAIL Address", "ACCOUNT NUMBER", "IFSC CODE", "Employee Type", 
        "Date of Birth", "Joining Date in Service", "Date of Retirement", "Timestamp"
      ];
      sheet.appendRow(headers);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());
    const ehrmsIndex = headers.indexOf("EHRMS CODE");
    const ehrmsCode = payload["EHRMS CODE"];
    
    const timestamp = new Date().toLocaleString();
    payload["Timestamp"] = timestamp;

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][ehrmsIndex].toString() === ehrmsCode.toString()) {
        rowIndex = i + 1;
        break;
      }
    }

    const rowData = headers.map(header => payload[header] || "");

    if (rowIndex !== -1) {
      // Update existing row
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      return createResponse({ status: "success", message: "Data updated successfully", timestamp: timestamp });
    } else {
      // Append new row
      sheet.appendRow(rowData);
      return createResponse({ status: "success", message: "Data saved successfully", timestamp: timestamp });
    }
  } catch (error) {
    return createResponse({ status: "error", message: error.toString() });
  }
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
