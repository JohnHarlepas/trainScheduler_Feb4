//Initialize Firebase database
// Initialize Firebase
var config = {
	apiKey: "AIzaSyBM749OULuwePoa2qlSoLyR4Rvb1P-w7E0",
	authDomain: "trainschedule-db94d.firebaseapp.com",
	databaseURL: "https://trainschedule-db94d.firebaseio.com",
	projectId: "trainschedule-db94d",
	storageBucket: "trainschedule-db94d.appspot.com",
	messagingSenderId: "1053370830292"
};
firebase.initializeApp(config);

//Create database variable to create reference to firebase.database().
var database = firebase.database();

var arrMinTrain = 0;

//Show and update current time. Use setInterval method to update time.
function timeNow() {
	setInterval(function () {
		$('#current-time').html(moment().format('hh:mm A'))
	}, 1000);
}
timeNow();


var tableRow = "";
var idKey = "";

//Click event for the submit button. When user clicks Submit button to add a train to the schedule...
$("#submit-button").on("click", function () {

	// Prevent form from submitting
	event.preventDefault();

	//Grab the values that the user enters in the text boxes in the "Add train" section. Store the values in variables.
	var trainName = $("#trainLabel").val().trim();
	var geoLabel = $("#geoLabel").val().trim();
	var alphaTrain = $("#first-train-time").val().trim();
	var trnFreq = $("#frequency").val().trim();

	//Print the values that the user enters in the text boxes to the console for debugging purposes.
	console.log(trainName);
	console.log(geoLabel);
	console.log(alphaTrain);
	console.log(trnFreq);



	//Form validation for user input values. To add a train, all fields are required.
	//Check that all fields are filled out.
	if (trainName === "" || geoLabel === "" || alphaTrain === "" || trnFreq === "") {
		$("#noMilTime").empty();
		$("#misField").html("ALL fields are required to add a train to the schedule.");
		return false;
	}

	//Check to make sure that there are no null values in the form.
	else if (trainName === null || geoLabel === null || alphaTrain === null || trnFreq === null) {
		$("#noMilTime").empty();
		$("#noNum").empty();
		$("#misField").html("ALL fields are required to add a train to the schedule.");
		return false;
	}

	//Check that the user enters the first train time as military time.
	else if (alphaTrain.length !== 5 || alphaTrain.substring(2, 3) !== ":") {
		$("#misField").empty();
		$("#noNum").empty();
		$("#noMilTime").html("Time must be in military format: HH:mm. For example, 15:00.");
		return false;
	}

	//Check that the user enters a number for the Frequency value.
	else if (isNaN(trnFreq)) {
		$("#misField").empty();
		$("#noMilTime").empty();
		$("#noNum").html("Not a number. Enter a number (in minutes).");
		return false;
	}

	//If form is valid, perform time calculations and add train to the current schedule.
	else {
		$("#noMilTime").empty();
		$("#misField").empty();
		$("#noNum").empty();

		//Moment JS math caclulations to determine train next arrival time and the number of minutes away from geoLabel.
		// First Time (pushed back 1 year to make sure it comes before current time)
		var frstTimeConv = moment(alphaTrain, "hh:mm").subtract(1, "years");
		console.log(frstTimeConv);

		// Current Time
		var nowTime = moment();
		console.log("CURRENT TIME: " + moment(nowTime).format("hh:mm"));

		// Difference between the times
		var minTime = moment().diff(moment(frstTimeConv), "minutes");
		console.log("DIFFERENCE IN TIME: " + minTime);

		// Time apart (remainder)
		var apartTime = minTime % trnFreq;
		console.log(apartTime);

		// Minute Until Train
		var arrMinTrain = trnFreq - apartTime;
		console.log("MINUTES TILL TRAIN: " + arrMinTrain);

		// Next Train
		var incomingTrn = moment().add(arrMinTrain, "minutes").format("hh:mm A");
		console.log("ARRIVAL TIME: " + moment(incomingTrn).format("hh:mm"));

		//Create local temporary object for holding train data
		var newTrain = {
			trainName: trainName,
			geoLabel: geoLabel,
			alphaTrain: alphaTrain,
			trnFreq: trnFreq,
			incomingTrn: incomingTrn,
			arrMinTrain: arrMinTrain,
			nowTime: nowTime.format("hh:mm A")
		};

		//Save/upload train data to the database.
		database.ref().push(newTrain);

		//Log everything to console for debugging purposes.
		console.log("name of train in database: " + newTrain.trainName);
		console.log("geoLabel in database: " + newTrain.geoLabel);
		console.log("first train time in database: " + newTrain.alphaTrain);
		console.log("train frequency in database: " + newTrain.trnFreq);
		console.log("next train in database: " + newTrain.incomingTrn);
		console.log("minutes away in database: " + newTrain.arrMinTrain);
		console.log("current time in database: " + newTrain.nowTime);

		//Confirmation modal that appears when user submits form and train is added successfully to the schedule.
		$(".addTrnMod").html("<p>" + newTrain.trainName + " added to schedule.");
		$('#addTrn').modal();

		//Remove the text from the form boxes after user presses the add to schedule button.
		$("#trainLabel").val("");
		$("#geoLabel").val("");
		$("#first-train-time").val("");
		$("#frequency").val("");
	}
});


