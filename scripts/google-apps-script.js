/**
 * ARCHES CRICKET CLUB - Website Backend & Form Handler
 * 
 * Instructions:
 * 1. Create a Google Sheet.
 * 2. In Google Sheets, go to Extensions -> Apps Script.
 * 3. Delete any default code in Code.gs and paste this entire script.
 * 4. Save the project (click the Floppy disk icon).
 * 5. Click "Deploy" -> "New deployment" (top right).
 * 6. Select type: "Web app" (click the gear icon next to "Select type").
 * 7. Set configuration:
 *    - Description: "Arches CC Form Backend"
 *    - Execute as: "Me" (your-google-account)
 *    - Who has access: "Anyone" (crucial to allow website access)
 * 8. Click "Deploy".
 * 9. Copy the "Web app URL" and paste it in config.js in your website repository:
 *    SCRIPT_URL: "https://script.google.com/macros/s/.../exec"
 */

// Handle POST request from the website forms
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    
    if (action === 'register') {
      return handleRegistration(data);
    } else if (action === 'uploadPhoto') {
      return handlePhotoUpload(data);
    } else if (action === 'contact') {
      return handleContact(data);
    } else {
      return createResponse({ result: 'error', error: 'Invalid action: ' + action });
    }
  } catch (err) {
    return createResponse({ result: 'error', error: err.toString() });
  }
}

// Handle GET request (optional, for verification)
function doGet(e) {
  return createResponse({ result: 'success', status: 'Arches CC Website Backend is running!' });
}

// Process Player registrations / Join Club interests
function handleRegistration(data) {
  // Extract info for logging
  var payload = {};
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] !== 'action') {
      payload[keys[i]] = data[keys[i]];
    }
  }
  
  // Log to Sheet
  logToSheet("Registrations", payload);
  
  // Send Email Notification
  var emailRecipient = "archescricketclub@gmail.com";
  var applicantName = data['Full Name'] || (data['First Name'] && data['Last Name'] ? (data['First Name'] + " " + data['Last Name']) : "Anonymous");
  var subject = "🏏 New Registration: " + applicantName + " (" + (data['Source Form'] || "General") + ")";
  
  // Generate HTML Rows for Email
  var keysForEmail = Object.keys(payload);
  var htmlRows = "";
  var emailBodyText = "New Player Registration Details:\n\n";
  
  for (var j = 0; j < keysForEmail.length; j++) {
    var key = keysForEmail[j];
    emailBodyText += key + ": " + payload[key] + "\n";
    htmlRows += "<tr>" +
                "<td style='padding: 10px; border-bottom: 1px solid #eeeeee; font-weight: bold; width: 40%; color: #333333;'>" + key + "</td>" +
                "<td style='padding: 10px; border-bottom: 1px solid #eeeeee; color: #555555;'>" + payload[key] + "</td>" +
                "</tr>";
  }
  
  var htmlBody = 
    "<div style='font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;'>" +
      "<div style='text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 3px solid #ff6b1a;'>" +
        "<h2 style='color: #ff6b1a; margin: 0; font-size: 24px; letter-spacing: 0.5px;'>ARCHES CRICKET CLUB</h2>" +
        "<p style='color: #64748b; margin: 5px 0 0; font-size: 14px; font-weight: 500;'>New Player Registration Received</p>" +
      "</div>" +
      "<div style='background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>" +
        "<table style='width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.5;'>" +
          htmlRows +
        "</table>" +
      "</div>" +
      "<p style='font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px; line-height: 1.4;'>" +
        "This email is automated. Please do not reply directly to this message.<br>" +
        "© 2026 Arches Cricket Club · Victoria Park, Belfast" +
      "</p>" +
    "</div>";
                 
  GmailApp.sendEmail(emailRecipient, subject, emailBodyText, {
    htmlBody: htmlBody
  });
  
  return createResponse({ result: 'success' });
}

