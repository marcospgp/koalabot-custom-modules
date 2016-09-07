/* simple gambling module for KoalaBot
 * !gamble # will gamble that amount.
 */

var modGamble = (function(){

	// adding the command
	apiAddCmd("gamble", "modGamble.gambleCmd", "all", "Gamble some of your points!");

	// private variables
	var _myTab = apiAddTab("Gamble");
	var _gambleSettings = {
		winChance : 40,
		winMult : 2.0
	}
	var _settingsFileName = "modGambleSettings.ini";

	// To save your settings, this isn't intended to be called from outside
	var _saveSettings = function () {
		apiWriteFile( _settingsFileName, JSON.stringify( _gambleSettings ) );
	}

	// load gambling settings, if not create them
	var _settingsFile = apiOpenFile( _settingsFileName );
	if (!_settingsFile) { // if it's null or empty
		_saveSettings();
	} else {
		_gambleSettings = $.parseJSON( _settingsFile ); // load it
	}

	// setting up the module tab
	$(_myTab).html(`<div class="row-fluid">
			<div class="col-sm-12">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h2 class="panel-title">A simple gambling module</h2>
					</div>
					<div class="panel-body">
						<p>
							This module adds a !gamble command to your bot. You set the win
							percentage chance below, and it will automatically both update the
							win percentage and save it to <em>${_settingsFileName}</em>.
						</p>
						<p>
							"Fair" settings would be a 50% win chance and 2x win multiplier.
							The winnings are the user's bet * the multiplier.
						</p>
						<p>
							Usage: !gamble [amount]
						</p>
					</div>
					<ul class="list-group">
						<li class="list-group-item">
							<form class="form-inline" onsubmit="return false;">
								<label class="control-label">Win chance:</label>
								&nbsp;
								<div class="input-group input-group-sm">
									<input type="text" class="form-control" id="modGambleWinChance" size="2">
									<span class="input-group-addon">%</span>
								</div>
							</form>
						</li>
						<li class="list-group-item">
							<form class="form-inline" onsubmit="return false;">
								<label class="control-label">Win multiplier:</label>
								&nbsp;
								<div class="input-group input-group-sm">
									<input type="text" class="form-control" id="modGambleWinMultiplier" size="2">
									<span class="input-group-addon">x</span>
								</div>
							</form>
						</li>
					</ul>
				</div>
			</div>
		</div>`);

	// Listeners and initial value setting
	$("#modGambleWinChance").val(_gambleSettings.winChance); // set it to the proper value
	$("#modGambleWinChance").on( "input", function() { // run this when the textfield changes
		_gambleSettings.winChance = $("#modGambleWinChance").val();
		if ( _gambleSettings.winChance > 100 ) { // error checking
			_gambleSettings.winChance = 100;
			$("#modGambleWinChance").val(_gambleSettings.winChance); // update it to the changed value
		} else if ( _gambleSettings.winChance < 0 ) {
			_gambleSettings.winChance = 0;
			$("#modGambleWinChance").val(_gambleSettings.winChance); // update it to the changed value
		}
		_saveSettings();
	} );

	$("#modGambleWinMultiplier").val(_gambleSettings.winMult); // set it to the proper value
	$("#modGambleWinMultiplier").on( "input", function() { // run this when the textfield changes
		_gambleSettings.winMult = $("#modGambleWinMultiplier").val();
		if ( _gambleSettings.winMult < 1.0 ) {
			_gambleSettings.winMult = 1.0;
			$("#modGambleWinMultiplier").val(_gambleSettings.winMult); // update it to the changed value
		}
		_saveSettings();
	} );

	// The command function
	var _gambleCmd = function (params, from) {

		if ( !params[0] ) {
			return apiSay( `Gamble an amount of ${apiGetPointsUnit()} for a chance to double your bet. Usage: !gamble [amount]` );
		}

		var bet = params[0];

		if ( bet != parseInt(bet, 10) ) {
			return apiSay( `${from}, ${bet} is not a number.` );
		}
		else if ( bet < 1 ) {
			return apiSay( `${from}, you have to bet more than 0 ${apiGetPointsUnit()}!` );
		}
		var totalMoney = apiGetPoints(from);
		if ( bet > totalMoney ) {
			return apiSay( `Sorry ${from}, you don't have enough ${apiGetPointsUnit()}.` );
		}

		var roll = Math.floor((Math.random() * 100) + 1);
		if ( roll >= (100 - _gambleSettings.winChance) ) { // win
			var winnings = parseInt(bet, 10) * _gambleSettings.winMult;
			apiSay( `${from}, you won with a roll of ${roll} and now have ${totalMoney + winnings} ${apiGetPointsUnit()}!` );
			apiModPoints( from, winnings );
		} else { // lose
			var loss = -1 * parseInt(bet, 10);
			apiSay( `${from}, you lost with a roll of ${roll} and now have ${totalMoney + loss} ${apiGetPointsUnit()}.` );
			apiModPoints( from, loss );
		}
	}

	// .gambleCmd() is the only thing in this module accessible from the outside
	return {
		gambleCmd : _gambleCmd
	};

})();