// At the initial load and subsequent value changes, get a snapshot of the stored data.
// This function allows you to update the page in real-time when the firebase database changes.
database.ref().on("child_added", function (childSnapshot, prevChildKey) {
	console.log(childSnapshot.val());

	//this is where the "id" is located for each new entry into the database
	console.log(prevChildKey);

	//Set variables for form input field values equal to the stored values in firebase.
	var trainName = childSnapshot.val().trainName;
	var geoLabel = childSnapshot.val().geoLabel;
	var alphaTrain = childSnapshot.val().alphaTrain;
	var trnFreq = childSnapshot.val().trnFreq;
	var incomingTrn = childSnapshot.val().incomingTrn;
	var arrMinTrain = childSnapshot.val().arrMinTrain;
	var nowTime = childSnapshot.val().nowTime;

	//Train info
	console.log(trainName);
	console.log(geoLabel);
	console.log(alphaTrain);
	console.log(incomingTrn);
	console.log(arrMinTrain);
	console.log(trnFreq);
	console.log(nowTime);

	//Moment JS math caclulations to determine train next arrival time and the number of minutes away from geoLabel.
	// First Time (pushed back 1 year to make sure it comes before current time)
	var frstTimeConv = moment(alphaTrain, "hh:mm").subtract(1, "years");
	console.log(frstTimeConv);

	// Current Time
	var nowTime = moment();
	console.log("CURRENT TIME: " + moment(nowTime).format("hh:mm"));

	// Difference between the times
	var minTime = moment().diff(moment(frstTimeConv), "minutes");
	console.log("DIFFERENCE IN TIME: " + minTime);

	// Time apart (remainder)
	var apartTime = minTime % trnFreq;
	console.log(apartTime);

	// Minute Until Train
	var arrMinTrain = trnFreq - apartTime;
	console.log("MINUTES TILL TRAIN: " + arrMinTrain);

	// Next Train
	var incomingTrn = moment().add(arrMinTrain, "minutes").format("hh:mm A");
	console.log("ARRIVAL TIME: " + moment(incomingTrn).format("hh:mm"));


	//Update the HTML (schedule table) to reflect the latest stored values in the firebase database.
	var tableRow = $("<tr>");
	var trnTd = $("<td>").text(trainName);
	var dstTd = $("<td>").text(geoLabel);
	var incTrnTd = $("<td>").text(incomingTrn);
	var trnFrqTd = $("<td>").text(trnFreq);
	var arrMnTrTd = $("<td>").text(arrMinTrain);

	// Append the newly created table data to the table row.
	//Append trash can icon to each row so that user can delete row if needed.

	// tableRow.append("<img src='assets/media/images/close-window-48.png' alt='trash can' class='trash-can mr-3'>", trnTd, dstTd, trnFrqTd, incTrnTd, arrMnTrTd);

	//allows you to use icons from font aweseome 5 as the button but you must make an id and change the button's class to an id
	tableRow.append("<i class='	fas fa-comment-slash' id='hot'></i>", trnTd, dstTd, trnFrqTd, incTrnTd, arrMnTrTd);
	// Append the table row to the table body
	$("#schedule-body").append(tableRow);
});


//Click event for red "delete all trains" button. When user clicks on button, all trains are deleted from page and database
$("body").on("click", "#deleteAll", function () {
	// Prevent form from submitting
	event.preventDefault();

	//confirm with the user before he or she decides to actually delete the train data.
	var accptDel = confirm("Deleting a train permanently removes the train from the system. Are you sure you want to delete this train?");
	//To do: Replace alert with modal... Confirmation modal that appears when user wants to remove train from schedule.
	//$(".remove-train-modal").html("<p>" + " Deleting a train permanently removes the train from the system. Are you sure you want to delete this train?" + "</p>");
	//$('#removeTrain').modal();
	//If user confirms...
	if (accptDel) {
		//Remove the closest table row.
		$(this).closest('tr').remove();
		//To do: Remove train info from db.
		// idKey = $(this).parent().attr('id');
		// console.log(idKey);
		// // dataRef.child(key).remove();
		// // database.ref().child(idKey).remove();

		var delAll = $(this).attr('deleteAll');
		database.ref(delAll).remove();
		location.reload();




	}

	else {
		return;
	}
});


//Click event for trash can icon/button. When user clicks trash can to remove a train from the schedule...
$("body").on("click", "#hot", function () {
	// Prevent form from submitting
	event.preventDefault();

	//confirm with the user before he or she decides to actually delete the train data.
	var accptDel = confirm("Deleting a train permanently removes the train from the system. Are you sure you want to delete this train?");
	//To do: Replace alert with modal... Confirmation modal that appears when user wants to remove train from schedule.
	//$(".remove-train-modal").html("<p>" + " Deleting a train permanently removes the train from the system. Are you sure you want to delete this train?" + "</p>");
	//$('#removeTrain').modal();
	//If user confirms...
	if (accptDel) {
		//Remove the closest table row.
		$(this).closest('tr').remove();
		//To do: Remove train info from db.
		// idKey = $(this).parent().attr('id');
		// console.log(idKey);
		// // dataRef.child(key).remove();
		// // database.ref().child(idKey).remove();

	}

	else {
		return;
	}
});

//One way to initialize all tooltips on a page would be to select them by their data-toggle attribute:
$(function () {
	$('[data-toggle="tooltip"]').tooltip()
})

