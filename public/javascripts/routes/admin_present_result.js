(function () {
    const stubNumberOfPeople = 15,
        enabledMakeStub = true,
        labelTypes = ['success', 'info', 'warning', 'primary'];
        $teams = $('.teams'),
        $legends = $('.legends'),
        $votedNumber = $('.number-of-voted-people');
    let maxScore, teams, voteItems, usersVotes;

    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

    const teamTemplate = _.template(`
<div class="panel panel-default team" data-team-id="{{ team._id }}">
  <div class="panel-body">
    <h2>{{ team.name }}</h2>
    <div class="score-block"><span class="team-score">0</span> / <span class="max-score">{{ maxScore }}</span></div>
    <div class="progress">
      <% _.forEach(voteItems, (voteItem, idx) => { %>
      <div class="progress-bar progress-bar-{{ labelTypes[idx] }}" style="width: 0%" data-vote-item-id="{{ voteItem._id }}" data-vote-item-score="0">0</div>
      <% }); %>
    </div>
  </div>
</div>
`);

    const legendTemplate = _.template(`<li><span class="label label-{{ type }}">{{ text }}</span></li>`);

    fetchVotes().then(res => {
        ({teams, voteItems, usersVotes} = res);
        enabledMakeStub && makeStub();
        maxScore = calcMaxScore();
        initLegends();
        initTeamViews();
        initVotedNumber();

        let idx = 0;
        setTimeout(function f() {
            applyVote(usersVotes[idx], idx);
            if (++idx < usersVotes.length) {
                setTimeout(f, 2000);
            }
        }, 2000);
    }, res => console.error(res));

    function initTeamViews() {
        teams.forEach(team => {
            const $teamEle = $(teamTemplate({team, labelTypes, voteItems, maxScore}));
            $teams.append($teamEle);
        });
    }

    function initLegends() {
        voteItems.forEach((voteItem, idx) => {
            const labelEle = legendTemplate({type: labelTypes[idx], text: voteItem.name});
            $legends.append(labelEle);
        });
    }

    function initVotedNumber() {
        $votedNumber.find('.enabled-number').text(0);
        $votedNumber.find('.max-number').text(usersVotes.length);
        usersVotes.forEach(() => {
            $votedNumber.append(`<i class="glyphicon glyphicon-user disabled"></i>`);
        });
    }

    function applyVote(userVotes, idx) {
        const oneItemMaxScore = maxScore / voteItems.length;

        userVotes.votes.forEach(({team: {_id: teamId}, voteItems}) => {
            const $team = $(`.team[data-team-id=${teamId}]`);
            let totalScore = 0;

            voteItems.forEach(({item: {_id: itemId}, value}) => {
                const $item = $team.find(`.progress-bar[data-vote-item-id=${itemId}]`);
                const beforeScore = Number($item.attr('data-vote-item-score'));
                const currentScore = beforeScore + value;
                totalScore += currentScore;
                $item
                    .attr('data-vote-item-score', currentScore)
                    .width((currentScore / oneItemMaxScore / voteItems.length * 100) + '%')
                    .text(currentScore);
            });

            const $teamScore = $team.find('.team-score');

            $teamScore.fadeOut(200, () => {
                $teamScore.text(totalScore);
                $teamScore.fadeIn(300);
            });
        });

        let $enabledNumber = $votedNumber.find('.enabled-number');
        $enabledNumber.fadeOut(200, () => {
            $enabledNumber.text(idx + 1);
            $enabledNumber.fadeIn(300);
        });

        $votedNumber.find('i').eq(idx).removeClass('disabled');
    }

    function calcMaxScore() {
        return voteItems.length * usersVotes.length * 4;
    }

    function fetchVotes() {
        return $.ajax({
            type: 'get',
            url: '/api/teams/votes'
        });
    }

    function makeStub() {
        usersVotes.splice(0, usersVotes.length);

        _.range(stubNumberOfPeople).forEach(() => {
            const votes = [];

            teams.forEach(team => {
                const teamVotes = [];

                voteItems.forEach(voteItem => {
                    teamVotes.push({item: voteItem, value: _.random(1, 4)});
                });

                votes.push({team, voteItems: teamVotes});
            });

            usersVotes.push({user: {}, votes});
        });
    }
}());