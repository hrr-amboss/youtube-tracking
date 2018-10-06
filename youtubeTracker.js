// First iteration - needs Code review
var sheet = SpreadsheetApp.getActive().getSheetByName('overview');
var alertVids = {id: [], upload: [], privacy: [], title: []}; // Alert videos object, collects all suspicious videos
var idList = sheet.getDataRange().getValues();
var youTubePrefix = "https://www.youtube.com/watch?v=";

var rawData = SpreadsheetApp.getActive().getSheetByName('rawdata');
var sheetList = sheet.getDataRange().getValues();
var rawDataList = rawData.getDataRange().getValues();

/*
function importRawData() {
  for (i = 1; i < rawDataList.length; i++) {   
    var youTubeLink = rawData.getRange("A"+i).getValue();
    var youTubeId = youTubeLink.slice(39,50);
    sheet.getRange("A"+i).setValue(youTubeId)
  }
}
*/

function getYoutube() {
  var row = 2; // Column the values should be listed left to right
  var idList = sheet.getDataRange().getValues();
  for (i = 0; i < idList.length-1; i++)
    {
    var vid = sheet.getRange("A"+row).getValue();
    var youTubeId = vid.slice(39,50);
    var youTubeVideo = YouTube.Videos.list('status, snippet', {id: youTubeId});
    var currentVideo = youTubeVideo.items[0];
    var uploadStatus = currentVideo.status.uploadStatus;
    var privacyStatus = currentVideo.status.privacyStatus;
    var videoTitle = currentVideo.snippet.title;
    var alertMailStatusRow = sheet.getRange(row,5);
    var alertMailStatus = alertMailStatusRow.getValue();
    sheet.getRange(row,2).setValue(uploadStatus);
    sheet.getRange(row,3).setValue(privacyStatus);
    sheet.getRange(row,4).setValue(videoTitle);
      if (uploadStatus == "deleted" || privacyStatus == "private" || privacyStatus == "unlisted" && alertMailStatus == "")
        {                  
         alertVids.id.push(youTubeId);
         alertVids.upload.push(uploadStatus);
         alertVids.privacy.push(privacyStatus);
         alertVids.title.push(videoTitle);
         sheet.getRange("C"+row).setBackground("#EC7676");
         alertMailStatusRow.setValue("x") // set Notification status to "sent"      
        }
    row++;
  
    }
    sendMail();
}

function clearStatus() {
  var idList = sheet.getDataRange().getValues();
  var row = 2;
  var deleteColumn = [2,3,4,5];
   for (i = 0; i < idList.length-1; i++)
    {
      for (ii = 0; ii < deleteColumn.length; ii++)
      {
        sheet.getRange(row,deleteColumn[ii]).setValue("").setBackground("white");
      }
    row++;
    }
}


function sendMail(){
  var userList = sheet.getDataRange().getValues();
//  var adressColumn = sheet.getRange(i,9).getValues();
  var mailtoAdresses = "";
  var mailTitle = "[Notification] New status change in YouTube videos in ribosom";
  var mailMessage = "Hey, \n\nthe following videos inside ribosom DE or US have changed status. Please go and check! \n\n";
  for (i = 0; i < alertVids.id.length; i++){
    mailMessage += "Title : " + alertVids.title[i] + "\nLink : " + youTubePrefix + alertVids.id[i] + "\nUpload status: " + alertVids.upload[i] + "\nPrivacy status: " + alertVids.privacy[i] + "\n\n";
  }      

  for (i = 2; i < idList.length; i++) { 
    var mailAdress = sheet.getRange(i,9).getValue();
    if (mailAdress != "") {
        mailtoAdresses += mailAdress + ",";
       }
     }
  mailMessage += "\n\nThis is an automated notification. For any questions reach out to hrr@amboss.com or jdl@amboss.com go to this document to check: https://docs.google.com/spreadsheets/d/1T39UFVpjJrqb2voPokFPwxy7EAGHH_JaumEw5ZcM8gg/edit?usp=sharing \n\n\nKind regards\nA google app script";
 MailApp.sendEmail(mailtoAdresses, mailTitle, mailMessage);
}


