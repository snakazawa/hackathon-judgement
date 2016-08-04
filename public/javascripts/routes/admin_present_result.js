(function () {
    const stubNumberOfPeople = 15,
        enabledMakeStub = false,
        labelTypes = ['success', 'info', 'warning', 'primary'];
        $teams = $('.teams'),
        $legends = $('.legends'),
        $votedNumber = $('.number-of-voted-people'),
        $linkResult = $('.link-result');
    let maxScore, teams, voteItems, usersVotes, teamRankTops;

    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

    const teamTemplate = _.template(`
<div class="panel panel-default team" data-team-id="{{ team._id }}">
  <div class="panel-body">
    <h2 class="team-name">{{ team.name }}</h2>
    <h3 class="team-application-name">{{ team.applicationName }}</h3>
    <div class="score-block"><span class="team-score" data-score="0">0</span> / <span class="max-score">{{ maxScore }}</span></div>
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
                setTimeout(f, 3000);
            } else {
                setTimeout(() => {
                    $linkResult.removeClass('hidden');
                }, 5000);
            }
        }, 3000);
    }, res => console.error(res));

    function initTeamViews() {
        teamRankTops = [];
        teams.forEach(team => {
            const $teamEle = $(teamTemplate({team, labelTypes, voteItems, maxScore}));
            $teams.append($teamEle);
            teamRankTops.push($teamEle.offset().top);
        });

        if (teamRankTops.length) {
            const minTop = teamRankTops[0];
            teamRankTops = teamRankTops.map((top) => top - minTop);
        }
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

        // １ユーザの投票の適用とバーの更新
        userVotes.votes.forEach(({team: {_id: teamId}, voteItems}) => {
            const $team = $teams.find(`.team[data-team-id=${teamId}]`);
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

            $teamScore.attr('data-score', totalScore).fadeOut(400, () => {
                $teamScore.text(totalScore).fadeIn(600);
            });
        });

        // ランキング算出
        const teamScores = _.chain(teams)
            .map(({_id: teamId}, teamIdx) => {
                let $team = $teams.find(`.team[data-team-id=${teamId}]`);
                return {teamIdx, teamId, $team, score: Number($team.find('.team-score').attr('data-score'))};
            })
            .sortBy('score')
            .reverse()
            .value();

        // ランキングによってチーム表示位置の変更
        teamScores.forEach(({$team, teamIdx}, idx) => {
            const transTop = teamRankTops[idx] - teamRankTops[teamIdx];
            $team.css({
                transform: `translateY(${transTop}px)`,
                transition: 'transform 800ms'
            });
        });

        // 投票者リストの更新
        let $enabledNumber = $votedNumber.find('.enabled-number');
        $enabledNumber.fadeOut(400, () => {
            $enabledNumber.text(idx + 1);
            $enabledNumber.fadeIn(500);
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