const api = 'https://api.exchangeratesapi.io/';
let countries = [];

//	Initial Starting Variables
const defaultValueToConvert = 1;
let country1 = 'USD';
let country2 = 'EUR';

$(document).ready(function() {

	//	Setup
	$('#text1').val(defaultValueToConvert);
	initialSetup();

	/*
		Dropdown Handlers
			If dropdown values are the same, they swap and recalculate.
			Updates text above the form.
	*/ 
	$('#drop1').change(function(){
		if ($('#drop1').val() == country2)
			swap();
		else
			updateResults('text2', true);
	});

	$('#drop2').change(function(){
		if ($('#drop2').val() == country1)
			swap();
		else
			updateResults('text2', true);
	});

	/*
		Textbox Handlers
	*/
	$('#text1').keyup(function(){
		updateResults('text2', false);
	});

	$('#text2').keyup(function(){
		updateResults('text1', false);
	});

});


//	Pulls country abbreviations from API and populates the dropdown menus with them
function initialSetup() {
	
	let url = api + 'latest';

	$.ajax({
		type: 'GET',
		url: url,
		success: function(data) {

			//	Store rates for later use to limit API calls
			countries = data.rates;

			//	Add EUR to the list since its base by default and not included in rates
			countries['EUR'] = 1;

			//	Create variable to hold the countries names, to be sorted
			let sortedList = [];

			//	Push country names to sortedList
			$.each(countries, function(key, value) {

				sortedList.push(key);
			});

			//	Sort the list...
			sortedList.sort();
			
			//	Populate the dropdown menus
			for (let i = 0; i < sortedList.length; ++i)
			{
				$('#drop1').append($('<option></option>').val(sortedList[i]).text(sortedList[i]));
				$('#drop2').append($('<option></option>').val(sortedList[i]).text(sortedList[i]));	
			}

			//	Set default values (USD, EUR) to mirror Google
			$("#drop1 option[value='USD']").prop('selected', true);
			$("#drop2 option[value='EUR']").prop('selected', true);

			//	Perform initial calculation
			updateResults('text2', true);
		}, 

		error: function(xhr) {
        	alert('Request Status: ' + xhr.status + '\nStatus Text: ' + xhr.statusText + ' ' + xhr.responseText);
    	}
	});




};

/*	
	Used for updating form data whenever there is a change.

	elem - 			'text1' or 'text2'. Refers to the text box that
					needs to be updated.
	updateText - 	boolean. Only certain changes update the text
					above the form.
*/
function updateResults(elem, updateText) {

	//	Countries to be compared
	country1 = $('#drop1').val();
	country2 = $('#drop2').val();
	let conversionRate = countries[country2]/countries[country1]

	//	CONVERSIONS
		if (elem == 'text1') {
			let ans = 1/conversionRate * $('#text2').val();

			//	Small numbers include 2 significant digits
			if (ans < 1)
				$('#text1').val(ans.toPrecision(2));
			//	Larger numbers are limited to 2 decimal places
			else
				$('#text1').val(ans.toFixed(2));
		}

		if (elem == 'text2') {
			let ans = conversionRate * $('#text1').val();

			if (ans < 1)
				$('#text2').val(ans.toPrecision(2));
			else
				$('#text2').val(ans.toFixed(2));
			}

		// Display text above form, updating countries, values, and times
		if (updateText)
		{
			$('#small-text').text($('#text1').val() + ' ' + country1 + ' equals');
			$('#large-text').text($('#text2').val() + ' ' + country2);
			updateDateTime();
		}	
};

//	Updates date and time
function updateDateTime() {

	let date = new Date($.now());

	let options = {
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
		hour12: true,
		hour: 'numeric',
		minute:'2-digit'
	};

	$('#date-time').text(date.toLocaleTimeString('en-US', options) + ' UTC');
};

//	Swaps countries, then updates values
//	Used for emulating Google's behavior when trying to compare a country to itself
function swap() {
	$('#drop1').val(country2);
	$('#drop2').val(country1);
	updateResults('text2', true);
};