/* duel module for KoalaBot
 * !duel [username] [amount] - Send a duel challenge to a user.
 * !cancelduel [username]    - Cancel a duel challenge made by you to a user.
 * !cancelallduels           - Cancel all duel challenges made by you.
 * !acceptduel [username]    - Accept duel challenge from a user.
 * !rejectduel [username]    - Reject a duel challenge from a user.
 */

var modDuel = (function(){

	// Add the commands
	apiAddCmd("duel", "modDuel.duelCmd", "all", "Send a duel challenge to a user. Usage: !duel [username] [amount] \n Use \"!cancelduel [username]\" to cancel a duel challenge made by you to a user and \"!acceptduel [username]\" or \"!rejectduel [username]\" to either accept or reject a duel challenge from a user.");
	apiAddCmd("cancelduel", "modDuel.cancelduelCmd", "all", "Cancel a duel challenge made by you to a user. Usage: !cancelduel [username]");
	apiAddCmd("cancelallduels", "modDuel.cancelallduelsCmd", "all", "Cancel all duel challenges made by you.");
	apiAddCmd("acceptduel", "modDuel.acceptduelCmd", "all", "Accept duel challenge from a user. Usage: !acceptduel [username]");
	apiAddCmd("rejectduel", "modDuel.rejectduelCmd", "all", "Reject a duel challenge from a user. Usage: !rejectduel [username]");

	// Add module tab
	var _myTab = apiAddTab("Duel");
	$(_myTab).html(`<div class="row-fluid"><div class="col-sm-12"><div class="panel panel-default">
		<div class="panel-heading">
			<h2 class="panel-title">Duel module</h2>
		</div>
		<div class="panel-body">
			<p>
				Usage:<br>
				&nbsp;&nbsp; !duel [username] [amount] - Send a duel challenge to a user.<br>
				&nbsp;&nbsp; !cancelduel [username] - Cancel a duel challenge made by you to a user.<br>
				&nbsp;&nbsp; !cancelallduels [username] - Cancel all duel challenges made by you.<br>
				&nbsp;&nbsp; !acceptduel [username] - Accept duel challenge from a user.<br>
				&nbsp;&nbsp; !rejectduel [username] - Reject a duel challenge from a user.
			</p>
		</div></div></div></div>`);

	// Private variables
	var _duels = {}; // Format: _duels[challengerUsername][challengedUsername] = challengeAmount

	// The command function
	var _duelCmd = function (params, from, mod, subscriber) {

		// params[0] = challenged user, params[1] = challenge amount

		if (!params[0]) {

			return apiSay("Send a duel challenge to a user. Usage: !duel [username] [amount], !cancelduel [username], !cancelallduels, !acceptduel [username], !rejectduel [username]");

		} else if (!params[1]) {

			return apiSay(`${from}, you must choose an amount.`);

		} else if (!apiGetPoints(params[0])) {

			return apiSay(`${from}, the user you're trying to challenge doesn't exist.`);

		} else if (!parseInt(params[1], 10) || parseInt(params[1], 10) < 1) {

			return apiSay(`${from}, you have to bet more than 0 ${apiGetPointsUnit()}!`);

		} else if (from == params[0]) {

			return apiSay(`${from}, you can't challenge yourself!`);
		}

		// Command is valid, let's proceed

		var target = params[0], amount = parseInt(params[1], 10), balance = apiGetPoints(from);

		if (_duels.hasOwnProperty(from) && _duels[from].hasOwnProperty(target)) {

			return apiSay(`${from}, you already sent a duel request to that user. To cancel your previous challenge, use !cancelduel [username].`);

		} else if (!balance || !amount || balance < amount) {

			return apiSay(`${from}, you don't have enough ${apiGetPointsUnit()} to make that challenge.`);

		} else {

			// Create challenge

			if (!_duels.hasOwnProperty(from)) {
				_duels[from] = {};
			}

			_duels[from][target] = amount;

			return apiSay(`${from}, you have challenged ${target} for ${amount} ${apiGetPointsUnit()}.`);
		}
	}

	var _cancelduelCmd = function (params, from, mod, subscriber) {

		if (!params[0]) {
			return apiSay("Cancel a duel challenge made to a user. Usage: !cancelduel [username]");
		}

		var target = params[0];

		if (!_duels.hasOwnProperty(from) || !_duels[from].hasOwnProperty(target)) {

			return apiSay(`${from}, you have no active challenges for that user.`);

		} else {

			delete _duels[from][target];

			return apiSay(`${from}, your challenge has been successfully cancelled.`);
		}
	}

	var _cancelallduelsCmd = function (params, from, mod, subscriber) {

		if (!_duels.hasOwnProperty(from)) {

			return apiSay(`${from}, you have no active challenges.`);

		} else {

			for (var duel in _duels[from]) {

				delete _duels[from][duel];
			}

			return apiSay(`${from}, all your challenges have been successfully cancelled.`);
		}
	}

	var _acceptduelCmd = function (params, from, mod, subscriber) {

		if (!params[0]) {

			return apiSay("Accept a duel challenge from a user. Usage: !acceptduel [username]");
		}

		var challenger = params[0], challengerBalance = apiGetPoints(params[0]), challengedBalance = apiGetPoints(from);

		// Check if challenge exists and is valid
		if (!_duels.hasOwnProperty(challenger) || !_duels[challenger].hasOwnProperty(from) || !parseInt(_duels[challenger][from], 10) || _duels[challenger][from] < 1) {

			return apiSay(`${from}, you have no current challenges from that user.`);
		}

		var amount = _duels[challenger][from];

		// Check if both users have enough balance
		if (!challengerBalance || !challengedBalance || challengerBalance < amount || challengedBalance < amount) {

			return apiSay(`${from}, either you or your challenger don't have enough ${apiGetPointsUnit()} for the challenge to be accepted.`);
		}

		// Everything is okay, run the duel

		apiSay(`${from}, you have successfully accepted ${challenger}'s challenge. Running duel!`);

		delete _duels[challenger][from];

		var roll = Math.floor((Math.random() * 100) + 1); // Roll 0 to 49 - challenged wins. Roll 50 - draw. Roll 51 to 100 - challenger wins

		if ( roll >= 51 ) {

			var winnings = amount;

			apiSay( `${from}, you won against ${challenger} with a roll of ${roll} and now have ${challengedBalance + amount} ${apiGetPointsUnit()}!` );
			apiModPoints( from, amount );
			apiModPoints( challenger, -amount );

		} else if (roll > 49) { // Draw

			apiSay( `${from}, you drew against ${challenger} with a roll of ${roll} and kept all your ${apiGetPointsUnit()}.` );

		} else { // if roll <= 49

			apiSay( `${from}, you lost against ${challenger} with a roll of ${roll} and now have ${challengedBalance - amount} ${apiGetPointsUnit()}.` );
			apiModPoints( from, -amount );
			apiModPoints( challenger, amount );
		}
	}

	var _rejectduelCmd = function (params, from, mod, subscriber) {

		if (!params[0]) {

			return apiSay("Reject a duel challenge from a user. Usage: !rejectduel [username]");
		}

		var challenger = params[0];

		// Check if challenge exists
		if (!_duels.hasOwnProperty(challenger) || !_duels[challenger].hasOwnProperty(from)) {

			return apiSay(`${from}, you have no current challenges from that user.`);
		} else {

			delete _duels[challenger][from];

			return apiSay(`${from}, you have successfully rejected ${challenger}'s challenge.`);
		}
	}

	// Expose module properties
	return {
		duelCmd: _duelCmd,
		cancelduelCmd: _cancelduelCmd,
		cancelallduelsCmd: _cancelallduelsCmd,
		acceptduelCmd: _acceptduelCmd,
		rejectduelCmd: _rejectduelCmd
	};

})();