// Process Gallery Photo uploads
function handlePhotoUpload(data) {
  var senderName = data.name || "Anonymous";
  var caption = data.caption || "No caption";
  var images = data.images || [];
  
  // Backwards compatibility for single image upload
  if (data.image) {
    images.push({
      data: data.image,
      filename: data.filename || "upload.jpg"
    });
  }
  
  if (images.length === 0) {
    return createResponse({ result: 'error', error: 'No image data provided' });
  }
  
  var fileLinks = [];
  var fileAttachments = [];
  var fileIds = [];
  
  // Save all images to Google Drive and log them
  for (var i = 0; i < images.length; i++) {
    var img = images[i];
    try {
      var fileInfo = saveFileToDrive(img.data, img.filename);
      fileLinks.push(fileInfo.url);
      fileAttachments.push(fileInfo.blob);
      fileIds.push(fileInfo.fileId);
      
      // Log to Sheet (one row per photo)
      var logPayload = {
        "Sender Name": senderName,
        "Caption / Match Details": caption,
        "Google Drive Link": fileInfo.url,
        "File ID": fileInfo.fileId
      };
      logToSheet("Photos", logPayload);
    } catch (err) {
      return createResponse({ result: 'error', error: 'Upload failed on file #' + (i+1) + ': ' + err.toString() });
    }
  }
  
  // Send Email Notification
  var emailRecipient = "archescricketclub@gmail.com";
  var subject = "📸 New Photo Submission: " + senderName + " (" + images.length + " photos)";
  
  var emailBodyText = "New photos submitted to Arches CC gallery!\n\n" +
                      "Sender Name: " + senderName + "\n" +
                      "Caption / Details: " + caption + "\n\n" +
                      "Google Drive Links:\n" + fileLinks.join("\n") + "\n\n" +
                      "The files are attached to this email and saved in Google Drive.";
                  
  var linksHtml = "";
  for (var k = 0; k < fileLinks.length; k++) {
    linksHtml += "<p style='margin: 5px 0;'><strong>Photo " + (k + 1) + ":</strong> <a href='" + fileLinks[k] + "' target='_blank' style='color: #ff6b1a; font-weight: bold;'>View in Google Drive</a></p>";
  }
  
  var htmlBody = 
    "<div style='font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;'>" +
      "<div style='text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 3px solid #ff6b1a;'>" +
        "<h2 style='color: #ff6b1a; margin: 0; font-size: 24px; letter-spacing: 0.5px;'>ARCHES CRICKET CLUB</h2>" +
        "<p style='color: #64748b; margin: 5px 0 0; font-size: 14px; font-weight: 500;'>New Gallery Submission (" + images.length + " photos)</p>" +
      "</div>" +
      "<div style='background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 20px; font-size: 14px; line-height: 1.6; color: #333333;'>" +
        "<p style='margin: 0 0 10px;'><strong>Submitted By:</strong> " + senderName + "</p>" +
        "<p style='margin: 0 0 15px;'><strong>Caption / Details:</strong> " + caption + "</p>" +
        "<div style='margin-top: 20px; padding-top: 15px; border-top: 1px solid #eeeeee;'>" +
          linksHtml +
        "</div>" +
      "</div>" +
      "<p style='font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px; line-height: 1.4;'>" +
        "This submission is logged in Google Sheet under 'Photos'. The images are attached below.<br>" +
        "© 2026 Arches Cricket Club · Victoria Park, Belfast" +
      "</p>" +
    "</div>";
                 
  try {
    GmailApp.sendEmail(emailRecipient, subject, emailBodyText, {
      htmlBody: htmlBody,
      attachments: fileAttachments
    });
  } catch (mailErr) {
    Logger.log("Mail send failed: " + mailErr.toString());
  }
  
  return createResponse({ result: 'success', urls: fileLinks });
}

// Process Contact Message submissions
function handleContact(data) {
  var payload = {};
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] !== 'action') {
      payload[keys[i]] = data[keys[i]];
    }
  }
  
  logToSheet("Contact Messages", payload);
  
  var emailRecipient = "archescricketclub@gmail.com";
  var senderName = (data['First Name'] || "") + " " + (data['Last Name'] || "");
  var subject = "✉️ New Website Message: " + (data['Subject'] || "General Inquiry");
  
  var keysForEmail = Object.keys(payload);
  var htmlRows = "";
  var emailBodyText = "New contact message received:\n\n";
  
  for (var j = 0; j < keysForEmail.length; j++) {
    var key = keysForEmail[j];
    emailBodyText += key + ": " + payload[key] + "\n";
    htmlRows += "<tr>" +
                "<td style='padding: 10px; border-bottom: 1px solid #eeeeee; font-weight: bold; width: 40%; color: #333333;'>" + key + "</td>" +
                "<td style='padding: 10px; border-bottom: 1px solid #eeeeee; color: #555555;'>" + payload[key] + "</td>" +
                "</tr>";
  }
  
  var htmlBody = 
    "<div style='font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;'>" +
      "<div style='text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 3px solid #ff6b1a;'>" +
        "<h2 style='color: #ff6b1a; margin: 0; font-size: 24px; letter-spacing: 0.5px;'>ARCHES CRICKET CLUB</h2>" +
        "<p style='color: #64748b; margin: 5px 0 0; font-size: 14px; font-weight: 500;'>New Website Message Received</p>" +
      "</div>" +
      "<div style='background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>" +
        "<table style='width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.5;'>" +
          htmlRows +
        "</table>" +
      "</div>" +
      "<p style='font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px; line-height: 1.4;'>" +
        "© 2026 Arches Cricket Club · Victoria Park, Belfast" +
      "</p>" +
    "</div>";
                 
  GmailApp.sendEmail(emailRecipient, subject, emailBodyText, {
    htmlBody: htmlBody
  });
  
  return createResponse({ result: 'success' });
}

// Helper: Save Base64 file data to Google Drive
function saveFileToDrive(base64Data, filename) {
  var matches = base64Data.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 data format");
  }
  var contentType = matches[1];
  var rawBase64 = matches[2];
  
  var decodedBytes = Utilities.base64Decode(rawBase64);
  var blob = Utilities.newBlob(decodedBytes, contentType, filename);
  
  var folderName = "Arches CC Gallery Submissions";
  var folders = DriveApp.getFoldersByName(folderName);
  var folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(folderName);
  }
  
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return {
    url: file.getUrl(),
    fileId: file.getId(),
    blob: blob
  };
}

// Helper: Log key-value payload dynamically to a sheet
function logToSheet(sheetName, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  var headers = [];
  if (sheet.getLastColumn() > 0) {
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }
  
  if (headers.indexOf("Timestamp") === -1) {
    headers.unshift("Timestamp");
  }
  
  var keys = Object.keys(data);
  var newHeaders = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (headers.indexOf(key) === -1) {
      newHeaders.push(key);
    }
  }
  
  if (newHeaders.length > 0) {
    headers = headers.concat(newHeaders);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  var rowValues = headers.map(function(header) {
    if (header === "Timestamp") {
      return new Date();
    }
    return data[header] !== undefined ? data[header] : "";
  });
  
  sheet.appendRow(rowValues);
}

// Helper: Generate JSON response with CORS compatibility
function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
